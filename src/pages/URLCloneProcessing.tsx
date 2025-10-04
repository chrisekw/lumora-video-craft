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
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";

interface ExtractedContent {
  title: string;
  description: string;
  content: string;
  images: string[];
  url: string;
}

const URLCloneProcessing = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'extracting' | 'analyzing' | 'completed' | 'error'>('extracting');
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!url) {
      navigate("/create-project/url-clone");
      return;
    }

    startExtraction();
  }, [url]);

  const startExtraction = async () => {
    if (!user || !url) return;

    try {
      // Create project record
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: `Website Clone - ${new URL(url).hostname}`,
          type: 'url_clone',
          source_url: url,
          status: 'processing'
        })
        .select()
        .single();

      if (projectError) throw projectError;
      setProjectId(project.id);

      setStatus('extracting');
      setProgress(10);

      // Call the scrape-website edge function
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: { url }
      });

      if (scrapeError) throw scrapeError;

      setProgress(50);
      setStatus('analyzing');

      if (!scrapeData || !scrapeData.success) {
        throw new Error('Failed to extract website content');
      }

      const extractedContent: ExtractedContent = {
        title: scrapeData.data.title || `Content from ${new URL(url).hostname}`,
        description: scrapeData.data.description || "",
        content: scrapeData.data.content || "",
        images: scrapeData.data.images || [],
        url: url
      };

      setProgress(100);
      setExtractedContent(extractedContent);
      setStatus('completed');

      // Update project with extracted content
      await supabase
        .from('projects')
        .update({
          video_data: extractedContent as any,
          status: 'draft'
        })
        .eq('id', project.id);

      toast({
        title: "Content Extracted Successfully",
        description: "Your website content is ready for customization",
      });

    } catch (error) {
      console.error('Extraction error:', error);
      setStatus('error');
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Unable to extract content from the website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate("/create-project/url-clone");
  };

  const handleContinue = () => {
    if (projectId) {
      navigate(`/create-project/url-clone/customize?projectId=${projectId}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'extracting':
      case 'analyzing':
        return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return <Globe className="w-6 h-6 text-primary" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'extracting':
        return 'Extracting website content...';
      case 'analyzing':
        return 'Analyzing and processing data...';
      case 'completed':
        return 'Content extraction completed!';
      case 'error':
        return 'Extraction failed';
      default:
        return 'Preparing...';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MobileHeader title="Processing URL" />
          
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={status === 'extracting' || status === 'analyzing'}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  {getStatusIcon()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-mono">Processing Website</h1>
                  <p className="text-muted-foreground text-lg mt-2">
                    {url && new URL(url).hostname}
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
                  
                  {status === 'extracting' && (
                    <div className="text-sm text-muted-foreground">
                      Fetching page content and analyzing structure...
                    </div>
                  )}
                  
                  {status === 'analyzing' && (
                    <div className="text-sm text-muted-foreground">
                      Processing content and preparing for video generation...
                    </div>
                  )}

                  {status === 'completed' && extractedContent && (
                    <div className="space-y-4">
                      <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 font-mono">Extracted Content Preview</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title:</p>
                            <p className="font-mono">{extractedContent.title}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Description:</p>
                            <p className="text-sm">{extractedContent.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Generated Script:</p>
                            <p className="text-sm bg-muted/50 p-2 rounded">{(extractedContent as any).script}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleContinue}
                        size="lg"
                        className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                      >
                        Customize Video
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="space-y-4">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-destructive">
                          Unable to extract content from this website. This could be due to:
                        </p>
                        <ul className="text-sm text-destructive mt-2 space-y-1">
                          <li>• Website blocking automated access</li>
                          <li>• Connection timeout</li>
                          <li>• Invalid or inaccessible URL</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={startExtraction}
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

export default URLCloneProcessing;