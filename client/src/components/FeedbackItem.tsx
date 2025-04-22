import { ConversationType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

interface FeedbackItemProps {
  conversation: ConversationType;
}

const FeedbackItem = ({ conversation }: FeedbackItemProps) => {
  const { title, timestamp, rating, feedback } = conversation;
  
  // Format date to relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center space-x-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < rating ? "fill-yellow-400" : "fill-none text-gray-300"}
            />
          ))}
          <span className="ml-1 text-gray-600">{rating}.0</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
      <p className="text-gray-700">{feedback}</p>
    </div>
  );
};

export default FeedbackItem;
