import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSaveConversation: () => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, onSaveConversation, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form id="chatForm" className="flex space-x-2" onSubmit={handleSubmit}>
        <Input
          type="text"
          id="messageInput"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Message Bot AI..."
          disabled={disabled}
        />
        <Button
          type="submit"
          className="bg-[#9F8FEF] hover:bg-opacity-90 text-white px-6 py-2 rounded-md"
          disabled={disabled || !message.trim()}
        >
          Ask
        </Button>
        <Button
          type="button"
          className="bg-[#E9E3FF] text-accent px-6 py-2 rounded-md hover:bg-opacity-80"
          onClick={onSaveConversation}
          disabled={disabled}
        >
          Save
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
