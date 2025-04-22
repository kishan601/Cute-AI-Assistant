import { ConversationType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

interface ConversationItemProps {
  conversation: ConversationType;
  onClick: () => void;
}

const ConversationItem = ({ conversation, onClick }: ConversationItemProps) => {
  const { title, timestamp, rating, messages } = conversation;
  
  // Format date to relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  // Get first user message for preview
  const firstUserMessage = messages?.[0]?.content || "";
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{firstUserMessage}</p>
      {rating > 0 && (
        <div className="flex items-center space-x-1 text-yellow-400 text-sm">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < rating ? "fill-yellow-400" : "fill-none text-gray-300"}
            />
          ))}
          <span className="ml-1 text-gray-600">{rating}.0</span>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
