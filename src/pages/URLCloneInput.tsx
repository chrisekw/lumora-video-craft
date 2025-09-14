import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Globe, ArrowLeft } from "lucide-react";

const URLCloneInput = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to continue",
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

    setIsLoading(true);
    
    try {
      // Navigate to processing page with URL as parameter
      navigate(`/create-project/url-clone/processing?url=${encodeURIComponent(url)}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
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
          <MobileHeader title="Clone from URL" />
          
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
                  Back to Methods
                </Button>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-elegant">
                  <Globe className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-mono">Clone from URL</h1>
                <p className="text-muted-foreground text-lg">
                  Transform any website into an engaging video
                </p>
              </div>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-mono">Website URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="text-lg py-3 font-mono"
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter the URL of the website you'd like to turn into a video
                      </p>
                    </div>

                    <div className="bg-card border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold font-mono">What we'll extract:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Page title and description</li>
                        <li>• Key content and text</li>
                        <li>• Images and visual elements</li>
                        <li>• Structure and layout information</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || !url.trim()}
                      className="w-full text-lg py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
                    >
                      {isLoading ? (
                        "Starting..."
                      ) : (
                        <>
                          Extract Content
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default URLCloneInput;