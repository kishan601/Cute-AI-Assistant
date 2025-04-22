import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MessageType, ConversationType } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import SuggestedQueries from "@/components/SuggestedQueries";
import FeedbackForm from "@/components/FeedbackForm";
import { queryClient, apiRequest } from "@/lib/queryClient";

const Chat = () => {
  const [location, setLocation] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [titleFromFirstMessage, setTitleFromFirstMessage] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/conversations", {
        title,
        timestamp: new Date(),
        rating: 0,
        feedback: ""
      });
      return res.json();
    },
    onSuccess: (data: ConversationType) => {
      setActiveConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Get conversation with messages if activeConversationId exists
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["/api/conversations", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await fetch(`/api/conversations/${activeConversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!activeConversationId
  });

  // Submit a chat message
  const chatMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number, message: string }) => {
      const res = await apiRequest("POST", "/api/chat", { conversationId, message });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prevMessages => [
        ...prevMessages,
        data.userMessage,
        data.aiMessage
      ]);
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", activeConversationId]
      });
    }
  });

  // Update message feedback
  const updateMessageFeedbackMutation = useMutation({
    mutationFn: async ({ id, liked, disliked }: { id: number, liked?: boolean, disliked?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/messages/${id}/feedback`, { liked, disliked });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => msg.id === data.id ? { ...msg, liked: data.liked, disliked: data.disliked } : msg)
      );
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", activeConversationId] 
      });
    }
  });

  // Submit conversation feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ id, rating, feedback }: { id: number, rating: number, feedback: string }) => {
      const res = await apiRequest("PATCH", `/api/conversations/${id}/feedback`, { rating, feedback });
      return res.json();
    },
    onSuccess: () => {
      setShowFeedbackForm(false);
      setActiveConversationId(null);
      setMessages([]);
      setTitleFromFirstMessage("");
      
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Create a new conversation if one doesn't exist
    if (!activeConversationId) {
      setTitleFromFirstMessage(message);
      await createConversationMutation.mutateAsync(message.slice(0, 30) + (message.length > 30 ? "..." : ""));
      return;
    }
    
    // Send the message to the existing conversation
    chatMessageMutation.mutate({ 
      conversationId: activeConversationId, 
      message 
    });
  };

  // Handle message feedback (like/dislike)
  const handleMessageFeedback = (messageId: number, liked?: boolean, disliked?: boolean) => {
    updateMessageFeedbackMutation.mutate({ id: messageId, liked, disliked });
  };

  // Save the conversation and show feedback form
  const handleSaveConversation = () => {
    if (activeConversationId && messages.length > 0) {
      setShowFeedbackForm(true);
    }
  };

  // Submit feedback and finish the conversation
  const handleSubmitFeedback = (rating: number, feedback: string) => {
    if (activeConversationId) {
      submitFeedbackMutation.mutate({
        id: activeConversationId,
        rating,
        feedback
      });
    }
  };

  // Update messages when conversation data changes
  useEffect(() => {
    if (conversation && conversation.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  // Create conversation with title after first message is stored
  useEffect(() => {
    if (titleFromFirstMessage && activeConversationId) {
      chatMessageMutation.mutate({
        conversationId: activeConversationId,
        message: titleFromFirstMessage
      });
      setTitleFromFirstMessage("");
    }
  }, [activeConversationId, titleFromFirstMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="font-inter h-screen flex flex-col md:flex-row overflow-hidden">
      <Sidebar activeConversationId={activeConversationId} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center">
            <h1 className="text-xl font-semibold text-[#9F8FEF]">Bot AI</h1>
          </div>

          {/* Chat Messages Container */}
          <div ref={messageContainerRef} className="overflow-y-auto p-4 h-full bg-secondary chat-container">
            {/* Initial greeting view with suggestions */}
            {!activeConversationId || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-8 text-foreground">How Can I Help You Today?</h2>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-12">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#9F8FEF" opacity="0.2" />
                    <path d="M24 12C17.373 12 12 17.373 12 24C12 30.627 17.373 36 24 36C30.627 36 36 30.627 36 24C36 17.373 30.627 12 24 12ZM24 34C18.486 34 14 29.514 14 24C14 18.486 18.486 14 24 14C29.514 14 34 18.486 34 24C34 29.514 29.514 34 24 34Z" fill="#9F8FEF"/>
                    <path d="M17 24H31V25H17V24Z" fill="#9F8FEF"/>
                    <path d="M24 17V31H23V17H24Z" fill="#9F8FEF"/>
                  </svg>
                </div>
                
                <SuggestedQueries onQueryClick={handleSendMessage} />
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onFeedback={handleMessageFeedback}
                  />
                ))}
                
                {chatMessageMutation.isPending && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {showFeedbackForm && (
                  <FeedbackForm onSubmit={handleSubmitFeedback} />
                )}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onSaveConversation={handleSaveConversation}
            disabled={chatMessageMutation.isPending || isLoadingConversation || showFeedbackForm}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
