import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock recent projects data
  const recentProjects = [
    {
      id: 1,
      title: "Product Demo Video",
      thumbnail: "/placeholder.svg",
      createdAt: "2 hours ago",
      duration: "2:30"
    },
    {
      id: 2,
      title: "Social Media Ad",
      thumbnail: "/placeholder.svg",
      createdAt: "1 day ago",
      duration: "0:15"
    },
    {
      id: 3,
      title: "Explainer Video",
      thumbnail: "/placeholder.svg",
      createdAt: "3 days ago",
      duration: "1:45"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <MobileHeader title="Dashboard" />
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-mono">
                Hi {user?.email?.split('@')[0] || 'User'} 👋 Ready to create?
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-mono">
                Light up your brand with instant video content
              </p>
            </div>

            {/* New Project Button */}
            <div className="mb-6 sm:mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/create-project')}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-2xl shadow-glow bg-gradient-primary text-primary-foreground hover:shadow-card transition-all"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                New Project
              </Button>
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 font-mono">Recent Projects</h2>
              
              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {recentProjects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="rounded-2xl hover:shadow-card transition-all duration-300 cursor-pointer group"
                    >
                      <CardHeader className="p-0">
                        <div className="relative aspect-video bg-muted rounded-t-2xl overflow-hidden">
                          <img 
                            src={project.thumbnail} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                            {project.duration}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <CardTitle className="text-base sm:text-lg font-semibold mb-2 font-mono line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-xs sm:text-sm font-mono">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {project.createdAt}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl p-6 sm:p-8 text-center">
                  <div className="text-muted-foreground font-mono">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-sm sm:text-base mb-4">Create your first video project to get started</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/create-project')}
                      className="w-full sm:w-auto rounded-2xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;