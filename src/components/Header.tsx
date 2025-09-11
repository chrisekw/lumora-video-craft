import { Button } from "@/components/ui/button";
import { LogIn, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg font-mono">L</span>
          </div>
          <span className="text-xl font-bold font-mono gradient-text">Lumora</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-smooth font-mono">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-smooth font-mono">
            Pricing
          </a>
          <a href="#templates" className="text-muted-foreground hover:text-primary transition-smooth font-mono">
            Templates
          </a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button variant="hero" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;