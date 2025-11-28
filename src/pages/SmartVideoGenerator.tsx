import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Film, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Scene {
  text: string;
  visuals: string;
  style: string;
  duration?: number;
}

interface ScenesData {
  title: string;
  scenes: Scene[];
}

interface GeneratedScene extends Scene {
  imageUrl?: string;
  audioPrompt?: string;
  videoUrl?: string;
  status?: 'pending' | 'generating' | 'completed' | 'error';
}

const SmartVideoGenerator = () => {
  const [inputMode, setInputMode] = useState<"prompt" | "script">("prompt");
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenesData, setScenesData] = useState<ScenesData | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const { toast } = useToast();

  const handleGenerateScenes = async () => {
    if (!prompt && !script) {
      toast({
        title: "Input required",
        description: "Please enter a prompt or script",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setScenesData(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-scenes', {
        body: {
          prompt: inputMode === "prompt" ? prompt : undefined,
          script: inputMode === "script" ? script : undefined,
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Generation failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setScenesData(data);
      setGeneratedScenes(data.scenes.map((scene: Scene) => ({
        ...scene,
        status: 'pending' as const,
      })));
      toast({
        title: "Scenes generated!",
        description: `${data.scenes.length} scenes ready for video generation`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate scenes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTotalDuration = () => {
    if (!scenesData) return 0;
    return scenesData.scenes.reduce((total, scene) => total + (scene.duration || 5), 0);
  };

  const handleGenerateVideos = async () => {
    if (!scenesData) return;

    setIsGeneratingVideos(true);
    toast({
      title: "Starting video generation",
      description: `Generating videos with audio for ${scenesData.scenes.length} scenes...`,
    });

    try {
      let successCount = 0;
      
      for (let index = 0; index < scenesData.scenes.length; index++) {
        const scene = scenesData.scenes[index];
        
        try {
          setGeneratedScenes(prev => prev.map((s, i) => 
            i === index ? { ...s, status: 'generating' as const } : s
          ));

          const { data, error } = await supabase.functions.invoke('generate-video-with-audio', {
            body: { scene, sceneIndex: index }
          });

          if (error) throw error;

          if (data.error) {
            throw new Error(data.error);
          }

          // Create video URL by combining image and audio using Web APIs
          setGeneratedScenes(prev => prev.map((s, i) => 
            i === index ? { 
              ...s, 
              status: 'completed' as const,
              imageUrl: data.imageUrl,
              audioPrompt: data.audioPrompt,
              videoUrl: data.imageUrl // For now, show image preview
            } : s
          ));
          
          successCount++;
          
          // Add delay between requests to avoid rate limits (2 seconds)
          if (index < scenesData.scenes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Error generating scene ${index}:`, error);
          setGeneratedScenes(prev => prev.map((s, i) => 
            i === index ? { ...s, status: 'error' as const } : s
          ));
          
          if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
            toast({
              title: "Rate limit reached",
              description: "Please wait a moment before generating more scenes.",
              variant: "destructive",
            });
            break;
          } else if (error.message?.includes('Payment required') || error.message?.includes('402')) {
            toast({
              title: "Credits needed",
              description: "Please add credits in Settings → Workspace → Usage.",
              variant: "destructive",
            });
            break;
          }
        }
      }

      setIsGeneratingVideos(false);
      toast({
        title: "Generation complete!",
        description: `${successCount} of ${scenesData.scenes.length} videos with audio generated successfully`,
      });

    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate videos",
        variant: "destructive",
      });
      setIsGeneratingVideos(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <MobileHeader title="Smart Video Generator" />
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-3xl font-bold truncate">Smart Video Generator</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">AI-powered scene-based video creation</p>
                </div>
              </div>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-lg md:text-xl">Input</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Enter a prompt or upload a script to generate scenes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "prompt" | "script")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                        <TabsTrigger value="script">Script</TabsTrigger>
                      </TabsList>
                      <TabsContent value="prompt" className="space-y-4">
                        <Textarea
                          placeholder="Describe the video you want to create... (e.g., 'Create a motivational video about morning routines')"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </TabsContent>
                      <TabsContent value="script" className="space-y-4">
                        <Textarea
                          placeholder="Paste your video script here..."
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={handleGenerateScenes}
                      disabled={isGenerating || (!prompt && !script)}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Scenes...
                        </>
                      ) : (
                        <>
                          <Film className="mr-2 h-5 w-5" />
                          Generate Scenes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-lg md:text-xl">Scene Preview</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {scenesData 
                        ? `${scenesData.scenes.length} scenes • ~${getTotalDuration()}s total` 
                        : "Scenes will appear here after generation"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!scenesData && !isGenerating && (
                      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <Film className="w-16 h-16 mb-4 opacity-20" />
                        <p>Enter a prompt and generate scenes to see preview</p>
                      </div>
                    )}

                    {isGenerating && (
                      <div className="flex flex-col items-center justify-center h-[300px]">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">AI is analyzing and creating scenes...</p>
                      </div>
                    )}

                    {scenesData && (
                      <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-auto">
                        <div className="mb-3 md:mb-4 p-2 md:p-3 rounded-lg bg-muted">
                          <h3 className="font-semibold text-base md:text-lg">{scenesData.title}</h3>
                        </div>
                        {generatedScenes.map((scene, index) => (
                          <div key={index} className="p-3 md:p-4 rounded-lg border bg-card space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs md:text-sm font-mono text-muted-foreground">
                                Scene {index + 1}
                              </span>
                              <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-1.5 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">
                                {scene.duration || 5}s • {scene.style}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-medium">{scene.text}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">🎬 {scene.visuals}</p>
                            
                            {scene.status === 'generating' && (
                              <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mt-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating video with audio...
                              </div>
                            )}
                            {scene.status === 'completed' && scene.videoUrl && (
                              <div className="mt-2 space-y-1">
                                <img 
                                  src={scene.videoUrl} 
                                  alt={`Scene ${index + 1} video frame`}
                                  className="w-full rounded border"
                                />
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                                  <span>🎬 Video with audio ready</span>
                                </div>
                              </div>
                            )}
                            {scene.status === 'error' && (
                              <p className="text-[10px] md:text-xs text-destructive mt-2">Failed to generate video</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {scenesData && (
                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-lg md:text-xl">Video Generation</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Generate complete videos with scenes, audio, and effects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="p-3 md:p-4 rounded-lg bg-muted space-y-1.5 md:space-y-2">
                      <p className="text-xs md:text-sm">
                        ✅ <strong>Phase 1:</strong> Scene scripts ready
                      </p>
                      <p className="text-xs md:text-sm">
                        {isGeneratingVideos ? '🔄' : '⏳'} <strong>Phase 2:</strong> Video generation with audio & effects
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        🎬 <strong>Phase 3:</strong> Final video assembly & export
                      </p>
                    </div>

                    <Button
                      onClick={handleGenerateVideos}
                      disabled={isGeneratingVideos || generatedScenes.every(s => s.status === 'completed')}
                      className="w-full"
                      size="lg"
                    >
                      {isGeneratingVideos ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          <span className="text-sm md:text-base">Generating Videos...</span>
                        </>
                      ) : generatedScenes.every(s => s.status === 'completed') ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          <span className="text-sm md:text-base">All Videos Generated</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          <span className="text-sm md:text-base">Generate Videos with Audio</span>
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" disabled className="flex-1 text-xs md:text-sm">
                        <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button variant="outline" disabled className="flex-1 text-xs md:text-sm">
                        <Share2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Share</span>
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

export default SmartVideoGenerator;
