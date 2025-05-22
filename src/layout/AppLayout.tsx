
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MoonIcon } from "lucide-react";
import { 
  FileText, 
  BarChart2, 
  FileEdit, 
  Search, 
  Video, 
  Home, 
  User, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // State for theme
  const [isDarkMode] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Navigation items
  const navItems = [
    { title: "Dashboard", icon: Home, path: "/app" },
    { title: "Resume Builder", icon: FileText, path: "/app/resume-builder" },
    { title: "Resume Scanner", icon: Search, path: "/app/resume-scanner" },
    { title: "Cover Letter", icon: FileEdit, path: "/app/cover-letter" },
    { title: "Skill Gap Analysis", icon: BarChart2, path: "/app/skill-gap" },
    { title: "Mock Interviews", icon: Video, path: "/app/mock-interview" },

  ];

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="flex items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-lg font-bold">SB</span>
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">SkillBoost</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-4"
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-6 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1">
          <header className="h-14 border-b flex items-center px-6 justify-between bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <span className="md:hidden font-semibold">SkillBoost</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <MoonIcon size={18} />
              </Button>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        
        {/* Mobile bottom navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
            <div className="flex justify-around p-2">
              {navItems.slice(0, 5).map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center"
                >
                  <item.icon size={20} />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
