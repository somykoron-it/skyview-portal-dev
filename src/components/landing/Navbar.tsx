import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/shared/NotificationBell";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('User is logged in:', session.user.email);
            setIsLoggedIn(true);
            setUserEmail(session.user.email || "");
          } else {
            console.log('No active session found');
            setIsLoggedIn(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          setIsLoggedIn(true);
          setUserEmail(session.user.email || "");
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
          setUserEmail("");
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromNavbar: true } });
  };

  const renderAuthButtons = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
          <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
        </div>
      );
    }

    if (isLoggedIn) {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          
          {/* Mobile View */}
          <div className="flex sm:hidden items-center gap-2">
            <Button 
              asChild
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link to="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link to="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          {/* Tablet/Desktop View */}
          <div className="hidden sm:flex items-center gap-3">
            <Button 
              asChild
              variant="secondary"
              size="sm"
              className="text-white hover:bg-brand-gold hover:text-black"
            >
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Now
              </Link>
            </Button>
            <Button 
              asChild
              variant="secondary"
              size="sm"
              className="text-white hover:bg-brand-gold hover:text-black"
            >
              <Link to="/account">
                <User className="mr-2 h-4 w-4" />
                Account
              </Link>
            </Button>
          </div>
          
          <Button 
            asChild
            size="sm"
            className="bg-brand-gold text-black hover:bg-brand-gold/90"
          >
            <Link to="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Button 
          asChild 
          variant="secondary"
          size="sm"
          className="text-white hover:bg-brand-gold hover:text-black"
        >
          <Link to="/login">
            <LogIn className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        </Button>
        <Button 
          onClick={scrollToPricing}
          size="sm"
          className="bg-brand-gold text-black hover:bg-brand-gold/90"
        >
          <span className="hidden sm:inline">Sign Up</span>
          <span className="sm:hidden">Join</span>
        </Button>
      </div>
    );
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <a 
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-6 w-auto md:h-8"
            />
            <span className="text-foreground text-base md:text-lg font-bold">SkyGuide</span>
          </a>
          {renderAuthButtons()}
        </div>
      </div>
    </nav>
  );
}