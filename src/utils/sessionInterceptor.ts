import { supabase } from "@/integrations/supabase/client";

export const createSessionInterceptor = (handleSessionInvalid: (message: string) => void) => {
  return {
    async interceptRequest(config: any) {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        handleSessionInvalid("No session token found");
        throw new Error("Unauthorized");
      }

      // Validate session token
      const { data: isValid } = await supabase
        .rpc('is_session_valid', {
          p_session_token: sessionToken
        });

      if (!isValid) {
        handleSessionInvalid("Your session is no longer active. Please log in again.");
        throw new Error("Unauthorized");
      }

      // Add session token to request headers
      config.headers = {
        ...config.headers,
        'Session-Token': sessionToken
      };

      return config;
    },

    async handleResponse(response: any) {
      // Check for 401 responses
      if (response.status === 401) {
        handleSessionInvalid("Your session has expired. Please log in again.");
        throw new Error("Unauthorized");
      }
      return response;
    }
  };
};