import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeSelector } from "./settings/ThemeSelector";
import { FontSizeSelector } from "./settings/FontSizeSelector";
import { NotificationToggle } from "./settings/NotificationToggle";
import { AutoSaveToggle } from "./settings/AutoSaveToggle";
import { AccountInfo } from "./settings/AccountInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme-provider";

export function ChatSettings() {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("chat-font-size") || "medium");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("chat-notifications") === "true");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("chat-auto-save") !== "false");
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  // Apply font size to chat container
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.classList.remove('text-sm', 'text-base', 'text-lg');
      switch (fontSize) {
        case 'small':
          chatContainer.classList.add('text-sm');
          break;
        case 'medium':
          chatContainer.classList.add('text-base');
          break;
        case 'large':
          chatContainer.classList.add('text-lg');
          break;
      }
    }
  }, [fontSize]);

  // Handle auto-save functionality
  useEffect(() => {
    if (autoSave) {
      // Implement auto-save logic here
      const interval = setInterval(() => {
        const conversations = localStorage.getItem('chat-conversations');
        if (conversations) {
          console.log('Auto-saving conversations...');
          // You can implement additional saving logic here
        }
      }, 60000); // Auto-save every minute

      return () => clearInterval(interval);
    }
  }, [autoSave]);

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Sign out successful, clearing local storage...");
      localStorage.removeItem("sb-xnlzqsoujwsffoxhhybk-auth-token");
      
      console.log("Redirecting to home page...");
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session in settings, redirecting to login");
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          className="text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px] bg-[#1E1E2E] border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold text-white">Settings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
          <NotificationToggle notifications={notifications} setNotifications={setNotifications} />
          <AutoSaveToggle autoSave={autoSave} setAutoSave={setAutoSave} />
          <AccountInfo />

          <Button
            variant="destructive"
            className="w-full mt-6"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}