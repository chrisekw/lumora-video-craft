import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Dashboard = () => {
  const { user } = useAuth();

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
          <main className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 font-mono">
                Hi {user?.email?.split('@')[0] || 'User'} 👋 Ready to create?
              </h1>
              <p className="text-muted-foreground font-mono">
                Light up your brand with instant video content
              </p>
            </div>

            {/* New Project Button */}
            <div className="mb-8">
              <Button size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow">
                <Plus className="w-6 h-6 mr-3" />
                New Project
              </Button>
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-xl font-semibold mb-6 font-mono">Recent Projects</h2>
              
              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-semibold mb-2 font-mono">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm font-mono">
                          <Clock className="w-4 h-4 mr-1" />
                          {project.createdAt}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl p-8 text-center">
                  <div className="text-muted-foreground font-mono">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="mb-4">Create your first video project to get started</p>
                    <Button variant="outline" className="rounded-2xl">
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