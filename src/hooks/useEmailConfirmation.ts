import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { redirectToProduction } from "@/utils/redirectUtils";

export const useEmailConfirmation = () => {
  const { toast } = useToast();

  const handleEmailConfirmation = async (email: string, token_hash: string) => {
    try {
      console.log('Processing email confirmation');
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: token_hash,
        type: 'signup'
      });

      if (error) {
        console.error('Email confirmation error:', error);
        toast({
          variant: "destructive",
          title: "Confirmation Failed",
          description: "There was an error confirming your email. Please try again."
        });
        redirectToProduction();
        return false;
      }

      // Get user profile to confirm database entry
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profile) {
        console.log('User profile found:', profile);
        // Update profile status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ account_status: 'active' })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      }

      console.log('Email confirmed successfully');
      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed successfully. You can now log in to your account.",
      });
      return true;
    } catch (error) {
      console.error('Unexpected error during email confirmation:', error);
      return false;
    }
  };

  return { handleEmailConfirmation };
};