import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { AskSkyGuideButton } from "./AskSkyGuideButton";

export function NavbarContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
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
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    setIsLoggedIn(!!session);
    setIsLoading(false);
    
    navigate('/', { replace: true });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo handleLogoClick={handleLogoClick} />
          
          {isLoggedIn && <AskSkyGuideButton />}
          
          <div className="hidden md:flex items-center space-x-4">
            <AuthButtons 
              isLoading={isLoading} 
              isLoggedIn={isLoggedIn} 
              scrollToPricing={scrollToPricing}
            />
          </div>

          <MobileMenu 
            isLoggedIn={isLoggedIn}
            isLoading={isLoading}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            scrollToPricing={scrollToPricing}
          />
        </div>
      </div>
    </nav>
  );
}