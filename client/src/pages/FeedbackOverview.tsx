import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ConversationType } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackItem from "@/components/FeedbackItem";

const FeedbackOverview = () => {
  const [location, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const { data: allConversations, isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json() as Promise<ConversationType[]>;
    },
  });

  const { data: filteredConversations, isLoading: isLoadingFiltered } = useQuery({
    queryKey: ["/api/conversations/rating", activeFilter],
    queryFn: async () => {
      if (activeFilter === null) return null;
      const res = await fetch(`/api/conversations/rating/${activeFilter}`);
      if (!res.ok) throw new Error("Failed to fetch conversations by rating");
      return res.json() as Promise<ConversationType[]>;
    },
    enabled: activeFilter !== null,
  });

  const handleClose = () => {
    setLocation("/");
  };

  const displayConversations = activeFilter === null 
    ? allConversations?.filter(c => c.rating > 0) 
    : filteredConversations;

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Feedback Overview</h2>
        <button 
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === null ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map(rating => (
            <Button
              key={rating}
              onClick={() => setActiveFilter(rating)}
              className={`px-3 py-1 rounded-full text-sm ${activeFilter === rating ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {rating} {rating === 1 ? 'Star' : 'Stars'}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading || (activeFilter !== null && isLoadingFiltered) ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayConversations && displayConversations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {displayConversations.map((conversation) => (
              <FeedbackItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No feedback found
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverview;
