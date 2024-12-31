import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { AuthFormFooter } from "./AuthFormFooter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendWelcomeEmail } from "@/utils/email";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

interface AuthFormProps {
  selectedPlan?: string;
}

export const AuthForm = ({ selectedPlan }: AuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });

  const stateSelectedPlan = location.state?.selectedPlan;
  const finalSelectedPlan = selectedPlan || stateSelectedPlan || 'free';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setPasswordError(null);

    try {
      console.log("Starting signup process with data:", {
        email: formData.email,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        airline: formData.airline,
        plan: finalSelectedPlan
      });

      // Store the signup data and show disclaimer
      setPendingSignupData({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            user_type: formData.jobTitle.toLowerCase(),
            airline: formData.airline.toLowerCase(),
            subscription_plan: finalSelectedPlan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      setShowDisclaimer(true);

    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisclaimerAccepted = async () => {
    if (!pendingSignupData) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp(pendingSignupData);

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          navigate('/login');
          return;
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return;
      }

      if (!data.user) {
        console.error("No user data returned from signup");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create account. Please try again.",
        });
        return;
      }

      console.log("Signup successful:", data);

      const { error: emailError } = await sendWelcomeEmail({
        email: pendingSignupData.email,
        name: formData.fullName,
      });

      if (emailError) {
        console.error("Error sending welcome email:", emailError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Account created but we couldn't send the welcome email. Please contact support.",
        });
      } else {
        toast({
          title: "Account created",
          description: "Welcome to SkyGuide!",
        });
      }

      navigate('/dashboard');

    } catch (error) {
      console.error("Error during signup after disclaimer acceptance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
      setShowDisclaimer(false);
      setPendingSignupData(null);
    }
  };

  const handleDisclaimerRejected = () => {
    setShowDisclaimer(false);
    setPendingSignupData(null);
    toast({
      variant: "destructive",
      title: "Signup cancelled",
      description: "You must accept the disclaimer to create an account.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthFormHeader />
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields 
              formData={formData}
              showPassword={showPassword}
              setFormData={setFormData}
              setShowPassword={setShowPassword}
            />

            {passwordError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-10 px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <AuthFormFooter />
        </div>
      </div>

      {showDisclaimer && (
        <DisclaimerDialog 
          open={showDisclaimer}
          onAccept={handleDisclaimerAccepted}
          onReject={handleDisclaimerRejected}
        />
      )}
    </div>
  );
};