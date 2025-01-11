import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useConsents } from "@/hooks/useConsents";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";
import { SessionCheck } from "@/components/chat/settings/SessionCheck";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { 
    showCookieConsent, 
    showDisclaimer, 
    handleCookieConsent, 
    handleDisclaimerConsent 
  } = useConsents();

  const showConsentBanner = showCookieConsent && !showDisclaimer;

  return (
    <ThemeProvider>
      <SessionCheck />
      <AppRoutes />
      <Toaster />
      
      {showConsentBanner && (
        <ConsentBanner onAccept={handleCookieConsent} />
      )}
      
      <DisclaimerDialog
        open={showDisclaimer}
        onAccept={() => handleDisclaimerConsent(true)}
        onReject={() => handleDisclaimerConsent(false)}
      />
    </ThemeProvider>
  );
}

export default App;