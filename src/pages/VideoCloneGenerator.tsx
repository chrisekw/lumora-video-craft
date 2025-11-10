import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LoadingAnimation from "@/components/LoadingAnimation";
import { 
  ArrowLeft, 
  Upload, 
  Video, 
  Sparkles, 
  Play,
  Download,
  Share2
} from "lucide-react";

const VideoCloneGenerator = () => {
  const [sampleVideo, setSampleVideo] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [shortClip, setShortClip] = useState<File | null>(null);
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload MP4, MOV, or AVI files only",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a video smaller than 100MB",
          variant: "destructive",
        });
        return;
      }
      
      setSampleVideo(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PNG or JPG images only",
          variant: "destructive",
        });
        return;
      }
      setLogo(file);
    }
  };

  const handleClipUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload MP4, MOV, or AVI files only",
          variant: "destructive",
        });
        return;
      }
      setShortClip(file);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(path, file);
    
    if (error) throw error;
    return data;
  };

  const handleGenerate = async () => {
    if (!sampleVideo || !contentText.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please upload a sample video and provide content text",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate videos",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Upload files to Supabase Storage
      const timestamp = Date.now();
      const userId = user.id;
      
      const sampleVideoPath = `${userId}/samples/${timestamp}_${sampleVideo.name}`;
      await uploadFile(sampleVideo, sampleVideoPath);

      const { data: { publicUrl: sampleVideoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(sampleVideoPath);

      let logoUrl = null;
      if (logo) {
        const logoPath = `${userId}/logos/${timestamp}_${logo.name}`;
        await uploadFile(logo, logoPath);
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(logoPath);
        
        logoUrl = publicUrl;
      }

      let clipUrl = null;
      if (shortClip) {
        const clipPath = `${userId}/clips/${timestamp}_${shortClip.name}`;
        await uploadFile(shortClip, clipPath);
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(clipPath);
        
        clipUrl = publicUrl;
      }

      // Create project record
      const projectData = {
        user_id: userId,
        title: `Video Clone - ${sampleVideo.name}`,
        type: 'video_upload',
        status: 'processing',
        video_data: {
          contentText,
          resolution,
          aspectRatio,
          uploadedAt: new Date().toISOString()
        }
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Call edge function to generate video
      const { data, error } = await supabase.functions.invoke('clone-video-style', {
        body: {
          sampleVideoUrl,
          contentText,
          logoUrl,
          clipUrl,
          resolution,
          aspectRatio,
          projectId: project.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Edge Function returned a non-2xx status code');
      }

      if (data?.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }

      if (data.success && data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
        
        // Update project with video URL
        await supabase
          .from('projects')
          .update({ 
            status: 'completed',
            video_data: {
              ...projectData.video_data,
              videoUrl: data.videoUrl,
              styleAnalysis: data.styleAnalysis,
              completedAt: new Date().toISOString()
            }
          })
          .eq('id', project.id);

        toast({
          title: "Video Generated Successfully",
          description: "Your cloned video is ready for preview",
        });
      } else {
        throw new Error('Video generation failed');
      }

      setIsGenerating(false);

    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate("/create-project");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Video Clone Generator" />
          
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Methods
                </Button>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  <Video className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">Video Clone Generator</h1>
                <p className="text-muted-foreground text-lg">
                  Upload a sample video and create content with the same style
                </p>
              </div>

              {isGenerating ? (
                <Dialog open={isGenerating}>
                  <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
                    <LoadingAnimation
                      stage="analyzing"
                      progress={50}
                      message="AI is analyzing the sample video style and generating your new video with the same look and feel..."
                    />
                  </DialogContent>
                </Dialog>
              ) : !generatedVideo ? (
                <div className="grid gap-6">
                  {/* Video Upload */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Sample Video Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Upload Sample Video *</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept=".mp4,.mov,.avi"
                            onChange={handleVideoUpload}
                            className="hidden"
                            id="video-upload"
                          />
                          <label htmlFor="video-upload" className="cursor-pointer">
                            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm font-medium mb-2">
                              {sampleVideo ? sampleVideo.name : "Click to upload video"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              MP4, MOV, AVI up to 100MB
                            </p>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Input */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono">New Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="content-text" className="font-mono">Content Text *</Label>
                        <Textarea
                          id="content-text"
                          value={contentText}
                          onChange={(e) => setContentText(e.target.value)}
                          placeholder="Enter the new text content for your video..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-mono">Logo (Optional)</Label>
                          <div className="border border-border rounded-lg p-3">
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              onChange={handleLogoUpload}
                              className="text-sm w-full"
                              id="logo-upload"
                            />
                          </div>
                          {logo && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {logo.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-mono">Short Video Clip (Optional)</Label>
                          <div className="border border-border rounded-lg p-3">
                            <input
                              type="file"
                              accept=".mp4,.mov,.avi"
                              onChange={handleClipUpload}
                              className="text-sm w-full"
                              id="clip-upload"
                            />
                          </div>
                          {shortClip && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {shortClip.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono">Video Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-mono">Resolution</Label>
                          <Select value={resolution} onValueChange={setResolution}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resolution" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="720p">720p (HD)</SelectItem>
                              <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                              <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-mono">Aspect Ratio</Label>
                          <Select value={aspectRatio} onValueChange={setAspectRatio}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select aspect ratio" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1:1">1:1 (Square)</SelectItem>
                              <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                              <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    disabled={isGenerating || !sampleVideo || !contentText.trim()}
                    className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating Clone Video...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Clone Video
                      </>
                    )}
                  </Button>

                </div>
              ) : (
                /* Video Preview */
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-mono flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Generated Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <Play className="w-16 h-16 text-primary" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download MP4
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Video
                      </Button>
                      <Button 
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                      >
                        Save to Projects
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default VideoCloneGenerator;