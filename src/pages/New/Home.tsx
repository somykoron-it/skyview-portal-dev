import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HomeFAQ } from "@/components/landing/HomeFAQ";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  const handleReferralClick = () => {
    navigate("/login", { state: { redirectTo: "/referral" } });
  };
  return (
    <div className="min-h-screen bg-luxury-dark flex flex-col overflow-hidden">
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
          id="pricing-section-container"
        >
          <div id="pricing-section">
            <PricingSection />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <HomeFAQ />
        </motion.div>

        {/* Replace ReferralSection with a CTA to login for referrals */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Invite Friends & Earn Rewards
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Sign in to access our referral program and earn rewards when your
              friends join SkyGuide.
            </p>
            <Button
              onClick={handleReferralClick}
              className="premium-button bg-brand-gold text-brand-navy font-semibold py-3 px-8 rounded-lg hover:bg-brand-gold/90 transition-colors shadow-gold hover:shadow-gold-hover"
            >
              Sign in to refer friends
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
