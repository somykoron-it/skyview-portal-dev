import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function MicButton({ isListening, isLoading, onToggle }: MicButtonProps) {
  return (
    <Tooltip content={isListening ? "Stop dictation" : "Start dictation"}>
      <Button 
        type="button"
        size="icon"
        variant="ghost"
        className={`text-white hover:bg-white/10 transition-colors ${isListening ? 'bg-red-500/20' : ''}`}
        disabled={isLoading}
        onClick={onToggle}
        aria-label={isListening ? "Stop dictation" : "Start dictation"}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
    </Tooltip>
  );
}