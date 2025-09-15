import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Wand2, 
  Play,
  Download,
  Share2,
  Sparkles,
  Film,
  Music
} from "lucide-react";

const PromptToVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your video",
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
      // Create project record
      const projectData = {
        user_id: user.id,
        title: `Prompt Video - ${prompt.slice(0, 50)}...`,
        type: 'prompt_video',
        status: 'processing',
        video_data: {
          prompt,
          videoStyle,
          musicStyle,
          createdAt: new Date().toISOString()
        }
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Simulate video generation process
      setTimeout(() => {
        setGeneratedVideo('/placeholder.svg'); // Mock video URL
        setIsGenerating(false);
        
        // Update project status
        supabase
          .from('projects')
          .update({ status: 'completed' })
          .eq('id', project.id);

        toast({
          title: "Video Generated Successfully",
          description: "Your AI-generated video is ready for preview",
        });
      }, 8000);

    } catch (error) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Unable to generate video. Please try again.",
        variant: "destructive",
      });
    }
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
                  <Wand2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">Prompt to Video</h1>
                <p className="text-muted-foreground text-lg">
                  Transform your text description into a compelling video
                </p>
              </div>

              {!generatedVideo ? (
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

                  {isGenerating && (
                    <Card className="shadow-elegant">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                            <Sparkles className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Creating Your Video</h3>
                            <p className="text-sm text-muted-foreground">
                              AI is analyzing your prompt and generating visuals, music, and effects. This may take a few minutes...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download MP4
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download GIF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
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

export default PromptToVideo;