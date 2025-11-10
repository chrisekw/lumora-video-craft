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
  Users, 
  Play,
  Download,
  Share2,
  Sparkles,
  Volume2,
  Palette,
  Wand2
} from "lucide-react";

const UGCVideoCreator = () => {
  const [characterType, setCharacterType] = useState("");
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [brandColor, setBrandColor] = useState("#6C63FF");
  const [watermark, setWatermark] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
      setBrandLogo(file);
    }
  };

  const generateScript = async () => {
    if (!characterType) {
      toast({
        title: "Character Type Required",
        description: "Please select a character type first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingScript(true);

    try {
      const sampleScripts = {
        "realistic-human": "Hey everyone! I just discovered this amazing product and I had to share it with you. As someone who's tried everything on the market, I can honestly say this is a game-changer. The results speak for themselves - I've seen incredible improvements in just the first week!",
        "cartoon": "Woah! This is absolutely incredible! I'm literally mind-blown by how awesome this is! You guys NEED to check this out - it's like nothing I've ever seen before. Trust me, you're going to thank me later for showing you this!",
        "ai-influencer": "Analyzing all the data and reviews, this product consistently delivers exceptional results. Based on my research and testing protocols, I can confidently recommend this to optimize your daily routine. The metrics don't lie - this is the upgrade you've been looking for."
      };
      
      setScript(sampleScripts[characterType as keyof typeof sampleScripts] || sampleScripts["realistic-human"]);
      setIsGeneratingScript(false);
      
      toast({
        title: "Script Generated",
        description: "AI has created a UGC script tailored to your character type",
      });

    } catch (error) {
      setIsGeneratingScript(false);
      toast({
        title: "Script Generation Failed",
        description: "Unable to generate script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!characterType || !script.trim() || !voiceStyle) {
      toast({
        title: "Missing Required Fields",
        description: "Please select character type, provide script, and choose voice style",
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
      let logoUrl = null;
      if (brandLogo) {
        const timestamp = Date.now();
        const userId = user.id;
        const logoPath = `${userId}/logos/${timestamp}_${brandLogo.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(logoPath, brandLogo);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(logoPath);
        
        logoUrl = publicUrl;
      }

      // Create project record
      const projectData = {
        user_id: user.id,
        title: `UGC Video - ${characterType}`,
        type: 'ugc_template',
        status: 'processing',
        video_data: {
          characterType,
          script,
          voiceStyle,
          brandColor,
          watermark,
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
      const { data, error } = await supabase.functions.invoke('generate-ugc-video', {
        body: {
          characterType,
          script,
          voiceStyle,
          brandColor,
          logoUrl,
          includeWatermark: !!watermark,
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
              completedAt: new Date().toISOString()
            }
          })
          .eq('id', project.id);

        toast({
          title: "UGC Video Generated Successfully",
          description: "Your user-generated content video is ready for preview",
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
          <MobileHeader title="UGC Video Creator" />
          
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
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">UGC Video Creator</h1>
                <p className="text-muted-foreground text-lg">
                  Create authentic user-generated content with AI avatars
                </p>
              </div>

              {!generatedVideo ? (
                <div className="grid gap-6">
                  {/* Character Selection */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Avatar Character
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Character Type *</Label>
                        <Select value={characterType} onValueChange={setCharacterType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an avatar character" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realistic-human">Realistic Human Avatar - Natural and relatable</SelectItem>
                            <SelectItem value="cartoon">Cartoon Character - Fun and engaging</SelectItem>
                            <SelectItem value="ai-influencer">AI Influencer - Modern and trendy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Script Section */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Wand2 className="w-5 h-5 mr-2" />
                        Video Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={generateScript}
                          disabled={isGeneratingScript || !characterType}
                          variant="outline"
                          size="sm"
                        >
                          {isGeneratingScript ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              AI Generate Script
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="script" className="font-mono">Script Text *</Label>
                        <Textarea
                          id="script"
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="Enter your video script or use the AI generate button above..."
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-sm text-muted-foreground">
                          {script.length}/500 characters recommended for UGC videos
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Voice Settings */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Volume2 className="w-5 h-5 mr-2" />
                        Voiceover Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Voice Style *</Label>
                        <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a voice style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="natural-male">Natural Male - Friendly and trustworthy</SelectItem>
                            <SelectItem value="natural-female">Natural Female - Warm and engaging</SelectItem>
                            <SelectItem value="energetic">Energetic - Upbeat and enthusiastic</SelectItem>
                            <SelectItem value="calm">Calm - Soothing and professional</SelectItem>
                            <SelectItem value="youthful">Youthful - Fresh and trendy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Branding */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="font-mono flex items-center">
                        <Palette className="w-5 h-5 mr-2" />
                        Brand Customization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-mono">Brand Logo (Optional)</Label>
                          <div className="border border-border rounded-lg p-3">
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              onChange={handleLogoUpload}
                              className="text-sm w-full"
                              id="logo-upload"
                            />
                          </div>
                          {brandLogo && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {brandLogo.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brand-color" className="font-mono">Brand Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="brand-color"
                              type="color"
                              value={brandColor}
                              onChange={(e) => setBrandColor(e.target.value)}
                              className="w-16 h-10 rounded-lg cursor-pointer"
                            />
                            <Input
                              value={brandColor}
                              onChange={(e) => setBrandColor(e.target.value)}
                              className="flex-1 font-mono"
                              placeholder="#6C63FF"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="watermark" className="font-mono">Watermark Text (Optional)</Label>
                        <Input
                          id="watermark"
                          value={watermark}
                          onChange={(e) => setWatermark(e.target.value)}
                          placeholder="@yourbrand or your company name"
                          className="font-mono"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    disabled={isGenerating || !characterType || !script.trim() || !voiceStyle}
                    className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating UGC Video...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate UGC Video
                      </>
                    )}
                  </Button>

                  <Dialog open={isGenerating}>
                    <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
                      <LoadingAnimation
                        stage="generating"
                        progress={50}
                        message="AI is generating your avatar, adding voice synthesis, captions, emojis, and background scenes..."
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
                      Generated UGC Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <Play className="w-16 h-16 text-primary" />
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 font-mono">Video Details:</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Character:</span> {characterType}</p>
                        <p><span className="font-medium">Voice:</span> {voiceStyle}</p>
                        <p><span className="font-medium">Features:</span> Captions, emojis, background scenes</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share to Socials
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

export default UGCVideoCreator;