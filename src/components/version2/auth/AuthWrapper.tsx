import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
};

export function AuthWrapper({ 
  children, 
  requireAuth = true,
  adminOnly = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  
  // Maximum time to wait for auth before rendering content anyway
  const MAX_AUTH_WAIT_TIME = 3000; // 3 seconds
  
  // State to track if we've waited long enough for auth
  const [forceRender, setForceRender] = useState(false);
  
  // Set up a timer to force render after max wait time
  useEffect(() => {
    if (isLoading && !forceRender) {
      const timer = setTimeout(() => {
        console.log("Auth wait timeout reached, proceeding with current state");
        setForceRender(true);
      }, MAX_AUTH_WAIT_TIME);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, forceRender]);

  // Handle redirects based on auth state
  useEffect(() => {
    // Skip checks if already redirecting to avoid loops
    if (redirecting) return;
    
    // Skip if still loading and haven't reached timeout
    if (isLoading && !forceRender) return;
    
    // If authentication required but not authenticated
    if (requireAuth && !isAuthenticated) {
      setRedirecting(true);
      // Redirect to login with return path
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    // If admin access required but user is not admin
    if (adminOnly && !isAdmin) {
      setRedirecting(true);
      navigate('/dashboard', { replace: true });
      return;
    }

    // If authenticated but on auth pages (login/signup)
    if (isAuthenticated && ['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
      setRedirecting(true);
      navigate('/dashboard', { replace: true });
      return;
    }

    // Reset redirecting state if we didn't redirect
    setRedirecting(false);
  }, [
    isLoading, 
    isAuthenticated, 
    requireAuth, 
    adminOnly, 
    location.pathname, 
    navigate, 
    isAdmin, 
    redirecting,
    forceRender
  ]);

  // Show loading state but only for a limited time
  if ((isLoading && !forceRender) || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent"></div>
      </div>
    );
  }

  // If requireAuth is true but user is not authenticated, show nothing (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If adminOnly is true but user is not admin, show nothing (will redirect)
  if (adminOnly && !isAdmin) {
    return null;
  }

  // Everything is fine, render children
  return <>{children}</>;
}