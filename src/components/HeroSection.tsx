import { Button } from "@/components/ui/button";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.jpg";

const HeroSection = () => {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold font-mono mb-4 sm:mb-6 leading-tight px-2">
            Light up your brand with{" "}
            <span className="gradient-text">instant video content</span>
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-mono px-4">
            Clone, create, and share videos in minutes. Transform any URL into stunning video content with AI-powered automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-20 scale-110 animate-pulse"></div>
            <div className="relative bg-card rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-card border border-border/50">
              <img 
                src={heroMockup} 
                alt="Lumora video editing interface showcasing modern design and powerful features"
                className="w-full h-auto rounded-xl sm:rounded-2xl shadow-soft float"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;