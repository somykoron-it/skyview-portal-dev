
import { format, addMonths, addYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SubscriptionStatusTrackerProps {
  profile: {
    subscription_plan: string;
    last_query_timestamp: string | null;
    subscription_status?: string;
    created_at: string; // Added this to use for subscription calculations when last_query_timestamp is not available
  };
}

export const SubscriptionStatusTracker = ({ profile }: SubscriptionStatusTrackerProps) => {
  const getSubscriptionInfo = () => {
    if (profile.subscription_status !== 'active' || 
       !profile.subscription_plan || 
       (profile.subscription_plan === 'free' || profile.subscription_plan === 'trial_ended')) {
      return {
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        daysLeft: 0,
      };
    }

    // Use created_at as the start date if last_query_timestamp is not available
    // This is a more reliable way to track subscription start
    const startDate = profile.last_query_timestamp 
      ? new Date(profile.last_query_timestamp) 
      : new Date(profile.created_at);
    
    // Calculate end date based on subscription plan
    const endDate = profile.subscription_plan === 'monthly' 
      ? addMonths(startDate, 1)
      : addYears(startDate, 1);
    
    // Calculate progress percentage and days left
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = Date.now() - startDate.getTime();
    const progress = Math.min(Math.max(0, Math.round((elapsed / totalDuration) * 100)), 100);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return { startDate, endDate, progress, daysLeft };
  };

  const { startDate, endDate, progress, daysLeft } = getSubscriptionInfo();

  // If not on an active paid plan, don't show the tracker
  if (profile.subscription_plan === 'free' || 
      profile.subscription_plan === 'trial_ended' || 
      profile.subscription_status !== 'active') {
    return null;
  }

  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader>
        <CardTitle className="text-brand-navy">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Period</span>
            <span className="text-gray-900 font-medium">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {daysLeft} days remaining
            </span>
            <span className="text-sm text-gray-600">
              Auto-renews on {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
