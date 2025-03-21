
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";

export const usePricingCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async (
    name: string,
    priceId: string,
    mode: 'subscription' | 'payment',
    onSelect?: () => Promise<void>
  ) => {
    if (onSelect) {
      try {
        await onSelect();
      } catch (error: any) {
        console.error('Custom onSelect handler error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to process custom selection. Please try again.",
        });
      }
      return;
    }

    try {
      console.log('Starting plan selection in usePricingCard for:', name);
      
      // Show processing toast immediately
      const processingToast = toast({
        variant: "default",
        title: "Processing",
        description: "Preparing your checkout session...",
        duration: 30000, // 30 seconds
      });
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingCard:', sessionError);
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to continue.",
        });
        navigate('/login', { state: { returnTo: 'pricing' } });
        return;
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', name.toLowerCase());
        processingToast.dismiss();
        navigate('/signup', { 
          state: { 
            selectedPlan: name.toLowerCase(),
            priceId,
            mode
          }
        });
        return;
      }

      // Perform a session refresh to ensure we have a fresh token
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Failed to refresh your session. Please log in again.",
        });
        navigate('/login', { state: { returnTo: 'pricing' } });
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        console.error('User email not found in session:', session);
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Error",
          description: "User email not found. Please update your profile.",
        });
        return;
      }

      // Get session token for additional security
      const sessionToken = localStorage.getItem('session_token') || '';
      
      // Call the utility function to create checkout session
      try {
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: userEmail,
          sessionToken
        });
        
        processingToast.dismiss();
        console.log('Redirecting to checkout URL from usePricingCard:', checkoutUrl);
        window.location.href = checkoutUrl;
      } catch (error: any) {
        processingToast.dismiss();
        console.error('Error in createStripeCheckoutSession from usePricingCard:', error);
        
        let errorMessage = "Failed to process plan selection. Please try again.";
        
        // Customize error message based on error type
        if (error.message?.includes('Authentication') || error.message?.includes('session') || error.message?.includes('token')) {
          errorMessage = "Authentication required. Please log in and try again.";
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: errorMessage,
          });
          navigate('/login', { state: { returnTo: 'pricing' } });
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: errorMessage,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || errorMessage,
          });
        }
      }
    } catch (error: any) {
      console.error('Error in usePricingCard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process plan selection. Please try again.",
      });
    }
  };

  return { handlePlanSelection };
};
