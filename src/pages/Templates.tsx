import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Templates = () => {
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
    },
    {
      id: 5,
      title: "Corporate Promo",
      description: "Professional corporate promotional content",
      thumbnail: "/placeholder.svg",
      category: "Business",
      duration: "2:00",
      rating: 4.5,
      isPopular: false
    },
    {
      id: 6,
      title: "Tutorial Guide",
      description: "Step-by-step tutorial with screen recordings",
      thumbnail: "/placeholder.svg",
      category: "Education",
      duration: "3:00",
      rating: 4.8,
      isPopular: true
    }
  ];

  const categories = ["All", "Business", "Social", "Education", "Marketing"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <MobileHeader title="Templates" />
          <main className="p-3 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 font-mono">Templates</h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-mono">
                Choose from our collection of professional video templates
              </p>
            </div>

            {/* Category Filter - Horizontal Scroll on Mobile */}
            <ScrollArea className="w-full mb-4 sm:mb-6 lg:mb-8">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === "All" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full font-mono text-xs sm:text-sm whitespace-nowrap shrink-0 h-8 sm:h-9 px-3 sm:px-4"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Templates Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="rounded-xl sm:rounded-2xl hover:shadow-card transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img 
                      src={template.thumbnail} 
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary ml-0.5" />
                      </div>
                    </div>
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {template.isPopular && (
                        <Badge className="bg-gradient-primary text-white font-mono text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          Popular
                        </Badge>
                      )}
                      <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                        {template.category}
                      </Badge>
                    </div>
                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono">
                      {template.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold font-mono line-clamp-1">
                        {template.title}
                      </CardTitle>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground shrink-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 fill-current text-accent" />
                        {template.rating}
                      </div>
                    </div>
                    <CardDescription className="text-[11px] sm:text-xs lg:text-sm mb-2.5 sm:mb-3 font-mono line-clamp-2">
                      {template.description}
                    </CardDescription>
                    <Button className="w-full rounded-full font-mono text-xs sm:text-sm h-8 sm:h-9 bg-gradient-primary hover:opacity-90">
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