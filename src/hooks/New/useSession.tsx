import { useAuth } from '@/components/version2/auth/AuthContext';
import { createNewSession, validateSessionToken } from '@/services/session/sessionService';
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing user sessions
 * Provides functionality to create, validate, and refresh sessions
 */
export function useSession() {
  const { user, isAuthenticated } = useAuth();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [lastValidationTime, setLastValidationTime] = useState<number>(0);

  /**
   * Create a new session for the current user
   * @returns Promise<string | null> - The new session token or null if failed
   */
  const createSession = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated || !user?.id) {
      setSessionError('User must be authenticated to create a session');
      return null;
    }

    // Check if we've recently attempted to create a session to prevent rapid consecutive calls
    const now = Date.now();
    if (now - lastValidationTime < 5000) { // Prevent more than one attempt every 5 seconds
      console.log('Skipping session creation - too soon since last attempt');
      return localStorage.getItem('session_token');
    }

    try {
      setIsCreatingSession(true);
      setSessionError(null);
      setLastValidationTime(now);
      
      // Create a new session using the existing service
      await createNewSession(user.id);
      
      // Retrieve the token from localStorage (as done in AuthContext)
      const token = localStorage.getItem('session_token');
      
      return token;
    } catch (error) {
      console.error('Error creating session:', error);
      setSessionError('Failed to create session');
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [isAuthenticated, user, lastValidationTime]);

  /**
   * Validate the current session token
   * @returns Promise<boolean> - Whether the session is valid
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('session_token');
    
    if (!token) {
      setSessionError('No session token found');
      return false;
    }

    // Check if we've recently validated to prevent rapid consecutive calls
    const now = Date.now();
    if (now - lastValidationTime < 10000) { // Prevent more than one validation every 10 seconds
      console.log('Skipping session validation - too soon since last check');
      return true; // Assume valid if recently checked
    }
    
    try {
      setLastValidationTime(now);
      return await validateSessionToken(token);
    } catch (error) {
      console.error('Error validating session:', error);
      setSessionError('Failed to validate session');
      return false;
    }
  }, [lastValidationTime]);

  /**
   * Refresh the current session - validate and create a new one if invalid
   * @returns Promise<string | null> - The session token or null if failed
   */
  const refreshSession = useCallback(async (): Promise<string | null> => {
    const now = Date.now();
    // Don't try to refresh too frequently
    if (now - lastValidationTime < 10000) {
      console.log('Skipping session refresh - too soon since last validation');
      return localStorage.getItem('session_token');
    }
    
    const isValid = await validateSession();
    
    if (isValid) {
      return localStorage.getItem('session_token');
    }
    
    // If not valid, create a new session
    return await createSession();
  }, [validateSession, createSession, lastValidationTime]);

  // Optional effect to validate session on mount
  useEffect(() => {
    // Only validate if we're authenticated
    if (isAuthenticated && user?.id) {
      validateSession().catch(console.error);
    }
  }, [isAuthenticated, user, validateSession]);

  return {
    createSession,
    validateSession,
    refreshSession,
    isCreatingSession,
    sessionError,
  };
}