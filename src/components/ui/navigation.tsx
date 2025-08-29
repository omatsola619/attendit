import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, Settings, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Container } from "./layout";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const NavLink = ({ href, children, className }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link
      to={href}
      className={cn(
        "text-sm font-medium transition-smooth hover:text-foreground px-2 py-1 rounded",
        isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:bg-accent/50",
        className
      )}
    >
      {children}
    </Link>
  );
};

interface HeaderProps {
  showAuth?: boolean;
}

export const Header = ({ showAuth = true }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [useLocation().pathname]);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error("Error signing out: " + error.message);
        console.error("Logout error:", error);
      } else {
        toast.success("Signed out successfully");
        setShowUserMenu(false);
        // Redirect to home page after logout
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary"></div>
              <span className="text-lg font-semibold text-notion-heading">attendit.live</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/features">Features</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop auth */}
            {showAuth && (
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 h-8 px-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <UserAvatar 
                        name={user.user_metadata?.name} 
                        email={user.email} 
                        size="sm" 
                      />
                      <span className="hidden sm:inline text-sm text-notion-body">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </span>
                    </Button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded shadow-md py-1 z-50">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-smooth text-notion-body"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-smooth w-full text-left text-notion-body"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-notion-body">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild className="text-notion-body">
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-border bg-background/95 backdrop-blur">
            <div className="py-4 space-y-2">
              <NavLink href="/" className="block px-4 py-2 hover:bg-muted rounded-lg transition-smooth">
                Home
              </NavLink>
              <NavLink href="/features" className="block px-4 py-2 hover:bg-muted rounded-lg transition-smooth">
                Features
              </NavLink>
              <NavLink href="/pricing" className="block px-4 py-2 hover:bg-muted rounded-lg transition-smooth">
                Pricing
              </NavLink>
              
              {showAuth && (
                <>
                  {user ? (
                    <div className="border-t border-border pt-4 mt-4 space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <UserAvatar 
                          name={user.user_metadata?.name} 
                          email={user.email} 
                          size="sm" 
                        />
                        <span className="font-medium">
                          {user.user_metadata?.name || user.email?.split('@')[0]}
                        </span>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-smooth"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-smooth w-full text-left text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-border pt-4 mt-4 space-y-2">
                      <Link
                        to="/login"
                        className="block px-4 py-2 hover:bg-muted rounded-lg transition-smooth"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-smooth mx-4"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary"></div>
                <span className="text-xl font-bold">attendit.live</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Create engaging event attendance posters. Upload your event banner, let attendees add their photos, and showcase who's attending your events.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-smooth">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-smooth">Pricing</Link></li>
                <li><Link to="/examples" className="hover:text-primary transition-smooth">Examples</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-smooth">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-smooth">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 attendit.live. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};