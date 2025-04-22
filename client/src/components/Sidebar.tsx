import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { EditIcon, MessageCircle, PlusCircle, ClockIcon, Loader2 } from "lucide-react";
import { ConversationType } from "@shared/schema";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { truncateText } from "@/lib/utils";

type SidebarProps = {
  activeConversationId: number | null;
};

const Sidebar = ({ activeConversationId }: SidebarProps) => {
  const [location, setLocation] = useLocation();

  // Fetch recent conversations
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: () => api.getConversations()
  });

  const handleNewChat = () => {
    setLocation("/");
  };

  const handlePastConversations = () => {
    setLocation("/history");
  };

  const handleFeedbackOverview = () => {
    setLocation("/feedback");
  };

  const handleConversationClick = (id: number) => {
    setLocation(`/chat/${id}`);
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
      
      <div className="p-4 flex items-center space-x-2 cursor-pointer" onClick={handleNewChat}>
        <div className="w-8 h-8 bg-[#9F8FEF] rounded-full flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-white" />
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

      {/* Recent Conversations section */}
      <div className="mt-4 px-4">
        <h3 className="text-sm font-medium text-gray-500 flex items-center">
          <ClockIcon size={14} className="mr-1" />
          Recent Conversations
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 mt-1">
        {isLoading ? (
          <div className="flex justify-center items-center p-4 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-3">Failed to load conversations</div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`p-2 rounded-md flex items-start mb-1 cursor-pointer hover:bg-gray-100 transition-colors ${
                activeConversationId === conversation.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                <MessageCircle size={14} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{conversation.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500 text-sm">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
