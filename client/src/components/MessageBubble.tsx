import { useState, useRef, useEffect } from "react";
import { MessageType } from "@shared/schema";
import { ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageBubbleProps {
  message: MessageType;
  onFeedback: (messageId: number, liked?: boolean, disliked?: boolean) => void;
}

const MessageBubble = ({ message, onFeedback }: MessageBubbleProps) => {
  const { id, sender, content, timestamp, liked, disliked } = message;
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLike = () => {
    onFeedback(id, true, false);
  };
  
  const handleDislike = () => {
    onFeedback(id, false, true);
  };

  // Replace "Bot AI" with a span for styling
  const renderContent = () => {
    if (sender === 'ai' && content.includes('Bot AI')) {
      return content.replace('Bot AI', '<span class="font-semibold text-indigo-600 dark:text-indigo-400">Bot AI</span>');
    }
    return content;
  };

  // Format the timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div 
      ref={messageRef}
      className={cn(
        "message mb-6 w-full max-w-4xl mx-auto px-4",
        sender === 'user' ? "user-message" : "ai-message",
        !isVisible && "opacity-0",
        isVisible && sender === 'user' ? "animate-slide-in-right" : 
        isVisible && sender === 'ai' ? "animate-slide-in" : ""
      )}
    >
      <div className={cn(
        "flex items-start gap-4 w-full",
        sender === 'user' ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          sender === 'user' 
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" 
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
        )}>
          {sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div className={cn(
          "relative group flex-1",
          sender === 'user' ? "text-right max-w-[85%] md:max-w-[75%] ml-auto" : "text-left max-w-[85%] md:max-w-[75%] mr-auto"
        )}>
          <div className={cn(
            "message-bubble rounded-lg p-4 shadow-sm inline-block",
            sender === 'user' ? 
              "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white dark:from-indigo-600 dark:to-indigo-800 rounded-tr-none" : 
              "bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-tl-none",
            isVisible && "animate-pulse-once"
          )}>
            <p 
              className="message-text whitespace-pre-wrap text-base" 
              dangerouslySetInnerHTML={{ __html: renderContent() }} 
            />
            
            {/* Show feedback indicator if message has feedback */}
            {sender === 'ai' && (liked || disliked) && (
              <div className="mt-3 text-sm px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-700/50">
                {liked ? (
                  <span className="flex items-center">
                    <ThumbsUp size={14} className="text-green-500 mr-1" />
                    <span className="text-green-600 dark:text-green-400 text-xs">You liked this response</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ThumbsDown size={14} className="text-red-500 mr-1" />
                    <span className="text-red-600 dark:text-red-400 text-xs">You disliked this response</span>
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={cn(
            "text-xs text-gray-500 dark:text-gray-400 mt-1",
            sender === 'user' ? "text-right" : "text-left"
          )}>
            {formattedTime}
          </div>
          
          {/* Feedback buttons for AI messages */}
          {sender === 'ai' && (
            <div className={cn(
              "feedback-buttons absolute -right-16 top-0 flex flex-col items-center space-y-2",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "feedback-button w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md",
                      "hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700",
                      liked && "bg-green-50 text-green-500 dark:bg-green-900/30"
                    )}
                    onClick={handleLike}
                    aria-label="Like message"
                  >
                    <ThumbsUp size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {liked ? 'Remove like' : 'Like this response'}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "feedback-button w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md",
                      "hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700",
                      disliked && "bg-red-50 text-red-500 dark:bg-red-900/30"
                    )}
                    onClick={handleDislike}
                    aria-label="Dislike message"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {disliked ? 'Remove dislike' : 'Dislike this response'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;