import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import ClearSession from "@/components/version2/auth/ClearSession";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
const SignIn = () => {
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
    <div className="flex flex-col gap-2 min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
          aria-label="Back to home page"
        >
          <ArrowLeft size={isMobile ? 16 : 18} />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <Card className="bg-card-gradient border border-white/10 shadow-2xl backdrop-blur-md rounded-2xl">
          <CardContent className="pt-6 px-6">
            <div className="flex flex-col items-center space-y-2 text-center mb-6">
              <img
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
                alt="SkyGuide Logo"
                className="h-12 w-auto mb-2"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Sign in to SkyGuide
              </h1>
              <p className="text-sm text-gray-400">
                Enter your credentials to continue.
              </p>
            </div>

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
                          className="bg-background/30 border-white/10 focus-visible:ring-brand-gold"
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
                            className="bg-background/30 border-white/10 pr-10 focus-visible:ring-brand-gold"
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
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-4">
        <ClearSession />
      </div>
    </div>
  );
};

export default SignIn;
