import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating = ({ rating, onRatingChange }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const ratingLabels = [
    "Poor",
    "Below Average",
    "Average",
    "Good",
    "Excellent"
  ];
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const isActive = value <= (hoverRating || rating);
          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "star-button p-1 rounded-full transition-all duration-150 transform",
                    isActive && "scale-110",
                    value <= hoverRating && "animate-pulse"
                  )}
                  onClick={() => onRatingChange(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-colors duration-150",
                      isActive 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                    )} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {ratingLabels[value - 1]}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Show the selected rating text */}
      {rating > 0 && (
        <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
          {ratingLabels[rating - 1]}
        </div>
      )}
    </div>
  );
};

export default StarRating;
