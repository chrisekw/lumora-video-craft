import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Palette, Volume2, Clock } from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  video_data: any;
}

const URLCloneCustomize = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Customization options
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("professional");
  const [colorScheme, setColorScheme] = useState("default");
  const [duration, setDuration] = useState("auto");
  
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
      const videoData = data.video_data as any;
      setTitle(videoData?.title || data.title);
      setDescription(videoData?.description || "");
      setScript(videoData?.script || "");
      setLoading(false);
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

  const handleBack = () => {
    const videoData = project?.video_data as any;
    navigate(`/create-project/url-clone/processing?url=${encodeURIComponent(videoData?.url || '')}`);
  };

  const handleSaveAndContinue = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const updatedVideoData = {
        ...(project.video_data as any),
        title,
        description,
        script,
        voiceStyle,
        colorScheme,
        duration,
      };

      const { error } = await supabase
        .from('projects')
        .update({
          title,
          video_data: updatedVideoData as any,
        })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your video customization has been saved",
      });

      navigate(`/create-project/url-clone/generate?projectId=${project.id}`);
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your customization settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  if (!project) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Customize Video" />
          
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Processing
                </Button>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  <Palette className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">Customize Your Video</h1>
                <p className="text-muted-foreground text-lg">
                  Fine-tune your video content and style
                </p>
              </div>

              <div className="grid gap-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-mono">Content Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-mono">Video Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter video title"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-mono">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the product/service"
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="script" className="font-mono">Video Script</Label>
                      <Textarea
                        id="script"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Video narration script (will be used for voiceover)"
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        This script will be used to generate the video voiceover
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-mono flex items-center">
                      <Volume2 className="w-5 h-5 mr-2" />
                      Voice Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="font-mono">Voice Style</Label>
                      <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-mono flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Visual Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="font-mono">Color Scheme</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default (Purple & Gold)</SelectItem>
                          <SelectItem value="modern">Modern Blue</SelectItem>
                          <SelectItem value="warm">Warm Orange</SelectItem>
                          <SelectItem value="cool">Cool Green</SelectItem>
                          <SelectItem value="minimal">Minimal Black & White</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-mono flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Video Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="font-mono">Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Based on content)</SelectItem>
                          <SelectItem value="short">Short (30-60 seconds)</SelectItem>
                          <SelectItem value="medium">Medium (1-2 minutes)</SelectItem>
                          <SelectItem value="long">Long (2-3 minutes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveAndContinue}
                  size="lg"
                  disabled={saving || !title.trim()}
                  className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      Generate Video
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default URLCloneCustomize;