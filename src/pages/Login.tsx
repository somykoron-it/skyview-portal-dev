import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewSession } from "@/services/session";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import "@/styles/auth-autofill.css";
import { AuthInputField } from "@/components/auth/AuthInputField";
import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import { fetchUserProfile } from "@/utils/user/fetchUserProfile";
import { useAuthStore } from "@/stores/authStores";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const {
    isInitialized,
    loginInProgress,
    rememberMe,
    setLoginInProgress,
    setRememberMe,
    setSkipInitialRedirect,
    handleSuccessfulLogin,
    checkAuthStatus,
    initializeAuth
  } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Store redirectTo path from state if it exists
  const redirectPath = location.state?.redirectTo || "/chat";

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setLoginInProgress(true);

    try {
      // Login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        setLoading(false);
        setLoginInProgress(false);
        return;
      }

      if (authData.session) {
        // Handle successful login through Zustand store
        await handleSuccessfulLogin(authData.session.user, rememberMe);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // Create new session
        await createNewSession(authData.session.user.id);

        // Fetch user profile directly before redirect
        await fetchUserProfile(authData.session.user.id);

        // Redirect to the specified path or default to chat
        window.location.href = redirectPath;
        return; // Stop execution here
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
      setLoginInProgress(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Skip this check if we're already in login flow
      if (loginInProgress) {
        return;
      }

      // Check if user is already logged in
      const isAuth = await checkAuthStatus();
      if (isAuth) {
        console.log(
          `User already authenticated, redirecting to ${redirectPath}`
        );
        
        // Use the utility to break potential redirect loops
        setSkipInitialRedirect(true);
        navigate(redirectPath, { replace: true });
      }
    };

    if (isInitialized) {
      checkAuth();
    }
  }, [isInitialized, loginInProgress, redirectPath, navigate, checkAuthStatus, setSkipInitialRedirect]);

  // Initialize auth store on component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Check for error param in URL (from Google auth callback)
  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam && isInitialized) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description:
          errorParam || "Failed to complete authentication. Please try again.",
      });
    }
  }, [errorParam, toast, isInitialized]);

  // Hide the login form until initial check is complete to prevent flashing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Sign in to SkyGuide"
      subtitle="Enter your credentials to continue."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AuthInputField
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            form={form}
          />
          <AuthInputField
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            form={form}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-white/30 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-gray-300 cursor-pointer"
              >
                Stay logged in for 30 days
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-gold hover:text-brand-gold/80 underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>
          <AuthButton
            loading={loading}
            loadingText="Signing in"
            defaultText="Sign In"
          />

          <AuthDivider />
          <GoogleSignInButton />
          <AuthFooter
            bottomText="Don't have an account?"
            bottomLinkText="Sign up"
            bottomLinkTo="/signup"
          />
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;