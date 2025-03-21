
import { Quote, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface MessageContentProps {
  message: {
    content: string;
    role: string;
  };
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const [displayContent, setDisplayContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message.role === "assistant") {
      setIsTyping(true);
      setIsComplete(false);
      let index = 0;
      const content = message.content;
      
      // Calculate the content height at the beginning to avoid layout shifts
      if (contentRef.current) {
        contentRef.current.style.minHeight = `${Math.max(100, content.length / 5)}px`;
      }
      
      const typingInterval = setInterval(() => {
        if (index <= content.length) {
          setDisplayContent(content.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setIsComplete(true);
          
          // Reset the min height after typing is done
          if (contentRef.current) {
            contentRef.current.style.minHeight = "auto";
          }
        }
      }, 5); // Increased typing speed for better user experience

      return () => clearInterval(typingInterval);
    } else {
      setDisplayContent(message.content);
      setIsComplete(true);
    }
  }, [message.content, message.role]);

  const formatContent = (content: string) => {
    const parts = content.split(/(\[REF\].*?\[\/REF\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[REF]') && part.endsWith('[/REF]')) {
        const quote = part.replace('[REF]', '').replace('[/REF]', '');
        return (
          <div key={index} className="flex items-start gap-2 my-3 p-2 text-pink-300 bg-pink-950/20 rounded-md border-l-4 border-pink-500/50">
            <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
            <em className="italic">{quote}</em>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="whitespace-pre-wrap break-words" ref={contentRef}>
      {formatContent(displayContent)}
      {isTyping && (
        <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
      )}
      {isComplete && message.role === "assistant" && (
        <div className="flex items-center text-xs text-gray-400 mt-2">
          <Check className="h-3 w-3 mr-1" />
          <span>Generated from contract</span>
        </div>
      )}
    </div>
  );
}
