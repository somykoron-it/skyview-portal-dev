// Referrals.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/components/theme-provider";

export default function Referrals() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/login");
          return;
        }

        setUserEmail(session.user.email || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AppLayout>
      <>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
            My Referrals
          </h1>
          <p className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Share SkyGuide with your colleagues and earn rewards.
          </p>
        </div>

        <ReferralSection />
      </>
    </AppLayout>
  );
}