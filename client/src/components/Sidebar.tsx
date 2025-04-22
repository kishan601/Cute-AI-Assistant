import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";

type SidebarProps = {
  activeConversationId: number | null;
};

const Sidebar = ({ activeConversationId }: SidebarProps) => {
  const [location, setLocation] = useLocation();

  const handleNewChat = () => {
    setLocation("/");
  };

  const handlePastConversations = () => {
    setLocation("/history");
  };

  const handleFeedbackOverview = () => {
    setLocation("/feedback");
  };

  return (
    <div className="w-full md:w-64 bg-white md:h-screen flex flex-col border-r border-gray-200">
      <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
        {/* Mac-like window controls */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      <div className="p-4 flex items-center space-x-2">
        <div className="w-8 h-8 bg-[#9F8FEF] rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z"/>
            <path fill="currentColor" d="M6.5 12h11v1h-11z"/>
            <path fill="currentColor" d="M12 7.5v11h-1v-11z"/>
          </svg>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-semibold">New Chat</span>
          <button className="ml-2 text-gray-400 hover:text-gray-600">
            <EditIcon size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2 px-2">
        <Button
          onClick={handlePastConversations}
          className="w-full py-2 px-4 bg-[#E9E3FF] text-accent rounded-md flex items-center justify-center font-medium transition-colors duration-200 hover:bg-opacity-80"
          variant="ghost"
        >
          Past Conversations
        </Button>
      </div>

      <div className="mt-2 px-2">
        <Button
          onClick={handleFeedbackOverview}
          className="w-full py-2 px-4 text-accent rounded-md flex items-center justify-center font-medium transition-colors duration-200 hover:bg-opacity-80"
          variant="ghost"
        >
          Feedback Overview
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 mt-4">
        {/* Future: Past conversations sidebar items */}
      </div>
    </div>
  );
};

export default Sidebar;
