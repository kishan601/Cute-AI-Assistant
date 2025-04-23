import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MessageType, ConversationType } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import SuggestedQueries from "@/components/SuggestedQueries";
import FeedbackForm from "@/components/FeedbackForm";
import SearchIndicator from "@/components/SearchIndicator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatProps {
  initialConversationId?: number;
}

const Chat = ({ initialConversationId }: ChatProps) => {
  const [location, setLocation] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(initialConversationId || null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [titleFromFirstMessage, setTitleFromFirstMessage] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/conversations", {
        title,
        timestamp: new Date().toISOString(),
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
      
      // Scroll to the feedback form
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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

  // Scroll lock and auto-scroll functionality
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Handle scroll events to detect if user has scrolled up (to disable auto-scroll)
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    
    // If the user has scrolled up more than 100px, disable auto-scroll and show scroll button
    // If they scroll to bottom, re-enable auto-scroll and hide scroll button
    const scrollFromBottom = scrollHeight - clientHeight - scrollTop;
    const isAtBottom = scrollFromBottom < 50;
    
    setAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom && scrollFromBottom > 200);
  };
  
  // Attach scroll event listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Scroll to bottom when messages change, but only if autoScroll is enabled
  useEffect(() => {
    if (messageContainerRef.current && autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);
  
  // Force scroll to bottom when a new message is being composed
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setAutoScroll(true);
      setShowScrollButton(false);
    }
  };

  // Get active conversation title
  const activeConversationTitle = conversation?.title || "New Conversation";

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar activeConversationId={activeConversationId} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
          {/* Chat Header */}
          <div className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                {activeConversationId ? activeConversationTitle : "Bot AI"}
              </h1>
            </div>
            
            {/* Connection status */}
            <div className="flex items-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                <span>Connected</span>
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div 
            ref={messageContainerRef} 
            className={cn(
              "overflow-y-auto px-4 md:px-6 py-6 h-full chat-container",
              "bg-gray-50 dark:bg-gray-950"
            )}
          >
            {/* Initial greeting view with suggestions */}
            {!activeConversationId || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">
                  How can I help you today?
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  Ask me anything or start with one of the suggested queries below.
                </p>
                
                <SuggestedQueries onQueryClick={handleSendMessage} />
              </div>
            ) : (
              <div className="flex flex-col space-y-4 max-w-3xl mx-auto pb-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onFeedback={handleMessageFeedback}
                  />
                ))}
                
                {chatMessageMutation.isPending && (
                  <>
                    {/* Check if the message might trigger a search */}
                    {messages.length > 0 && 
                     messages[messages.length - 1].sender === 'user' && 
                     shouldShowSearchIndicator(messages[messages.length - 1].content) ? (
                      <SearchIndicator isSearching={true} />
                    ) : (
                      <div className="flex justify-start mb-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {showFeedbackForm && (
                  <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm">
                    <FeedbackForm onSubmit={handleSubmitFeedback} />
                  </div>
                )}
              </div>
            )}
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Button
                ref={scrollButtonRef}
                onClick={scrollToBottom}
                size="sm"
                className={cn(
                  "fixed bottom-24 right-8 rounded-full shadow-md p-2 h-10 w-10",
                  "bg-indigo-600 hover:bg-indigo-700 text-white",
                  "dark:bg-indigo-700 dark:hover:bg-indigo-600",
                  "transition-all duration-300 z-20",
                  "animate-bounce-slow"
                )}
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Chat Input */}
          <div className="sticky bottom-0 z-10">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              onSaveConversation={handleSaveConversation}
              disabled={chatMessageMutation.isPending || isLoadingConversation || showFeedbackForm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
