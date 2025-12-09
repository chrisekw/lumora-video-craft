import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
    <div className="flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Video Preview */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
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
                fontSize: `clamp(12px, ${overlay.fontSize * 0.5}px, ${overlay.fontSize}px)`,
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

      {/* Timeline Controls */}
      <div className="p-3 sm:p-4 border-t">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => seekTo(Math.max(0, currentTime - 10))}>
              <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="default" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-primary" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => seekTo(Math.min(duration, currentTime + 10))}>
              <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={([value]) => seekTo(value)}
              className="flex-1"
            />
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Editor Panels - Responsive Layout */}
      <div className="flex flex-col lg:flex-row border-t min-h-[300px] lg:min-h-[320px]">
        {/* Left Panel - Timeline & Tracks */}
        <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r p-3 sm:p-4">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">Timeline</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            <div className="h-7 sm:h-8 bg-primary/20 rounded flex items-center px-2 text-xs sm:text-sm whitespace-nowrap shrink-0">
              Video Track
            </div>
            {audioTracks.map(track => (
              <div key={track.id} className="h-7 sm:h-8 bg-secondary/50 rounded flex items-center px-2 text-xs sm:text-sm whitespace-nowrap shrink-0">
                {track.name}
              </div>
            ))}
            {textOverlays.map(overlay => (
              <div 
                key={overlay.id} 
                className={`h-6 bg-accent/30 rounded flex items-center px-2 text-xs cursor-pointer hover:bg-accent/50 whitespace-nowrap shrink-0 ${
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
        <div className="flex-1 p-3 sm:p-4 overflow-auto">
          <Tabs defaultValue="text" className="h-full">
            <TabsList className="grid w-full grid-cols-4 h-8 sm:h-10">
              <TabsTrigger value="text" className="text-xs sm:text-sm">Text</TabsTrigger>
              <TabsTrigger value="video" className="text-xs sm:text-sm">Video</TabsTrigger>
              <TabsTrigger value="audio" className="text-xs sm:text-sm">Audio</TabsTrigger>
              <TabsTrigger value="export" className="text-xs sm:text-sm">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm sm:text-base">Text Overlays</h4>
                <Button size="sm" onClick={addTextOverlay} className="text-xs sm:text-sm h-7 sm:h-8">Add Text</Button>
              </div>
              
              {selectedOverlay && (
                <Card>
                  <CardContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Text</Label>
                      <Textarea
                        value={selectedOverlay.text}
                        onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { text: e.target.value })}
                        className="mt-1 text-sm"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Font Size</Label>
                        <Slider
                          value={[selectedOverlay.fontSize]}
                          min={12}
                          max={72}
                          step={1}
                          onValueChange={([value]) => handleTextOverlayUpdate(selectedOverlay.id, { fontSize: value })}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm">Color</Label>
                        <Input
                          type="color"
                          value={selectedOverlay.color}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { color: e.target.value })}
                          className="mt-1 h-8 sm:h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Start (s)</Label>
                        <Input
                          type="number"
                          value={selectedOverlay.startTime}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { startTime: parseFloat(e.target.value) })}
                          className="mt-1 h-8 sm:h-9 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm">End (s)</Label>
                        <Input
                          type="number"
                          value={selectedOverlay.endTime}
                          onChange={(e) => handleTextOverlayUpdate(selectedOverlay.id, { endTime: parseFloat(e.target.value) })}
                          className="mt-1 h-8 sm:h-9 text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="video" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <h4 className="font-medium text-sm sm:text-base">Video Filters</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">Brightness</Label>
                  <Slider
                    value={videoFilters.brightness}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, brightness: value }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm">Contrast</Label>
                  <Slider
                    value={videoFilters.contrast}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, contrast: value }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm">Saturation</Label>
                  <Slider
                    value={videoFilters.saturation}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, saturation: value }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm">Blur</Label>
                  <Slider
                    value={videoFilters.blur}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setVideoFilters(prev => ({ ...prev, blur: value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <h4 className="font-medium text-sm sm:text-base">Audio Tracks</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">Master Volume</Label>
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
                    className="mt-2"
                  />
                </div>
                
                {audioTracks.map(track => (
                  <Card key={track.id}>
                    <CardContent className="pt-3 sm:pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-xs sm:text-sm">{track.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
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

            <TabsContent value="export" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <h4 className="font-medium text-sm sm:text-base">Export Options</h4>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button onClick={() => onExport('mp4')} className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm bg-gradient-primary">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>MP4</span>
                </Button>
                
                <Button onClick={() => onExport('gif')} variant="outline" className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>GIF</span>
                </Button>
                
                <Button onClick={onShare} variant="outline" className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm">
                  <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Share</span>
                </Button>
                
                <Button onClick={handleSave} variant="outline" className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Save</span>
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