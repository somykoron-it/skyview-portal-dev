import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useFreeTrial(currentUserId: string | null, isOffline: boolean) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  const checkFreeTrialStatus = useCallback(async () => {
    if (!currentUserId || isOffline) return;

    try {
      console.log('Checking free trial status for user:', currentUserId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_plan, query_count')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;

      if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
        console.log('Free trial ended - query count:', profile.query_count);
        setIsTrialEnded(true);
        
        // Update the profile to prevent further queries
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ subscription_plan: 'trial_ended' })
          .eq('id', currentUserId);

        if (updateError) {
          console.error('Error updating profile status:', updateError);
        }

        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue.",
          variant: "destructive"
        });
        navigate('/?scrollTo=pricing-section');
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
      setLoadError('Failed to check subscription status');
    }
  }, [currentUserId, isOffline, navigate, toast]);

  // Check trial status on component mount
  useEffect(() => {
    checkFreeTrialStatus();
  }, [checkFreeTrialStatus]);

  return { checkFreeTrialStatus, loadError, isTrialEnded };
}