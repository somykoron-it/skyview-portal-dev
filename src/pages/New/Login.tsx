import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        return;
      }

      if (authData.session) {
        localStorage.setItem("auth_status", "authenticated");
        if (rememberMe) localStorage.setItem("extended_session", "true");

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/chat");
      }
    } catch (error) {
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
    <AuthLayout title="Sign in to SkyGuide" subtitle="Enter your credentials to continue.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex items-center gap-3 text-gray-400 text-sm my-2">
            <hr className="flex-grow border-t border-white/10" />
            <span className="text-xs">OR</span>
            <hr className="flex-grow border-t border-white/10" />
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-gold hover:underline hover:text-brand-gold/80"
            >
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;
