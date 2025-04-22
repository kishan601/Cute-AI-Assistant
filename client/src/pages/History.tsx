import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ConversationType } from "@shared/schema";
import { X } from "lucide-react";
import ConversationItem from "@/components/ConversationItem";

const History = () => {
  const [location, setLocation] = useLocation();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json() as Promise<ConversationType[]>;
    },
  });

  const handleConversationClick = (id: number) => {
    setLocation(`/?conversation=${id}`);
  };

  const handleClose = () => {
    setLocation("/");
  };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Conversation History</h2>
        <button 
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((conversation) => (
              <ConversationItem 
                key={conversation.id}
                conversation={conversation}
                onClick={() => handleConversationClick(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
