import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import VideoEditor from "@/components/VideoEditor";
import { 
  ArrowLeft, 
  Wand2, 
  Play,
  Download,
  Share2,
  Sparkles,
  Film,
  Music,
  Edit,
  Save
} from "lucide-react";

const PromptToVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState("analyzing");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim() || !videoStyle || !musicStyle) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate videos.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStage("analyzing");

    try {
      // Create project in database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: `Prompt Video: ${prompt.substring(0, 50)}...`,
          type: 'prompt_video',
          user_id: user.id,
          status: 'processing',
          video_data: {
            prompt,
            videoStyle,
            musicStyle,
            createdAt: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (projectError) throw projectError;
      setCurrentProjectId(project.id);

      toast({
        title: "Generation started",
        description: "Your video is being generated. This may take a few minutes.",
      });

      // Stage 1: Analyzing
      setGenerationStage("analyzing");
      setGenerationProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Generating
      setGenerationStage("generating");
      setGenerationProgress(30);

      const { data: videoResult, error: videoError } = await supabase.functions.invoke('generate-prompt-video', {
        body: {
          prompt,
          style: videoStyle,
          music: musicStyle,
          projectId: project.id
        }
      });

      if (videoError) {
        throw new Error(videoError.message || 'Failed to generate video');
      }

      if (!videoResult || videoResult.error) {
        const errorMsg = videoResult?.error || 'No video URL returned from generation';
        const errorDetails = videoResult?.details ? `: ${videoResult.details}` : '';
        throw new Error(errorMsg + errorDetails);
      }

      // Stage 3: Rendering
      setGenerationStage("rendering");
      setGenerationProgress(70);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Stage 4: Finalizing
      setGenerationStage("finalizing");
      setGenerationProgress(90);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationProgress(100);
      setGeneratedVideo(videoResult.videoUrl);
      setIsGenerating(false);
      
      // Update project status
      await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          video_data: {
            prompt,
            videoStyle,
            musicStyle,
            videoUrl: videoResult.videoUrl,
            voiceoverUrl: videoResult.voiceoverUrl,
            completedAt: new Date().toISOString()
          }
        })
        .eq('id', project.id);

      // Send notification
      await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          type: 'project_completed',
          title: 'Video Generated Successfully',
          message: `Your video "${prompt.substring(0, 50)}..." is ready!`,
          link: '/prompt-to-video'
        }
      });

      toast({
        title: "Video generated successfully!",
        description: "Your video is ready for preview and editing.",
      });

    } catch (error) {
      setIsGenerating(false);
      
      // Send failure notification
      if (currentProjectId && user) {
        await supabase.functions.invoke('send-notification', {
          body: {
            userId: user.id,
            type: 'project_failed',
            title: 'Video Generation Failed',
            message: 'There was an error generating your video. Please try again.',
            link: '/prompt-to-video'
          }
        });
      }
      
      toast({
        title: "Generation failed",
        description: error.message || "There was an error generating your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditVideo = () => {
    setShowEditor(true);
  };

  const handleSaveEdits = (editedData: any) => {
    if (currentProjectId) {
      supabase
        .from('projects')
        .update({
          video_data: editedData
        })
        .eq('id', currentProjectId);
      
      toast({
        title: "Edits saved",
        description: "Your video edits have been saved successfully.",
      });
    }
  };

  const handleExportVideo = (format: string) => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your video export has started. You'll be notified when it's ready.",
    });
  };

  const handleShareVideo = () => {
    toast({
      title: "Share link copied",
      description: "A shareable link has been copied to your clipboard.",
    });
  };

  const handleBack = () => {
    navigate("/create-project");
  };

  const examplePrompts = [
    "A modern tech startup office with people collaborating on innovative projects",
    "A peaceful morning coffee routine in a minimalist kitchen with golden sunlight",
    "An exciting product launch event with dynamic camera movements and energetic music",
    "A testimonial video featuring satisfied customers sharing their success stories"
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Prompt to Video" />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Back</span>
                </Button>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono px-2">Prompt to Video</h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
                  Transform your text description into a compelling video
                </p>
              </div>

              {showEditor && generatedVideo ? (
                <VideoEditor
                  videoUrl={generatedVideo}
                  onSave={handleSaveEdits}
                  onExport={handleExportVideo}
                  onShare={handleShareVideo}
                />
              ) : !generatedVideo ? (
                <div className="grid gap-6">
                  {/* Prompt Input */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Wand2 className="w-5 h-5 mr-2" />
                        Video Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="prompt" className="font-mono">Describe Your Video *</Label>
                        <Textarea
                          id="prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe the video you want to create in detail. Include scenes, actions, mood, and any specific elements you want..."
                          rows={6}
                          className="resize-none text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          {prompt.length}/1000 characters
                        </p>
                      </div>

                      <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 font-mono">Example Prompts:</h3>
                        <div className="space-y-2">
                          {examplePrompts.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => setPrompt(example)}
                              className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded border border-transparent hover:border-border"
                            >
                              "{example}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Style Settings */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Film className="w-5 h-5 mr-2" />
                        Video Style
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Video Style</Label>
                        <Select value={videoStyle} onValueChange={setVideoStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a video style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cinematic">Cinematic - Professional film-like quality</SelectItem>
                            <SelectItem value="social-media">Social Media Ad - Trendy and engaging</SelectItem>
                            <SelectItem value="product-demo">Product Demo - Clean and focused</SelectItem>
                            <SelectItem value="testimonial">Testimonial - Personal and authentic</SelectItem>
                            <SelectItem value="explainer">Explainer - Educational and clear</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle - Natural and relatable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Music Settings */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Music className="w-5 h-5 mr-2" />
                        Background Music
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Music Style</Label>
                        <Select value={musicStyle} onValueChange={setMusicStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose background music style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upbeat">Upbeat - Energetic and motivating</SelectItem>
                            <SelectItem value="calm">Calm - Peaceful and soothing</SelectItem>
                            <SelectItem value="cinematic">Cinematic - Epic and dramatic</SelectItem>
                            <SelectItem value="corporate">Corporate - Professional and trustworthy</SelectItem>
                            <SelectItem value="ambient">Ambient - Subtle background atmosphere</SelectItem>
                            <SelectItem value="none">No Music - Silent video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Video
                      </>
                    )}
                  </Button>

                  <Dialog open={isGenerating}>
                    <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
                      <LoadingAnimation
                        stage={generationStage}
                        progress={generationProgress}
                        message="AI is analyzing your prompt and generating visuals, music, and effects..."
                      />
                    </DialogContent>
                  </Dialog>
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
                    
                    <div className="bg-card border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 font-mono">Generated from:</h3>
                      <p className="text-sm text-muted-foreground italic">"{prompt}"</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleEditVideo} className="flex-1 bg-gradient-primary hover:opacity-90">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Video
                      </Button>
                      <Button onClick={() => handleExportVideo('mp4')} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export MP4
                      </Button>
                      <Button onClick={() => handleExportVideo('gif')} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export GIF
                      </Button>
                      <Button onClick={handleShareVideo} variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        onClick={() => navigate("/dashboard")}
                        variant="outline"
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
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

export default PromptToVideo;