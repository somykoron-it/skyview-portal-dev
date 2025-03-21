import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Enhanced InitialSessionCheck component with better payment flow handling
function InitialSessionCheck() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log("Checking initial session on app load");
        
        // Skip specific routes that handle their own auth
        if (window.location.pathname === '/auth/callback' || 
            window.location.pathname.includes('/stripe-callback')) {
          console.log("Skipping session check for auth callback route");
          return;
        }
        
        // Check for post-payment flow
        const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
        if (isPostPayment && window.location.pathname === '/login') {
          console.log("Post-payment user landed on login page - attempting to recover session");
          
          // Try to get current session 
          const { data: { session } } = await supabase.auth.getSession(); 
          
          if (session?.user) {
            console.log("Found session after payment, redirecting to chat");
            navigate('/chat', { replace: true });
            return;
          } else {
            // We need to clear these flags if no session is found to prevent login loops
            console.log("No session found after payment, clearing flags");
            localStorage.removeItem('postPaymentConfirmation');
            localStorage.removeItem('selected_plan');
          }
        }
        
        // Basic session check
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Active session found for user:", data.session.user.email);
          
          // Check if user just completed payment
          if (isPostPayment) {
            console.log("Post-payment user with active session, redirecting to chat");
            navigate('/chat', { replace: true });
            return;
          }
          
          // Check user's subscription status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_plan, subscription_status, query_count')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }
          
          console.log("User profile:", profile);
          
          // Free trial ended or not active subscription - redirect to pricing
          if ((profile?.subscription_plan === 'free' && profile?.query_count >= 1) || 
              profile?.subscription_status === 'inactive' ||
              profile?.subscription_plan === 'trial_ended') {
            console.log("Free trial ended or inactive subscription, redirecting to pricing");
            navigate('/?scrollTo=pricing-section', { replace: true });
            return;
          }
          
          // Active subscription or still has free trial - redirect to chat from login pages
          if (window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/') {
            navigate('/chat', { replace: true });
          }
        } else if (window.location.pathname !== '/login' && 
                 window.location.pathname !== '/signup' && 
                 window.location.pathname !== '/' && 
                 window.location.pathname !== '/auth/callback' &&
                 window.location.pathname !== '/privacy-policy' &&
                 window.location.pathname !== '/about') {
          // No session and trying to access protected route
          console.log("No active session found, redirecting to login");
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
      }
    };
    
    // Delay the session check to ensure components are rendered first
    const timer = setTimeout(() => {
      checkInitialSession();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return null;
}

function App() {
  // Add viewport meta tag for proper mobile display
  useEffect(() => {
    // Check if viewport meta tag exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    
    if (!existingViewport) {
      // Create and add viewport meta tag if it doesn't exist
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewportMeta);
    } else {
      // Update existing viewport meta to ensure it has the right settings
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LazyMotion features={domAnimation}>
          <BrowserRouter>
            <div className="min-h-[100dvh] bg-luxury-dark">
              <Suspense fallback={
                <div className="flex h-[100dvh] w-full items-center justify-center bg-luxury-dark">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple/30 to-brand-gold/30 rounded-full blur-xl opacity-50 animate-pulse-subtle" />
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent relative" />
                  </div>
                </div>
              }>
                <InitialSessionCheck />
                <AppRoutes />
              </Suspense>
            </div>
            <Toaster />
          </BrowserRouter>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
