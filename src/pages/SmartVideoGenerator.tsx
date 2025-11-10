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
  videoUrl?: string;
  status?: 'pending' | 'generating' | 'completed' | 'error';
  predictionId?: string;
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
      description: `Generating videos for ${scenesData.scenes.length} scenes...`,
    });

    try {
      // Start video generation for all scenes
      const predictions = await Promise.all(
        scenesData.scenes.map(async (scene, index) => {
          try {
            const { data, error } = await supabase.functions.invoke('generate-scene-video', {
              body: { scene, sceneIndex: index }
            });

            if (error) throw error;

            setGeneratedScenes(prev => prev.map((s, i) => 
              i === index ? { ...s, status: 'generating' as const, predictionId: data.predictionId } : s
            ));

            return { index, predictionId: data.predictionId };
          } catch (error) {
            setGeneratedScenes(prev => prev.map((s, i) => 
              i === index ? { ...s, status: 'error' as const } : s
            ));
            return null;
          }
        })
      );

      // Poll for completion with better state tracking
      const validPredictions = predictions.filter(p => p !== null);
      let completedCount = 0;
      let pollAttempts = 0;
      const maxAttempts = 100; // 5 minutes at 3s intervals
      
      const pollInterval = setInterval(async () => {
        pollAttempts++;
        
        // Stop polling after max attempts
        if (pollAttempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsGeneratingVideos(false);
          toast({
            title: "Generation timeout",
            description: "Video generation took too long. Check back later.",
            variant: "destructive",
          });
          return;
        }

        let updatedCompletedCount = 0;

        for (const pred of validPredictions) {
          if (!pred) continue;

          try {
            const { data } = await supabase.functions.invoke('check-video-status', {
              body: { predictionId: pred.predictionId }
            });

            if (data.status === 'succeeded' && data.output) {
              updatedCompletedCount++;
              setGeneratedScenes(prev => {
                const updated = prev.map((s, i) => 
                  i === pred.index ? { 
                    ...s, 
                    status: 'completed' as const, 
                    videoUrl: Array.isArray(data.output) ? data.output[0] : data.output 
                  } : s
                );
                return updated;
              });
            } else if (data.status === 'failed') {
              updatedCompletedCount++;
              setGeneratedScenes(prev => prev.map((s, i) => 
                i === pred.index ? { ...s, status: 'error' as const } : s
              ));
            }
          } catch (error) {
            // Silently continue on error
          }
        }

        // Check if all completed
        if (updatedCompletedCount >= validPredictions.length) {
          clearInterval(pollInterval);
          setIsGeneratingVideos(false);
          
          // Get final success count
          setGeneratedScenes(prev => {
            const successCount = prev.filter(s => s.status === 'completed').length;
            toast({
              title: "Video generation complete!",
              description: `${successCount} of ${scenesData.scenes.length} videos generated successfully`,
            });
            return prev;
          });
        }
      }, 3000);

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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Smart Video Generator</h1>
                  <p className="text-muted-foreground">AI-powered scene-based video creation</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Input</CardTitle>
                    <CardDescription>Enter a prompt or upload a script to generate scenes</CardDescription>
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
                  <CardHeader>
                    <CardTitle>Scene Preview</CardTitle>
                    <CardDescription>
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
                      <div className="space-y-4 max-h-[400px] overflow-auto">
                        <div className="mb-4 p-3 rounded-lg bg-muted">
                          <h3 className="font-semibold text-lg">{scenesData.title}</h3>
                        </div>
                        {generatedScenes.map((scene, index) => (
                          <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-mono text-muted-foreground">
                                Scene {index + 1}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {scene.duration || 5}s • {scene.style}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{scene.text}</p>
                            <p className="text-xs text-muted-foreground">🎬 {scene.visuals}</p>
                            
                            {scene.status === 'generating' && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating video...
                              </div>
                            )}
                            {scene.status === 'completed' && scene.videoUrl && (
                              <div className="mt-2">
                                <video 
                                  src={scene.videoUrl} 
                                  controls 
                                  className="w-full rounded border"
                                />
                              </div>
                            )}
                            {scene.status === 'error' && (
                              <p className="text-xs text-destructive mt-2">Failed to generate video</p>
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
                  <CardHeader>
                    <CardTitle>Video Generation</CardTitle>
                    <CardDescription>Generate videos for each scene</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted space-y-2">
                      <p className="text-sm">
                        ✅ <strong>Phase 1:</strong> Scene generation complete!
                      </p>
                      <p className="text-sm">
                        {isGeneratingVideos ? '🔄' : '⏳'} <strong>Phase 2:</strong> Video generation per scene
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🎬 <strong>Phase 3:</strong> Scene stitching & editing (coming next)
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
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Videos...
                        </>
                      ) : generatedScenes.every(s => s.status === 'completed') ? (
                        <>
                          <Film className="mr-2 h-5 w-5" />
                          All Videos Generated
                        </>
                      ) : (
                        <>
                          <Film className="mr-2 h-5 w-5" />
                          Generate Scene Videos
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" disabled className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download (Phase 3)
                      </Button>
                      <Button variant="outline" disabled className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share (Phase 3)
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
