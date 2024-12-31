import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

interface PricingFeatureProps {
  text: string;
  textColor?: string;
}

const PricingFeature = ({ text, textColor = "text-gray-600" }: PricingFeatureProps) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-brand-gold" />
    <span className={`text-sm ${textColor}`}>{text}</span>
  </li>
);

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  features: string[];
  badgeText?: string;
  badgeColor?: string;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "gradient";
  className?: string;
  textColor?: string;
  savings?: string;
  planId: string;
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  title,
  price,
  interval,
  features,
  badgeText,
  badgeColor = "bg-brand-navy",
  buttonText,
  buttonVariant = "default",
  className = "",
  textColor = "text-gray-600",
  savings,
  onSelect,
  isLoading,
  disabled
}: PricingCardProps) {
  const getButtonClassName = () => {
    if (disabled) {
      return "w-full bg-gray-300 text-gray-600 cursor-not-allowed";
    }
    
    switch (buttonVariant) {
      case "outline":
        return "w-full bg-white hover:bg-gray-50 text-brand-navy border-2 border-brand-navy hover:border-brand-navy/80 font-semibold";
      case "gradient":
        return "w-full bg-gradient-to-r from-brand-gold to-brand-gold/90 hover:from-brand-gold/90 hover:to-brand-gold text-brand-navy font-semibold shadow-lg hover:shadow-xl transition-shadow";
      default:
        return "w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold shadow-lg hover:shadow-xl transition-shadow";
    }
  };

  return (
    <Card 
      className={`relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl ${className} ${
        disabled ? 'opacity-75' : ''
      } overflow-visible`}
    >
      {badgeText && (
        <div 
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${badgeColor} 
            text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg 
            flex items-center gap-1.5 border border-white/20 backdrop-blur-sm`}
        >
          {badgeText === "Most Popular" && <Star className="h-4 w-4 fill-current" />}
          {badgeText}
        </div>
      )}
      <CardHeader className="space-y-2 pt-8">
        <CardTitle className="text-xl text-brand-navy font-bold">{title}</CardTitle>
        <div className="text-4xl font-bold text-brand-navy">
          {price}
          <span className="text-lg font-normal text-gray-500">/{interval}</span>
        </div>
        {savings && (
          <div className="text-sm text-green-600 font-medium bg-green-50 py-1 px-2 rounded-full inline-block">
            {savings}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <PricingFeature key={index} text={feature} textColor={textColor} />
          ))}
        </ul>
        <Button 
          className={getButtonClassName()}
          onClick={onSelect}
          disabled={isLoading || disabled}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}