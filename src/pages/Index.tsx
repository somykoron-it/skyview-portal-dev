import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { ReleaseNotePopup } from "@/components/release-notes/ReleaseNotePopup";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistPage } from "@/components/waitlist/WaitlistPage";

export default function Index() {
  const location = useLocation();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistForceOpen, setWaitlistForceOpen] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(true);

  useEffect(() => {
    const loadWaitlistSettings = async () => {
      try {
        setWaitlistLoading(true);
        const { data: showWaitlistData } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'show_waitlist')
          .single();

        const { data: forceOpenData } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'waitlist_force_open')
          .single();

        setShowWaitlist(showWaitlistData?.value === true);
        setWaitlistForceOpen(forceOpenData?.value === true);
      } catch (error) {
        console.error("Error loading waitlist settings:", error);
      } finally {
        setWaitlistLoading(false);
      }
    };

    loadWaitlistSettings();
  }, []);

  useEffect(() => {
    console.log('Index page mounted');
    
    // Check for pricing section scroll
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'pricing-section') {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Check if it's iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if the prompt has been shown before
    const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
    
    console.log('Device checks:', { isIOS, isStandalone, hasShownPrompt });
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }

    return () => {
      console.log('Index page unmounted');
    };
  }, [location]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  if (waitlistLoading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show waitlist page if enabled
  if (showWaitlist) {
    return <WaitlistPage forceOpen={waitlistForceOpen} />;
  }

  // Otherwise show the regular landing page
  return (
    <div className="min-h-screen bg-luxury-dark flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="max-w-[100vw] overflow-x-hidden">
          <Hero />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <Features />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <Testimonials />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <PricingSection />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <ReferralSection />
          </motion.div>
        </div>
      </main>
      <Footer />
      <ReleaseNotePopup />

      <Sheet open={showIOSPrompt} onOpenChange={handleClosePrompt}>
        <SheetContent 
          side="bottom" 
          className="glass-morphism border-t border-white/10 max-h-[80vh] overflow-y-auto pb-safe"
          style={{
            height: "auto",
            minHeight: "280px",
            maxHeight: "min(450px, 80vh)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-white">Install SkyGuide App</SheetTitle>
            <SheetDescription className="text-base text-gray-300">
              <div className="space-y-4 pb-6">
                <p>Install SkyGuide on your iOS device for the best experience:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Tap the Share button <span className="inline-block w-6 h-6 align-middle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L8 6h3v8h2V6h3L12 2zm0 10H3v10h18V12h-9zm-7 8v-6h14v6H5z"/>
                    </svg>
                  </span> in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to install SkyGuide</li>
                </ol>
                <div className="mt-6 mb-4">
                  <button
                    onClick={handleClosePrompt}
                    className="premium-button w-full bg-brand-gold text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-gold/90 transition-colors shadow-gold hover:shadow-gold-hover"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
