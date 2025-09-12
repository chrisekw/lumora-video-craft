import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Star } from "lucide-react";

const Templates = () => {
  // Mock template data
  const templates = [
    {
      id: 1,
      title: "Product Demo",
      description: "Showcase your product features with sleek animations",
      thumbnail: "/placeholder.svg",
      category: "Business",
      duration: "1:30",
      rating: 4.8,
      isPopular: true
    },
    {
      id: 2,
      title: "Social Media Story",
      description: "Engaging vertical video for Instagram and TikTok",
      thumbnail: "/placeholder.svg",
      category: "Social",
      duration: "0:15",
      rating: 4.9,
      isPopular: true
    },
    {
      id: 3,
      title: "Explainer Video",
      description: "Clear and concise explanations with animated graphics",
      thumbnail: "/placeholder.svg",
      category: "Education",
      duration: "2:45",
      rating: 4.7,
      isPopular: false
    },
    {
      id: 4,
      title: "UGC Testimonial",
      description: "User-generated content style testimonials",
      thumbnail: "/placeholder.svg",
      category: "Marketing",
      duration: "1:00",
      rating: 4.6,
      isPopular: false
    }
  ];

  const categories = ["All", "Business", "Social", "Education", "Marketing"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <main className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 font-mono">Templates</h1>
              <p className="text-muted-foreground font-mono">
                Choose from our collection of professional video templates
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className="rounded-2xl font-mono"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="rounded-2xl hover:shadow-card transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative aspect-video bg-muted rounded-t-2xl overflow-hidden">
                      <img 
                        src={template.thumbnail} 
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute top-2 left-2 flex gap-2">
                        {template.isPopular && (
                          <Badge className="bg-gradient-primary text-white font-mono">
                            Popular
                          </Badge>
                        )}
                        <Badge variant="secondary" className="font-mono">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                        {template.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-semibold font-mono">
                        {template.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 mr-1 fill-current text-accent" />
                        {template.rating}
                      </div>
                    </div>
                    <CardDescription className="text-sm mb-4 font-mono">
                      {template.description}
                    </CardDescription>
                    <Button className="w-full rounded-2xl font-mono" size="sm">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Templates;