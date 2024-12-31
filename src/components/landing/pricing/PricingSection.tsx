import { PricingCard } from "./PricingCard";
import { usePlanSelection } from "./usePlanSelection";

export function PricingSection() {
  const { handlePlanSelection, isLoading } = usePlanSelection();

  const pricingPlans = [
    {
      title: "Free Trial",
      price: "0",
      interval: "forever",
      description: "Start exploring our platform with basic features and limited queries.",
      features: [
        "2 Contract Queries",
        "Basic Features",
        "No Credit Card Required"
      ],
      buttonText: "Start Free Trial",
      variant: "teal" as const
    },
    {
      title: "Monthly Plan",
      price: "4.99",
      interval: "month",
      description: "Get unlimited access to all features with our most popular plan.",
      features: [
        "Unlimited Queries",
        "All Features",
        "Priority Support"
      ],
      buttonText: "Choose Monthly",
      variant: "yellow" as const
    },
    {
      title: "Annual Plan",
      price: "49.99",
      interval: "year",
      description: "Save more with our annual plan while getting all premium features.",
      features: [
        "Unlimited Queries",
        "All Features",
        "Priority Support",
        "Annual Savings"
      ],
      buttonText: "Choose Annual",
      variant: "dark" as const
    }
  ];

  return (
    <div id="pricing-section" className="py-20 px-4 bg-[#1A1F2C]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include access to our core features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.title}
              {...plan}
              onSelect={() => handlePlanSelection(plan.title.toLowerCase().split(' ')[0])}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}