import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Send, Save, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSaveConversation: () => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, onSaveConversation, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-resize input height based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter (but not with Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <form 
        id="chatForm" 
        className={cn(
          "flex items-center space-x-2 p-1 transition-all duration-200",
          "bg-white dark:bg-gray-900 rounded-lg",
          isFocused ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : "ring-1 ring-gray-200 dark:ring-gray-700"
        )} 
        onSubmit={handleSubmit}
      >
        <Input
          ref={inputRef}
          type="text"
          id="messageInput"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 px-4 py-3 border-0 shadow-none text-base focus-visible:ring-0 focus-visible:ring-offset-0", 
            "bg-transparent dark:bg-transparent",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400"
          )}
          placeholder={disabled ? "Please wait..." : "Type your message here..."}
          disabled={disabled}
        />
        
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full bg-indigo-600 text-white hover:bg-indigo-700",
                  "dark:bg-indigo-700 dark:hover:bg-indigo-600",
                  "transition-all duration-200",
                  "disabled:opacity-50"
                )}
                disabled={disabled || !message.trim()}
              >
                {disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Send message</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={cn(
                  "h-9 w-9 rounded-full",
                  "border-indigo-200 hover:border-indigo-300 text-indigo-700",
                  "dark:border-indigo-800 dark:hover:border-indigo-700 dark:text-indigo-400",
                  "transition-all duration-200",
                  "disabled:opacity-50"
                )}
                onClick={onSaveConversation}
                disabled={disabled}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Save conversation</TooltipContent>
          </Tooltip>
        </div>
      </form>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd> to send your message
      </div>
    </div>
  );
};

export default ChatInput;
