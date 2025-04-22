import { useState } from "react";
import { MessageType } from "@shared/schema";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageBubbleProps {
  message: MessageType;
  onFeedback: (messageId: number, liked?: boolean, disliked?: boolean) => void;
}

const MessageBubble = ({ message, onFeedback }: MessageBubbleProps) => {
  const { id, sender, content, liked, disliked } = message;
  
  const handleLike = () => {
    onFeedback(id, true, false);
  };
  
  const handleDislike = () => {
    onFeedback(id, false, true);
  };

  // Replace "Soul AI" with a span for styling
  const renderContent = () => {
    if (sender === 'ai' && content.includes('Soul AI')) {
      return content.replace('Soul AI', '<span class="font-semibold text-[#9F8FEF]">Soul AI</span>');
    }
    return content;
  };

  return (
    <div className={`message ${sender === 'user' ? 'user-message' : 'ai-message'}`}>
      <div
        className={`message-bubble group ${
          sender === 'user' ? 'user-bubble' : 'ai-bubble'
        }`}
      >
        {sender === 'ai' && (
          <div className="feedback-buttons">
            <button
              className={`feedback-button ${liked ? 'text-green-500' : ''}`}
              onClick={handleLike}
              aria-label="Like message"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className={`feedback-button ${disliked ? 'text-red-500' : ''}`}
              onClick={handleDislike}
              aria-label="Dislike message"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}
        
        <p dangerouslySetInnerHTML={{ __html: renderContent() }} />
        
        {/* Show feedback indicator if message has feedback */}
        {sender === 'ai' && (liked || disliked) && (
          <div className="mt-2 text-sm">
            {liked ? (
              <span className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-green-500">You liked this response</span>
              </span>
            ) : (
              <span className="flex items-center">
                <ThumbsDown size={14} className="text-red-500 mr-1" />
                <span className="text-red-500">You disliked this response</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
