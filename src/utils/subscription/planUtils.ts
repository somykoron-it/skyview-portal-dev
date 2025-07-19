import { Profile } from "@/types/profile";

export const formatPlanName = (plan: string): string => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };
  
  export const getButtonLabel = (plan: string): string => {
    if (plan === "monthly") {
      return "Upgrade to Annual";
    } else if (plan === "annual") {
      return "Switch to Monthly";
    } else {
      return "Upgrade Plan";
    }
  };
  
  export const getTargetPlan = (plan: string): string => {
    if (plan === "monthly") {
      return "annual";
    } else if (plan === "annual") {
      return "monthly";
    } else {
      return "monthly"; // Default for free users
    }
  };
  
  export const isButtonDisabled = (plan: string, isUpdating: boolean): boolean => {
    // Disable button if currently on annual plan
    if (plan === "annual") return true;
    return isUpdating;
  };
  // Helper functions for safe subscription access
  export const getSubscriptionPlan = (profile: Profile | null): string => {
    if (!profile?.subscription_id) return "free";
    
    // Check if subscription_id has an error
    if ('error' in profile.subscription_id) return "free";
    
    return profile.subscription_id.plan || "free";
  };
  

export const isTrialExhausted = (profile: Profile | null, queryCount: number): boolean => {
  const plan = getSubscriptionPlan(profile);
  return plan === "free" && queryCount >= 2;
};

export const getSubscriptionInfo = (profile: Profile | null) => {
  return profile?.subscription_id || {
    stripe_subscription_id: null,
    start_at: null,
    end_at: null,
    plan: "free",
    old_plan: null,
    payment_status: null,
    price: null,
  };
};