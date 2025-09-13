import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background lg:hidden">
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="p-2 hover:bg-sidebar-accent/50 transition-colors rounded-lg">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>
        <h1 className="text-lg font-semibold font-mono">{title}</h1>
      </div>
    </div>
  );
};

export default MobileHeader;