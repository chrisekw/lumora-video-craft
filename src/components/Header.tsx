import { Button } from "@/components/ui/button";
import { LogIn, Sparkles, User, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-base sm:text-lg font-mono">L</span>
          </div>
          <span className="text-lg sm:text-xl font-bold font-mono gradient-text">Lumora</span>
        </Link>
        
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
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="font-mono gradient-text">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-smooth font-mono text-lg py-2"
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-smooth font-mono text-lg py-2"
                >
                  Pricing
                </a>
                <a 
                  href="#templates" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-smooth font-mono text-lg py-2"
                >
                  Templates
                </a>
                {!user && (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full mt-4">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl hidden sm:flex">
                    <User className="w-4 h-4 mr-2" />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild className="font-mono cursor-pointer">
                    <Link to="/dashboard" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="font-mono text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="hero" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;