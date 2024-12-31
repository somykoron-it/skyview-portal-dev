import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-hero-gradient py-8 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-3 py-1 bg-brand-gold/20 rounded-full text-brand-gold font-semibold text-sm mb-4 animate-fade-up">
              Tailored for flight attendants and pilots across all airlines
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              End Contract Confusion— <br className="hidden md:block" />
              Get Instant Answers Now
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-6 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Get instant, accurate answers to your contract questions with SkyGuide. Our advanced system helps you navigate complex contract details, ensuring you understand your rights and make informed decisions with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-primary font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand-gold/20"
                onClick={scrollToPricing}
              >
                Start Free Trial Today
              </Button>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                onClick={scrollToPricing}
              >
                Get Instant Contract Answers
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 font-semibold w-full sm:w-auto px-6 backdrop-blur-sm shadow-lg transform transition-all duration-200 hover:scale-105"
                onClick={() => setShowVideo(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center -mt-4 sm:mt-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-glow-gradient opacity-75" />
              <div className="relative animate-float">
                <img 
                  src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                  alt="SkyGuide Interface" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none">
          <div className="relative pt-[56.25%] w-full overflow-hidden rounded-lg">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/your-video-id?autoplay=1"
              title="SkyGuide Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}