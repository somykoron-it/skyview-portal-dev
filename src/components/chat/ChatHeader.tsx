import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { ContractUpload } from "./ContractUpload";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();

  return (
    <>
      <ContractUpload />
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Back</span>}
            </Button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="ml-2">Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2">New Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </header>
    </>
  );
}