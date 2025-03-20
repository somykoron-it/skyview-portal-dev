
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Simplified InitialSessionCheck component
function InitialSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log("Checking initial session on app load");
        
        // Skip auth callback route
        if (window.location.pathname === '/auth/callback') {
          return;
        }
        
        // Basic session check
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Active session found");
          
          // On login page with active session - redirect to chat
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
    
    checkInitialSession();
  }, [navigate, toast]);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LazyMotion features={domAnimation}>
          <BrowserRouter>
            <div className="min-h-screen bg-luxury-dark">
              <Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center bg-luxury-dark">
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
