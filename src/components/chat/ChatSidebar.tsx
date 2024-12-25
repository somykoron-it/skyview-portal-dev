import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { ChatSettings } from "./ChatSettings";

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-64 sm:w-80 bg-gradient-to-b from-[#1A1F2C] to-[#2A2F3C] border-r border-white/10 flex flex-col">
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1E1E2E] to-[#2A2F3C]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-base">S</span>
          </div>
          <span className="text-white font-semibold text-sm sm:text-base">SkyGuide</span>
        </div>
        <ChatSettings />
      </div>
      
      <div className="p-3 sm:p-4 border-b border-white/10 bg-gradient-to-b from-[#1E1E2E] to-[#2A2F3C]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-8 sm:pl-10 text-sm sm:text-base bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#2A2F3C] to-[#1A1F2C] p-2">
        {/* Conversation history would go here */}
      </div>
    </div>
  );
}