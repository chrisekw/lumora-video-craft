import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  BarChart3, 
  Play,
  Download,
  Share2,
  Sparkles,
  Volume2,
  Film,
  Music,
  Edit,
  Upload
} from "lucide-react";

const ExplainerVideoGenerator = () => {
  const [script, setScript] = useState("");
  const [animationStyle, setAnimationStyle] = useState("");
  const [voiceoverStyle, setVoiceoverStyle] = useState("");
  const [customNarration, setCustomNarration] = useState<File | null>(null);
  const [includeMusic, setIncludeMusic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleNarrationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload MP3, WAV, or M4A audio files only",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an audio file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      setCustomNarration(file);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim() || !animationStyle) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide a script and select an animation style",
        variant: "destructive",
      });
      return;
    }

    if (!voiceoverStyle && !customNarration) {
      toast({
        title: "Voiceover Required",
        description: "Please select a voiceover style or upload custom narration",
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
      let customNarrationUrl = null;
      if (customNarration) {
        const timestamp = Date.now();
        const userId = user.id;
        const narrationPath = `${userId}/narration/${timestamp}_${customNarration.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(narrationPath, customNarration);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(narrationPath);
        
        customNarrationUrl = publicUrl;
      }

      // Create project record
      const projectData = {
        user_id: user.id,
        title: `Explainer Video - ${script.slice(0, 50)}...`,
        type: 'explainer_video',
        status: 'processing',
        video_data: {
          script,
          animationStyle,
          voiceoverStyle,
          includeMusic,
          createdAt: new Date().toISOString()
        }
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Call edge function to generate video
      const { data, error } = await supabase.functions.invoke('create-explainer-video', {
        body: {
          script,
          animationStyle,
          voiceoverStyle: voiceoverStyle || 'none',
          customNarrationUrl,
          includeMusic,
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
              voiceoverUrl: data.voiceoverUrl,
              completedAt: new Date().toISOString()
            }
          })
          .eq('id', project.id);

        toast({
          title: "Explainer Video Generated Successfully",
          description: "Your animated explainer video is ready for preview",
        });
      } else {
        throw new Error('Video generation failed');
      }

      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating video:', error);
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

  const exampleScripts = [
    "Our revolutionary app solves the problem of scattered team communication. With integrated chat, video calls, and project management, teams can collaborate 50% more efficiently.",
    "Imagine never losing your keys again. Our smart tracker uses advanced GPS technology to help you locate any item instantly through your smartphone.",
    "Traditional fitness apps track your workouts, but our AI-powered coach adapts to your progress, creating personalized routines that evolve with your fitness journey."
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Explainer Video Generator" />
          
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
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">Explainer Video Generator</h1>
                <p className="text-muted-foreground text-lg">
                  Create professional animated explainer videos with AI
                </p>
              </div>

              {!generatedVideo ? (
                <div className="grid gap-6">
                  {/* Script Input */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Edit className="w-5 h-5 mr-2" />
                        Video Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="script" className="font-mono">Script or Description *</Label>
                        <Textarea
                          id="script"
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="Enter your explainer video script or describe what you want to explain..."
                          rows={6}
                          className="resize-none text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          {script.length}/2000 characters
                        </p>
                      </div>

                      <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 font-mono">Example Scripts:</h3>
                        <div className="space-y-2">
                          {exampleScripts.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => setScript(example)}
                              className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded border border-transparent hover:border-border"
                            >
                              "{example}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Animation Style */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Film className="w-5 h-5 mr-2" />
                        Animation Style
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Animation Style *</Label>
                        <Select value={animationStyle} onValueChange={setAnimationStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an animation style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2d-flat">2D Flat Design - Modern and clean</SelectItem>
                            <SelectItem value="motion-graphics">Motion Graphics - Dynamic and professional</SelectItem>
                            <SelectItem value="whiteboard">Whiteboard Animation - Classic and engaging</SelectItem>
                            <SelectItem value="isometric">Isometric 3D - Contemporary and depth</SelectItem>
                            <SelectItem value="character-driven">Character-Driven - Story-focused with personas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Voiceover Settings */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Volume2 className="w-5 h-5 mr-2" />
                        Voiceover Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">AI Voice Style</Label>
                        <Select value={voiceoverStyle} onValueChange={setVoiceoverStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an AI voice (or upload custom below)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional-male">Professional Male - Authoritative and clear</SelectItem>
                            <SelectItem value="professional-female">Professional Female - Warm and trustworthy</SelectItem>
                            <SelectItem value="friendly-male">Friendly Male - Approachable and conversational</SelectItem>
                            <SelectItem value="friendly-female">Friendly Female - Engaging and personable</SelectItem>
                            <SelectItem value="narrator">Narrator - Documentary-style and informative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          <Label className="font-mono">Or Upload Custom Narration</Label>
                          <div className="border border-border rounded-lg p-3">
                            <input
                              type="file"
                              accept=".mp3,.wav,.m4a"
                              onChange={handleNarrationUpload}
                              className="text-sm w-full"
                              id="narration-upload"
                            />
                          </div>
                          {customNarration && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {customNarration.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Background Music */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Music className="w-5 h-5 mr-2" />
                        Background Music
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="include-music"
                          checked={includeMusic}
                          onCheckedChange={setIncludeMusic}
                        />
                        <Label htmlFor="include-music" className="font-mono">
                          Include background music (recommended)
                        </Label>
                      </div>
                      {includeMusic && (
                        <p className="text-sm text-muted-foreground">
                          AI will automatically select appropriate background music that complements your content and voiceover.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    disabled={isGenerating || !script.trim() || !animationStyle || (!voiceoverStyle && !customNarration)}
                    className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating Explainer...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Explainer Video
                      </>
                    )}
                  </Button>

                  <Dialog open={isGenerating}>
                    <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
                      <LoadingAnimation
                        stage="generating"
                        progress={50}
                        message="AI is generating animations, icons, text overlays, voiceover synthesis, and background music..."
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
                      Generated Explainer Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <Play className="w-16 h-16 text-primary" />
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 font-mono">Video Features:</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Animation:</span> {animationStyle}</p>
                        <p><span className="font-medium">Voiceover:</span> {customNarration ? "Custom narration" : voiceoverStyle}</p>
                        <p><span className="font-medium">Music:</span> {includeMusic ? "Included" : "None"}</p>
                        <p><span className="font-medium">Includes:</span> Animations, icons, text overlays, transitions</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Text Overlays
                      </Button>
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Icons
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export MP4
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

export default ExplainerVideoGenerator;