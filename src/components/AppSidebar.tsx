import { 
  FolderOpen, 
  Layout, 
  CreditCard, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Projects", url: "/dashboard", icon: FolderOpen },
  { title: "Create Video", url: "/create-project", icon: Sparkles },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar 
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow shrink-0">
            <span className="text-white font-bold text-lg font-mono">L</span>
          </div>
          {state === "expanded" && (
            <span className="text-xl font-bold font-mono gradient-text">
              Lumora
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-sidebar-foreground/70">
            {state === "expanded" ? "Main Menu" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`font-mono transition-all duration-200 ${
                      isActive(item.url) 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {state === "expanded" && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <SidebarTrigger className="w-full justify-center hover:bg-sidebar-accent/50 transition-colors">
          {state === "expanded" ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;