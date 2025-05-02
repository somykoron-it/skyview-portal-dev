import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to provide a way to clear local session data
 * This can help users resolve stuck sessions
 */
const ClearSession: React.FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearSession = () => {
    setIsClearing(true);
    
    // Clear all authentication-related localStorage items
    localStorage.removeItem('auth_status');
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_is_admin');
    localStorage.removeItem('extended_session');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('login_in_progress');
    localStorage.removeItem('supabase.refresh-token');
    
    // Clear any session storage items too
    sessionStorage.clear();
    
    // Add a small delay to show feedback to the user
    setTimeout(() => {
      // Reload the page to ensure clean state
      window.location.href = '/login';
    }, 500);
  };

  return (
    <button
      onClick={handleClearSession}
      disabled={isClearing}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center"
    >
      {isClearing ? (
        <>
          <span className="inline-block h-3 w-3 mr-1 rounded-full border border-gray-500 border-t-transparent animate-spin"></span>
          Clearing...
        </>
      ) : (
        "Having trouble? Refresh"
      )}
    </button>
  );
};

export default ClearSession;