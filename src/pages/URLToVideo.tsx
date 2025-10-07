import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Globe, 
  Play,
  Download,
  Share2,
  Sparkles,
  Film,
  Volume2
} from "lucide-react";

const URLToVideo = () => {
  const [url, setUrl] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [duration, setDuration] = useState("");
  const [voiceover, setVoiceover] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("analyzing");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const validateUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!url.trim() || !videoStyle || !duration || !voiceover) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all fields to generate your video",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
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
    setGenerationProgress(0);
    setGenerationStage("analyzing");

    try {
      // Create project record
      const projectData = {
        user_id: user.id,
        title: `URL Video - ${new URL(url).hostname}`,
        type: 'url_clone',
        status: 'processing',
        video_data: {
          url,
          videoStyle,
          duration,
          voiceover,
          createdAt: new Date().toISOString()
        }
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Stage 1: Scraping website
      setGenerationStage("analyzing");
      setGenerationProgress(10);
      
      toast({
        title: "Scraping Website",
        description: "Extracting content from the provided URL...",
      });

      const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: {
          url,
          projectId: project.id
        }
      });

      if (scrapeError) {
        throw new Error(scrapeError.message || 'Failed to scrape website');
      }

      if (!scrapeResult || !scrapeResult.success || scrapeResult.error) {
        throw new Error(scrapeResult?.error || 'Failed to extract website content');
      }

      setScrapedData(scrapeResult.data);
      setGenerationProgress(30);

      // Stage 2: Generating video
      setGenerationStage("generating");
      setGenerationProgress(40);

      toast({
        title: "Generating Video",
        description: "Creating your video with the extracted content...",
      });

      // Use the explainer video function to generate from the scraped content
      const { data: videoResult, error: videoError } = await supabase.functions.invoke('create-explainer-video', {
        body: {
          script: scrapeResult.data.script || scrapeResult.data.description,
          animationStyle: videoStyle === 'explainer' ? '2d-flat' : 
                         videoStyle === 'social-ad' ? 'motion-graphics' :
                         videoStyle === 'promo' ? 'motion-graphics' : 
                         'whiteboard',
          voiceoverStyle: voiceover === 'ai-male' ? 'professional-male' :
                         voiceover === 'ai-female' ? 'professional-female' :
                         'none',
          customNarrationUrl: null,
          includeMusic: true,
          projectId: project.id,
          duration: duration
        }
      });

      if (videoError) {
        throw new Error(videoError.message || 'Failed to generate video');
      }

      if (!videoResult || videoResult.error) {
        throw new Error(videoResult?.error || 'Video generation failed');
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
            ...projectData.video_data,
            videoUrl: videoResult.videoUrl,
            scrapedData: scrapeResult.data,
            completedAt: new Date().toISOString()
          }
        })
        .eq('id', project.id);

      toast({
        title: "Video Generated Successfully",
        description: "Your URL-based video is ready for preview",
      });

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

  const exampleUrls = [
    "https://example.com/product",
    "https://company.com/about",
    "https://service.com/features"
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="URL to Video" />
          
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
                  <Globe className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">URL to Video</h1>
                <p className="text-muted-foreground text-lg">
                  Transform any website into an engaging video
                </p>
              </div>

              {!generatedVideo ? (
                <div className="grid gap-6">
                  {/* URL Input */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Website URL
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url" className="font-mono">Website URL *</Label>
                        <Input
                          id="url"
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="text-base font-mono"
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the URL of the website you want to convert to video
                        </p>
                      </div>

                      <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 font-mono">Example URLs:</h3>
                        <div className="space-y-2">
                          {exampleUrls.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => setUrl(example)}
                              className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded border border-transparent hover:border-border font-mono"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video Style */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Film className="w-5 h-5 mr-2" />
                        Video Style
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Video Style *</Label>
                        <Select value={videoStyle} onValueChange={setVideoStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a video style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="explainer">Explainer - Educational and informative</SelectItem>
                            <SelectItem value="social-ad">Social Ad - Engaging and trendy</SelectItem>
                            <SelectItem value="promo">Promo - Professional and persuasive</SelectItem>
                            <SelectItem value="tutorial">Tutorial - Step-by-step guidance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Duration & Voiceover */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono">Video Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-mono">Duration *</Label>
                          <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15s">15 seconds - Quick highlight</SelectItem>
                              <SelectItem value="30s">30 seconds - Standard overview</SelectItem>
                              <SelectItem value="60s">60 seconds - Detailed presentation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-mono flex items-center">
                            <Volume2 className="w-4 h-4 mr-2" />
                            Voiceover *
                          </Label>
                          <Select value={voiceover} onValueChange={setVoiceover}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voiceover" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ai-male">AI Male - Professional and clear</SelectItem>
                              <SelectItem value="ai-female">AI Female - Warm and engaging</SelectItem>
                              <SelectItem value="none">None - Music only</SelectItem>
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
                    disabled={isGenerating || !url.trim() || !videoStyle || !duration || !voiceover}
                    className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating Video from URL...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Video from URL
                      </>
                    )}
                  </Button>

                  <Dialog open={isGenerating}>
                    <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
                      <LoadingAnimation
                        stage={generationStage}
                        progress={generationProgress}
                        message="AI is extracting content from the URL and generating your video with transitions, voiceover, and background music..."
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
                      <p className="text-sm text-muted-foreground font-mono break-all">{url}</p>
                      {scrapedData && (
                        <div className="mt-4 space-y-1">
                          <p className="text-sm"><span className="font-semibold">Title:</span> {scrapedData.title}</p>
                          <p className="text-sm"><span className="font-semibold">Style:</span> {videoStyle}</p>
                          <p className="text-sm"><span className="font-semibold">Duration:</span> {duration}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download MP4
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export GIF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        setGeneratedVideo(null);
                        setScrapedData(null);
                        setUrl("");
                        setVideoStyle("");
                        setDuration("");
                        setVoiceover("");
                      }}
                      variant="ghost"
                      className="w-full"
                    >
                      Generate Another Video
                    </Button>
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

export default URLToVideo;
