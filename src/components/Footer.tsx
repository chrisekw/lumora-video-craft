import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import PrivacyPolicy from "./legal/PrivacyPolicy";
import TermsConditions from "./legal/TermsConditions";
import ContentGuidelines from "./legal/ContentGuidelines";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg font-mono">L</span>
              </div>
              <span className="text-xl font-bold font-mono gradient-text">Lumora</span>
            </div>
            <p className="text-muted-foreground font-mono mb-6 max-w-md">
              Light up your brand with instant video content. Transform any idea into stunning videos with AI-powered automation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold font-mono mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Pricing</a></li>
              <li><a href="#templates" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Templates</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth font-mono">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold font-mono mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth font-mono">Status</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6 sm:my-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground font-mono text-xs sm:text-sm text-center sm:text-left">
            © 2024 Lumora. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center sm:justify-end">
            <PrivacyPolicy />
            <TermsConditions />
            <ContentGuidelines />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;