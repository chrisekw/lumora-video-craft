import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Link, 
  Users, 
  Video, 
  Wand2, 
  Share2, 
  Sparkles 
} from "lucide-react";

const features = [
  {
    icon: Link,
    title: "Clone URLs",
    description: "Paste any link and instantly generate video content. AI analyzes and creates engaging videos from web pages.",
    gradient: "from-primary to-primary-glow"
  },
  {
    icon: Users,
    title: "UGC Builder",
    description: "Pre-built scripts and templates for authentic user-generated content. Perfect for social proof videos.",
    gradient: "from-accent to-primary"
  },
  {
    icon: Video,
    title: "Explainer Videos",
    description: "AI-powered storytelling that transforms complex ideas into compelling visual narratives.",
    gradient: "from-primary to-accent"
  },
  {
    icon: Wand2,
    title: "Video Generator",
    description: "Prompt-to-video generation with advanced AI. Describe your vision and watch it come to life.",
    gradient: "from-accent to-primary-glow"
  },
  {
    icon: Share2,
    title: "Export Anywhere",
    description: "One-click sharing to all major platforms. Optimized formats for TikTok, Instagram, YouTube, and more.",
    gradient: "from-primary-glow to-accent"
  },
  {
    icon: Sparkles,
    title: "Smart Templates",
    description: "Industry-specific templates that adapt to your brand. Professional results in seconds.",
    gradient: "from-accent to-primary"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-subtle">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono mb-4 px-2">
            Everything you need to create{" "}
            <span className="gradient-text">amazing videos</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono px-4">
            Powerful features designed for creators, marketers, and businesses who want professional results without the complexity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-card/50 backdrop-blur-sm border border-border/50 shadow-card hover:shadow-glow transition-spring hover:scale-105 rounded-2xl animate-fade-in delay-${(index % 3) * 100 + 200}`}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-soft transition-spring hover:rotate-6 hover:scale-110`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-mono font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground font-mono leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;