import { Button } from "@/components/ui/button";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.jpg";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-6 overflow-hidden">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-mono mb-6 leading-tight">
            Light up your brand with{" "}
            <span className="gradient-text">instant video content</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-mono">
            Clone, create, and share videos in minutes. Transform any URL into stunning video content with AI-powered automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 scale-110 animate-pulse"></div>
            <div className="relative bg-card rounded-3xl p-4 shadow-card border border-border/50">
              <img 
                src={heroMockup} 
                alt="Lumora video editing interface showcasing modern design and powerful features"
                className="w-full h-auto rounded-2xl shadow-soft float"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;