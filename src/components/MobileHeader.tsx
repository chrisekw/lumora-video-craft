import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background lg:hidden">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="p-2 hover:bg-sidebar-accent/50 transition-colors rounded-lg">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm font-mono">L</span>
          </div>
          <span className="text-base font-bold font-mono gradient-text hidden sm:inline">
            Lumora
          </span>
        </Link>
      </div>
      
      <h1 className="text-sm sm:text-base font-semibold font-mono truncate max-w-[140px] sm:max-w-none">{title}</h1>
    </div>
  );
};

export default MobileHeader;