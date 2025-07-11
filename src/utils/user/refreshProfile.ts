import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchUserProfile } from "./fetchUserProfile";

/**
 * Refreshes the user profile data after a successful payment
 * This ensures that the local storage is updated with the latest subscription information
 */
export const refreshUserProfileAfterPayment = async (): Promise<any> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Session error or no session found:", sessionError);
      return null;
    }

    const userId = session.user.id;
    if (!userId) {
      console.error("User ID not found in session");
      return null;
    }

    const updatedProfile = await fetchUserProfile(userId);

    if (!updatedProfile) {
      console.error("Failed to fetch updated user profile");
      return null;
    }

    console.log("User profile refreshed successfully after payment:", updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error("Error refreshing user profile after payment:", error);
    return null;
  }
};

/**
 * React hook for refreshing user profile after payment
 * Includes toast notifications for feedback
 */
export const useProfileRefresh = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");

    if (paymentStatus === "success") {
      refreshProfileWithFeedback().then(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("payment_status");
        setSearchParams(newParams);
      });
    } else if (paymentStatus === "cancel") {
      toast({
        title: "Payment Cancelled",
        description: "Your payment process was cancelled. No changes were made to your subscription.",
        variant: "default",
      });

      const newParams = new URLSearchParams(searchParams);
      newParams.delete("payment_status");
      setSearchParams(newParams);
    }
  }, [searchParams, toast, setSearchParams]);

  const refreshProfileWithFeedback = async () => {
    try {
      const updatedProfile = await refreshUserProfileAfterPayment();

      if (updatedProfile) {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been activated successfully.",
          variant: "default",
        });
        return updatedProfile;
      } else {
        toast({
          title: "Profile Update Issue",
          description: "We couldn't verify your subscription status. Please refresh the page.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error in profile refresh:", error);
      toast({
        title: "Profile Refresh Failed",
        description: "There was a problem updating your profile. Please try refreshing the page.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { refreshProfileWithFeedback };
};