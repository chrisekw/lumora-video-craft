import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Share, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Video
} from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  status: string;
  video_data: any;
}

const URLCloneGenerate = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'generating' | 'completed' | 'error'>('generating');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) {
      navigate("/create-project/url-clone");
      return;
    }
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      setProject(data);
      setLoading(false);
      
      // Start video generation if not already completed
      if (data.status !== 'completed') {
        startVideoGeneration();
      } else {
        setStatus('completed');
        setProgress(100);
        // In a real app, this would be the actual video URL
        setVideoUrl('/placeholder.svg');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Unable to load project data",
        variant: "destructive",
      });
      navigate("/create-project/url-clone");
    }
  };

  const startVideoGeneration = async () => {
    if (!project) return;

    try {
      setStatus('generating');
      setProgress(10);

      // Simulate video generation process
      const intervals = [
        { delay: 1500, progress: 25, message: "Creating video scenes..." },
        { delay: 2000, progress: 50, message: "Adding voiceover..." },
        { delay: 1500, progress: 75, message: "Applying visual effects..." },
        { delay: 1000, progress: 90, message: "Finalizing video..." },
        { delay: 500, progress: 100, message: "Video generation complete!" }
      ];

      for (const interval of intervals) {
        await new Promise(resolve => setTimeout(resolve, interval.delay));
        setProgress(interval.progress);
      }

      // Update project status
      await supabase
        .from('projects')
        .update({
          status: 'completed',
          thumbnail_url: '/placeholder.svg'
        })
        .eq('id', project.id);

      setStatus('completed');
      setVideoUrl('/placeholder.svg'); // Mock video URL
      
      toast({
        title: "Video Generated Successfully",
        description: "Your video is ready for preview and download",
      });

    } catch (error) {
      console.error('Video generation error:', error);
      setStatus('error');
      toast({
        title: "Generation Failed",
        description: "Unable to generate video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(`/create-project/url-clone/customize?projectId=${projectId}`);
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your video download will begin shortly",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Options",
      description: "Sharing features coming soon!",
    });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return <Video className="w-6 h-6 text-primary" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generating':
        return 'Generating your video...';
      case 'completed':
        return 'Video generation completed!';
      case 'error':
        return 'Generation failed';
      default:
        return 'Preparing...';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Generate Video" />
          
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={status === 'generating'}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Customize
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  {getStatusIcon()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-mono">Generate Video</h1>
                  <p className="text-muted-foreground text-lg mt-2">
                    {project?.title}
                  </p>
                </div>
              </div>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center space-x-2">
                    {getStatusIcon()}
                    <span>{getStatusText()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Progress value={progress} className="h-2" />
                  
                  {status === 'generating' && (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        This may take a few minutes depending on the complexity of your content...
                      </div>
                      
                      <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 font-mono">Generation Progress</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Content analysis completed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${progress > 25 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span>Video scenes creation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span>Voiceover generation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${progress > 75 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span>Visual effects application</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span>Final video rendering</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="space-y-4">
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-4">
                          <Play className="w-12 h-12 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Video preview will be available here
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                        
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Share className="w-4 h-4" />
                          <span>Share</span>
                        </Button>

                        <Button
                          onClick={handleBackToDashboard}
                          className="bg-gradient-primary hover:opacity-90 transition-opacity"
                        >
                          Dashboard
                        </Button>
                      </div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="space-y-4">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-destructive">
                          Video generation failed. This could be due to:
                        </p>
                        <ul className="text-sm text-destructive mt-2 space-y-1">
                          <li>• Server overload</li>
                          <li>• Content processing issues</li>
                          <li>• Network connectivity problems</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={startVideoGeneration}
                        variant="outline"
                        className="w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default URLCloneGenerate;