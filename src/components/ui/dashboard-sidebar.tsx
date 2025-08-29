import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Plus, 
  FolderOpen, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "./button";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Create Campaign",
    href: "/dashboard/create",
    icon: Plus
  },
  {
    title: "My Campaigns",
    href: "/dashboard/campaigns",
    icon: FolderOpen
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error("Error signing out: " + error.message);
        console.error("Logout error:", error);
      } else {
        toast.success("Signed out successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary"></div>
            <span className="text-lg font-semibold text-notion-heading">attendit.live</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-border transform transition-transform duration-200 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary"></div>
            <span className="text-lg font-semibold text-notion-heading">attendit.live</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile User Profile */}
        {user && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <UserAvatar 
                name={user.user_metadata?.name} 
                email={user.email} 
                size="sm" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-notion-body">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-smooth",
                      isActive 
                        ? "bg-accent text-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col h-screen bg-background border-r border-border transition-all duration-200",
        isDesktopCollapsed ? "w-16" : "w-60"
      )}>
        {/* Desktop Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          {!isDesktopCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary"></div>
              <span className="text-lg font-semibold text-notion-heading">attendit.live</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-smooth",
                      isActive 
                        ? "bg-accent text-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      isDesktopCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isDesktopCollapsed && "h-5 w-5")} />
                    {!isDesktopCollapsed && <span className="text-notion-body">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-muted-foreground hover:bg-accent hover:text-foreground",
              isDesktopCollapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", !isDesktopCollapsed && "mr-3")} />
            {!isDesktopCollapsed && <span className="text-notion-body">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="lg:flex h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};