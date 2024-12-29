import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromDashboard: true } });
  };

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <a 
              href="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                alt="SkyGuide Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-semibold text-foreground/90">
                SkyGuide
              </span>
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="hidden sm:flex items-center space-x-2">
              <User className="h-5 w-5 text-foreground/70" />
              <span className="text-sm font-medium text-foreground/70">
                {userEmail}
              </span>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onSignOut}
              className="bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};