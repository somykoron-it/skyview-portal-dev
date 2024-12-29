import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { AuthFormFooter } from "./AuthFormFooter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });

  const stateSelectedPlan = location.state?.selectedPlan;
  const finalSelectedPlan = selectedPlan || stateSelectedPlan || 'free';

  useEffect(() => {
    console.log('Selected plan:', finalSelectedPlan);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in");
        toast({
          title: "Welcome to SkyGuide!",
          description: finalSelectedPlan === 'free' 
            ? "Your account has been created. You have 2 queries available."
            : "Your account has been created. Your account is now active.",
        });
        navigate('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, finalSelectedPlan, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setPasswordError(null);

    try {
      console.log("Starting signup process...");
      
      const signUpData = {
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
      };

      console.log("Attempting signup with data:", {
        ...signUpData,
        password: '[REDACTED]'
      });

      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
        return;
      }

      if (!data.user || !data.session) {
        console.log("Signup successful, email confirmation required");
        toast({
          title: "Success",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
        return;
      }

      // If we get here, the user was signed up and confirmed immediately
      console.log("Signup and confirmation successful");
      toast({
        title: "Welcome to SkyGuide!",
        description: "Your account has been created successfully.",
      });
      navigate('/chat');

    } catch (error: any) {
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
    </div>
  );
};