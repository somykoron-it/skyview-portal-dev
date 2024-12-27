import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, User, FileText } from "lucide-react";
import { ChatSettings } from "@/components/chat/ChatSettings";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  return (
    <nav className="border-b border-border/40 bg-gradient-to-r from-brand-navy to-brand-slate shadow-md backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" state={{ fromDashboard: true }} replace>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-white/90 hidden sm:block">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/release-notes">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Release Notes</span>
              </Button>
            </Link>
            
            <NotificationBell />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
            </Button>
            
            <span className="text-sm font-medium text-white/90 hidden sm:block">
              {userEmail}
            </span>
            
            <div className="text-white/90 hover:text-white transition-colors duration-200">
              <ChatSettings />
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onSignOut}
              className="bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all duration-200 border-none"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};