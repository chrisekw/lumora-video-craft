import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Link as LinkIcon, 
  Upload, 
  Wand2, 
  Users, 
  BarChart3 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/components/ui/use-toast";

const projectMethods = [
  {
    id: "paste-url",
    title: "Paste URL",
    description: "Auto-generate video from any webpage",
    icon: LinkIcon,
    gradient: "from-primary/20 to-accent/20",
    iconColor: "text-primary"
  },
  {
    id: "upload-sample",
    title: "Upload Video Sample", 
    description: "Use your video as a template",
    icon: Upload,
    gradient: "from-secondary/20 to-muted/20",
    iconColor: "text-secondary-foreground"
  },
  {
    id: "prompt-video",
    title: "Prompt to Video",
    description: "Generate video from text description",
    icon: Wand2,
    gradient: "from-accent/20 to-primary/20", 
    iconColor: "text-accent-foreground"
  },
  {
    id: "ugc-template",
    title: "Use UGC Template",
    description: "Create user-generated content style videos",
    icon: Users,
    gradient: "from-primary/15 to-accent/15",
    iconColor: "text-primary"
  },
  {
    id: "explainer-video",
    title: "Create Explainer Video",
    description: "AI-powered storytelling videos",
    icon: BarChart3,
    gradient: "from-muted/20 to-secondary/20",
    iconColor: "text-muted-foreground"
  }
];

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    // Navigate to specific method page
    switch (methodId) {
      case 'paste-url':
        navigate('/create-project/url-clone');
        break;
      case 'upload-sample':
        navigate('/create-project/video-clone');
        break;
      case 'prompt-video':
        navigate('/create-project/prompt-to-video');
        break;
      case 'ugc-template':
        navigate('/create-project/ugc-creator');
        break;
      case 'explainer-video':
        navigate('/create-project/explainer-video');
        break;
      default:
        break;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <MobileHeader title="Create Project" />
          
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl lg:text-3xl font-bold font-mono gradient-text mb-3">
                  Choose Creation Method
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
                  Select how you'd like to create your video content. Each method offers unique capabilities to bring your vision to life.
                </p>
              </div>

              {/* Method Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {projectMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  
                  return (
                    <Card 
                      key={method.id}
                      className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-card hover:scale-105 ${
                        isSelected 
                          ? 'ring-2 ring-primary shadow-glow' 
                          : 'hover:shadow-soft'
                      }`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <CardContent className="p-6">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-50`} />
                        
                        {/* Content */}
                        <div className="relative z-10">
                          {/* Icon */}
                          <div className="mb-4">
                            <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-soft">
                              <Icon className={`w-6 h-6 ${method.iconColor}`} />
                            </div>
                          </div>
                          
                          {/* Text */}
                          <h3 className="text-lg font-semibold font-mono mb-2">
                            {method.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {method.description}
                          </p>
                          
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-4 right-4">
                              <div className="w-3 h-3 bg-primary rounded-full shadow-glow" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 lg:mt-12">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 text-sm font-medium font-mono border border-border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  disabled={!selectedMethod}
                  className={`px-8 py-3 text-sm font-medium font-mono rounded-xl transition-all ${
                    selectedMethod
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-card hover:scale-105'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Continue with Selected Method
                </button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CreateProject;