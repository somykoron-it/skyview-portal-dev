import { supabase } from "@/integrations/supabase/client";
import { getDeviceInfo } from "./deviceInfo";

/**
 * Create a new session for a user
 * @param userId - The user's ID
 * @returns The created session object or null if error
 */
export const createNewSession = async (userId: string): Promise<any> => {
  console.log('Creating new session for user:', userId);
  
  try {
    // Before creating a new session, check if we already have a valid one
    const existingToken = localStorage.getItem('session_token');
    if (existingToken) {
      const isValid = await validateSessionToken(existingToken);
      if (isValid) {
        // If we already have a valid token, just return it
        console.log('Reusing existing valid session');
        return { session_token: existingToken };
      }
    }
    
    // First invalidate any existing sessions
    try {
      const { error: invalidateError } = await supabase
        .rpc('invalidate_other_sessions', {
          p_user_id: userId,
          p_current_session_token: existingToken || ''
        });

      if (invalidateError) {
        console.error('Error invalidating existing sessions:', invalidateError);
        // Continue despite error, as this might be the first session
      }
    } catch (invalidateErr) {
      console.warn('Failed to invalidate sessions, continuing:', invalidateErr);
      // Continue anyway
    }

    // Create new session token
    const sessionToken = crypto.randomUUID();

    // Get device info with timeout
    let deviceInfo;
    try {
      const deviceInfoPromise = getDeviceInfo();
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Device info timed out')), 2000));
      
      deviceInfo = await Promise.race([deviceInfoPromise, timeout]);
    } catch (error) {
      console.warn('Error getting device info, using fallback:', error);
      deviceInfo = { ip: 'unknown', userAgent: navigator.userAgent };
    }
    
    // Create new session with 2 hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);
    
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: deviceInfo.ip || 'unknown',
        status: 'active',
        last_activity: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating new session:', createError);
      throw createError;
    }

    // Store session token
    localStorage.setItem('session_token', sessionToken);
    
    // Ensure refresh token is stored in both localStorage and secure cookie
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.refresh_token) {
        localStorage.setItem('supabase.refresh-token', authSession.refresh_token);
        document.cookie = `sb-refresh-token=${authSession.refresh_token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
      }
    } catch (refreshError) {
      console.warn('Failed to store refresh token, continuing:', refreshError);
    }

    console.log('New session created successfully');
    return session;
  } catch (error) {
    console.error('Error in createNewSession:', error);
    // Still store a token in localStorage even if DB operation fails
    // This prevents continuous attempts to create sessions
    if (!localStorage.getItem('session_token')) {
      const fallbackToken = crypto.randomUUID();
      localStorage.setItem('session_token', fallbackToken);
      console.log('Stored fallback session token due to error');
    }
    throw error;
  }
};

/**
 * Validate a session token
 * @param token - The session token to validate
 * @returns Whether the token is valid
 */
export const validateSessionToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    // Skip validation during API calls
    if (sessionStorage.getItem('api_call_in_progress') === 'true') {
      console.log("API call in progress, skipping token validation");
      return true;
    }
    
    console.log('Validating session token');
    const { data: isValid, error } = await supabase
      .rpc('is_session_valid', {
        p_session_token: token
      });

    if (error) {
      console.error('Error validating session token:', error);
      return false;
    }

    if (isValid) {
      // Update last activity timestamp
      // Don't await this to prevent blocking the validation process
      updateSessionActivity(token).catch(err => 
        console.warn('Non-critical error updating session activity:', err));
    } else {
      console.log('Session token is invalid or expired');
    }

    return !!isValid;
  } catch (error) {
    console.error('Unexpected error validating session:', error);
    return false;
  }
};

/**
 * Update session activity timestamp
 * @param token - The session token
 * @returns Whether the update was successful
 */
export const updateSessionActivity = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ 
        last_activity: new Date().toISOString() 
      })
      .eq('session_token', token);

    if (error) {
      console.warn('Failed to update session activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return false;
  }
};

/**
 * Invalidate a session token
 * @param token - The session token to invalidate
 * @returns Whether the invalidation was successful
 */
export const invalidateSessionToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    console.log('Invalidating session token');
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'invalidated',
        invalidated_at: new Date().toISOString()
      })
      .eq('session_token', token);

    if (error) {
      console.error('Error invalidating session token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error invalidating session:', error);
    return false;
  }
};

/**
 * Invalidate all sessions for a user
 * @param userId - The user's ID
 * @returns Whether the invalidation was successful
 */
export const invalidateAllUserSessions = async (userId: string): Promise<boolean> => {
  try {
    console.log('Invalidating all sessions for user:', userId);
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'invalidated',
        invalidated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error invalidating all user sessions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error invalidating all user sessions:', error);
    return false;
  }
};

/**
 * Get all active sessions for a user
 * @param userId - The user's ID
 * @returns Array of active sessions
 */
export const getUserActiveSessions = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching user sessions:', error);
    return [];
  }
};

/**
 * Extend a session's expiration time
 * @param token - The session token
 * @param hours - Number of hours to extend (default: 2)
 * @returns Whether the extension was successful
 */
export const extendSession = async (token: string | null, hours = 2): Promise<boolean> => {
  if (!token) return false;
  
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);
    
    const { error } = await supabase
      .from('sessions')
      .update({ 
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('session_token', token);

    if (error) {
      console.error('Error extending session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error extending session:', error);
    return false;
  }
};

/**
 * Refresh the current session - validates and extends if valid
 * @returns Whether the refresh was successful
 */
export const refreshCurrentSession = async (): Promise<boolean> => {
  const token = localStorage.getItem('session_token');
  if (!token) return false;
  
  try {
    const isValid = await validateSessionToken(token);
    if (!isValid) return false;
    
    return await extendSession(token);
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
};

/**
 * Clear local session data - for client-side cleanup
 */
export const clearLocalSessionData = (): void => {
  localStorage.removeItem('session_token');
  localStorage.removeItem('auth_status');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('user_is_admin');
  localStorage.removeItem('extended_session');
};

/**
 * Complete session management service object export
 */
const sessionService = {
  createNewSession,
  validateSessionToken,
  updateSessionActivity,
  invalidateSessionToken,
  invalidateAllUserSessions,
  getUserActiveSessions,
  extendSession,
  refreshCurrentSession,
  clearLocalSessionData
};

export default sessionService;