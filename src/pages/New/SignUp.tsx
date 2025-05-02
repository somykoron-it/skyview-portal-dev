import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import "@/styles/auth-autofill.css";
import { useForm } from "react-hook-form";
import AuthLayout from "@/components/layout/AuthLayout";

const signupFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (password) => /[0-9]/.test(password),
      "Password must contain at least one number"
    ),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignUp() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const checkPasswordStrength = (password: string) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
  
    try {
      localStorage.setItem("login_in_progress", "true");
  
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
  
      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
        localStorage.removeItem("login_in_progress");
        return;
      }
  
      if (authData.session) {
        // Use upsert instead of insert to handle existing profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: authData.user?.id,
              email: data.email,
              subscription_plan: "free",
              account_status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
  
        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast({
            variant: "destructive",
            title: "Account setup issue",
            description: "There was a problem setting up your account. Please try signing in.",
          });
        }
  
        await supabase.auth.signOut();
        localStorage.removeItem("login_in_progress");
  
        navigate("/login", {
          replace: true,
          state: {
            from_signup: true,
            email: data.email,
          },
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
        localStorage.removeItem("login_in_progress");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      localStorage.removeItem("login_in_progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join SkyGuide"
      subtitle="Create your account and start exploring"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      checkPasswordStrength(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
                <span>Creating account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </Button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <GoogleSignInButton />

          <div className="text-center mt-6">
            <div className="text-xs text-gray-400 mb-3">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-brand-gold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand-gold hover:underline">
                Privacy Policy
              </Link>
            </div>

            <span className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
