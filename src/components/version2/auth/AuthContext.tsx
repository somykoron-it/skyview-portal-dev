import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import sessionService from "@/services/session/sessionService";

// Define types for clarity
type UserProfile = {
  id: string;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  [key: string]: any; // For other profile fields
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;  // Supabase user
  profile: UserProfile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  createSession: () => Promise<any>;
  refreshSession: () => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  profile: null,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => null,
  createSession: async () => null,
  refreshSession: async () => false,
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Fetch profile function - can be called anywhere to refresh profile data
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      // Update local state
      setProfile(data);
      setIsAdmin(!!data.is_admin);
      
      // Cache profile data
      localStorage.setItem('user_profile', JSON.stringify(data));
      localStorage.setItem('user_is_admin', data.is_admin ? 'true' : 'false');
      
      return data;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  }, []);

  // Create a new session for the current user
  const createSession = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      console.error("Cannot create session: No user ID available");
      return null;
    }

    try {
      const session = await sessionService.createNewSession(user.id);
      setSessionToken(localStorage.getItem('session_token'));
      return session;
    } catch (error) {
      console.error("Error creating new session:", error);
      return null;
    }
  }, [user]);

  // Refresh the current session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      return await sessionService.refreshCurrentSession();
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // First, invalidate our custom session
      const token = localStorage.getItem('session_token');
      if (token) {
        await sessionService.invalidateSessionToken(token);
      }
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('auth_status');
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_is_admin');
      localStorage.removeItem('extended_session');
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setSessionToken(null);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for cached auth status first to avoid flickering
        const cachedAuthStatus = localStorage.getItem('auth_status');
        const cachedProfile = localStorage.getItem('user_profile');
        
        if (cachedAuthStatus === 'authenticated' && cachedProfile) {
          // Pre-populate with cached data while we validate
          setIsAuthenticated(true);
          setProfile(JSON.parse(cachedProfile));
          setIsAdmin(localStorage.getItem('user_is_admin') === 'true');
        }
        
        // Check Supabase session with timeout to prevent hanging
        const authPromise = supabase.auth.getSession();
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth session check timed out')), 5000);
        });
        
        // Race the auth check against the timeout
        const { data: { session } } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any;
        
        if (!session) {
          // No valid session - ensure we're logged out
          localStorage.removeItem('auth_status');
          setIsAuthenticated(false);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
        // We have a Supabase session, so user is authenticated
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('auth_status', 'authenticated');
        
        // Check for existing custom session token
        let token = localStorage.getItem('session_token');
        let isValidSession = false;
        
        if (token) {
          try {
            // Validate existing session with timeout
            const validatePromise = sessionService.validateSessionToken(token);
            const validateTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Session validation timed out')), 3000);
            });
            
            isValidSession = await Promise.race([validatePromise, validateTimeout]) as boolean;
          } catch (error) {
            console.error("Session validation error or timeout:", error);
            isValidSession = false;
          }
        }
        
        // If no valid session, create a new one
        if (!isValidSession) {
          try {
            await sessionService.createNewSession(session.user.id);
            token = localStorage.getItem('session_token');
          } catch (error) {
            console.error("Failed to create new session:", error);
            // Continue even if session creation fails
          }
        }
        
        setSessionToken(token);
        
        // If we didn't have cached profile data, fetch it now
        if (!cachedProfile) {
          await fetchProfile(session.user.id).catch(err => {
            console.error("Error fetching profile:", err);
            // Continue even if profile fetch fails
          });
        } else {
          // Still refresh profile in background without blocking UI
          fetchProfile(session.user.id).catch(console.error);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted auth state
        localStorage.removeItem('auth_status');
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      } finally {
        // Always set loading to false and mark as initialized
        // to prevent the app from getting stuck
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('auth_status', 'authenticated');
          
          // Create new session when signed in
          try {
            await sessionService.createNewSession(session.user.id);
            setSessionToken(localStorage.getItem('session_token'));
          } catch (error) {
            console.error("Failed to create session on sign in:", error);
          }
          
          // Fetch profile
          fetchProfile(session.user.id).catch(console.error);
        }
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setSessionToken(null);
          localStorage.removeItem('auth_status');
          localStorage.removeItem('user_profile');
          localStorage.removeItem('user_is_admin');
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isInitialized, fetchProfile]);

  // Validate session periodically
  useEffect(() => {
    // Don't run if not authenticated or no session token
    if (!isAuthenticated || !sessionToken) return;
    
    // Function to validate session
    const checkSession = async () => {
      try {
        const validatePromise = sessionService.validateSessionToken(sessionToken);
        const validateTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Periodic session validation timed out')), 3000);
        });
        
        const isValid = await Promise.race([validatePromise, validateTimeout]) as boolean;
        
        if (!isValid) {
          console.warn("Session invalid, signing out");
          await signOut();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Don't sign out immediately on check error - might be temporary
      }
    };
    
    // Check session every 15 minutes (less frequent to reduce potential issues)
    const intervalId = setInterval(checkSession, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, sessionToken, signOut]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    profile,
    isAdmin,
    signOut,
    refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(null),
    createSession,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}