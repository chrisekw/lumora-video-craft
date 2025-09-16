import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Download, Share, Save } from 'lucide-react';

interface VideoEditorProps {
  videoUrl: string;
  onSave: (editedData: any) => void;
  onExport: (format: string) => void;
  onShare: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ 
  videoUrl, 
  onSave, 
  onExport, 
  onShare 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([100]);

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState([
    { id: 1, text: 'Sample Title', x: 50, y: 20, fontSize: 32, color: '#ffffff', startTime: 0, endTime: 3 }
  ]);
  const [selectedOverlay, setSelectedOverlay] = useState(textOverlays[0]);

  // Style customization state
  const [videoFilters, setVideoFilters] = useState({
    brightness: [100],
    contrast: [100],
    saturation: [100],
    blur: [0]
  });

  // Audio state
  const [audioTracks, setAudioTracks] = useState([
    { id: 'main', name: 'Main Audio', volume: 100, enabled: true },
    { id: 'bg', name: 'Background Music', volume: 50, enabled: true }
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTextOverlayUpdate = (id: number, updates: Partial<typeof selectedOverlay>) => {
    setTextOverlays(prev => 
      prev.map(overlay => 
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
    if (selectedOverlay.id === id) {
      setSelectedOverlay(prev => ({ ...prev, ...updates }));
    }
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      startTime: currentTime,
      endTime: currentTime + 2
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlay(newOverlay);
  };

  const applyVideoFilter = () => {
    const video = videoRef.current;
    if (!video) return;

    const filterString = `
      brightness(${videoFilters.brightness[0]}%)
      contrast(${videoFilters.contrast[0]}%)
      saturate(${videoFilters.saturation[0]}%)
      blur(${videoFilters.blur[0]}px)
    `;
    video.style.filter = filterString;
  };

  useEffect(() => {
    applyVideoFilter();
  }, [videoFilters]);

  const handleSave = () => {
    const editedData = {
      textOverlays,
      videoFilters,
      audioTracks,
      duration,
      lastModified: new Date().toISOString()
    };
    onSave(editedData);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Video Preview */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Text Overlays */}
        {textOverlays.map(overlay => (
          currentTime >= overlay.startTime && currentTime <= overlay.endTime && (
            <div
              key={overlay.id}
              className="absolute pointer-events-none"
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                fontSize: `${overlay.fontSize}px`,
                color: overlay.color,
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {overlay.text}
            </div>
          )
        ))}
      </div>

      {/* Timeline */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => seekTo(Math.max(0, currentTime - 10))}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => seekTo(Math.min(duration, currentTime + 10))}>
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={([value]) => seekTo(value)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="flex h-80 border-t">
        {/* Left Panel - Timeline & Tracks */}
        <div className="w-1/3 border-r p-4">
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-2">
            <div className="h-8 bg-primary/20 rounded flex items-center px-2 text-sm">
              Video Track
            </div>
            {audioTracks.map(track => (
              <div key={track.id} className="h-8 bg-secondary/50 rounded flex items-center px-2 text-sm">
                {track.name}
              </div>
            ))}
            {textOverlays.map(overlay => (
              <div 
                key={overlay.id} 
                className={`h-6 bg-accent/30 rounded flex items-center px-2 text-xs cursor-pointer hover:bg-accent/50 ${
                  selectedOverlay.id === overlay.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedOverlay(overlay)}
              >
                {overlay.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="text" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Text Overlays</h4>
                <Button size="sm" onClick={addTextOverlay}>Add Text</Button>
              </div>
              
              {selectedOverlay && (
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <Label>Text</Label>
                      <Textarea
                        value={selectedOverlay.text}
                        onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { text: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Font Size</Label>
                        <Slider
                          value={[selectedOverlay.fontSize]}
                          min={12}
                          max={72}
                          step={1}
                          onValueChange={([value]) => handleTextOverlayUpdate(selectedOverlay.id, { fontSize: value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={selectedOverlay.color}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { color: e.target.value })}
                          className="mt-1 h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time (s)</Label>
                        <Input
                          type="number"
                          value={selectedOverlay.startTime}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { startTime: parseFloat(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>End Time (s)</Label>
                        <Input
                          type="number"
                          value={selectedOverlay.endTime}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { endTime: parseFloat(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <h4 className="font-medium">Video Filters</h4>
              
              <div className="space-y-4">
                <div>
                  <Label>Brightness</Label>
                  <Slider
                    value={videoFilters.brightness}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, brightness: value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Contrast</Label>
                  <Slider
                    value={videoFilters.contrast}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, contrast: value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Saturation</Label>
                  <Slider
                    value={videoFilters.saturation}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, saturation: value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Blur</Label>
                  <Slider
                    value={videoFilters.blur}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, blur: value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <h4 className="font-medium">Audio Tracks</h4>
              
              <div className="space-y-4">
                <div>
                  <Label>Master Volume</Label>
                  <Slider
                    value={volume}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value);
                      if (videoRef.current) {
                        videoRef.current.volume = value[0] / 100;
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                
                {audioTracks.map(track => (
                  <Card key={track.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{track.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioTracks(prev => 
                              prev.map(t => 
                                t.id === track.id ? { ...t, enabled: !t.enabled } : t
                              )
                            );
                          }}
                        >
                          {track.enabled ? 'Mute' : 'Unmute'}
                        </Button>
                      </div>
                      
                      <Slider
                        value={[track.volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => {
                          setAudioTracks(prev => 
                            prev.map(t => 
                              t.id === track.id ? { ...t, volume: value } : t
                            )
                          );
                        }}
                        disabled={!track.enabled}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <h4 className="font-medium">Export Options</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => onExport('mp4')} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export MP4</span>
                </Button>
                
                <Button onClick={() => onExport('gif')} variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export GIF</span>
                </Button>
                
                <Button onClick={onShare} variant="outline" className="flex items-center space-x-2">
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                
                <Button onClick={handleSave} variant="outline" className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Project</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;