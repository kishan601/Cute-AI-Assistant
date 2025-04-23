import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MessageType, ConversationType } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import SuggestedQueries from "@/components/SuggestedQueries";
import FeedbackForm from "@/components/FeedbackForm";
import SearchIndicator from "@/components/SearchIndicator";
import Footer from "@/components/Footer";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatProps {
  initialConversationId?: number;
}

const Chat = ({ initialConversationId }: ChatProps) => {
  const [location, setLocation] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [titleFromFirstMessage, setTitleFromFirstMessage] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState("");
  const queryClientRef = useQueryClient();
  const { toast } = useToast();

  // Update activeConversationId when initialConversationId changes
  useEffect(() => {
    // Only set the activeConversationId if initialConversationId is provided
    if (initialConversationId) {
      console.log("Setting active conversation ID from props:", initialConversationId);
      setActiveConversationId(initialConversationId);
    } else if (location === "/") {
      // Reset state when navigating to home/new chat
      console.log("Resetting active conversation ID - at root path");
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [initialConversationId, location]);

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      console.log("Creating new conversation with title:", title);
      const res = await apiRequest("POST", "/api/conversations", {
        title,
        timestamp: new Date().toISOString(),
        rating: 0,
        feedback: ""
      });
      return res.json();
    },
    onSuccess: (data: ConversationType) => {
      console.log("Successfully created conversation:", data);
      queryClientRef.invalidateQueries({ queryKey: ["/api/conversations"] });
      // Update the active conversation ID
      setActiveConversationId(data.id);
      // Update URL to reflect the new conversation
      setLocation(`/chat/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      toast({
        title: "Conversation creation failed",
        description: "Could not create a new conversation. Please try again.",
        variant: "destructive"
      });
      setIsProcessingMessage(false);
    }
  });

  // Get conversation with messages if activeConversationId exists
  const { data: conversation, isLoading: isLoadingConversation, error: conversationError } = useQuery({
    queryKey: ["/api/conversations", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      console.log("Fetching conversation:", activeConversationId);
      try {
        const res = await fetch(`/api/conversations/${activeConversationId}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to fetch conversation: ${errorText}`);
          throw new Error("Failed to fetch conversation");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching conversation:", error);
        throw error;
      }
    },
    enabled: !!activeConversationId,
    staleTime: 1000, // 1 second - to prevent excessive refetching
    refetchOnWindowFocus: false, // Disable automatic refetching on window focus
    retry: 1 // Only retry once
  });
  
  // Redirect to home page if conversation not found
  useEffect(() => {
    if (conversationError && activeConversationId) {
      toast({
        title: "Conversation not found",
        description: "Redirecting to home page",
        variant: "destructive"
      });
      
      // Navigate to home page
      setTimeout(() => {
        setActiveConversationId(null);
        setLocation("/");
      }, 1000);
    }
  }, [conversationError, activeConversationId, setLocation]);

  // Submit a chat message
  const chatMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number, message: string }) => {
      console.log(`Sending message to API: ${message} to conversation: ${conversationId}`);
      try {
        const res = await apiRequest("POST", "/api/chat", { conversationId, message });
        return res.json();
      } catch (error) {
        console.error("Error in chat message API call:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Just invalidate the query to fetch the updated conversation
      queryClientRef.invalidateQueries({ 
        queryKey: ["/api/conversations", activeConversationId]
      });
      setIsProcessingMessage(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsProcessingMessage(false);
      toast({
        title: "Failed to send message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive"
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
      
      queryClientRef.invalidateQueries({ 
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
      queryClientRef.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      // Reset state and navigate to home
      setActiveConversationId(null);
      setMessages([]);
      setTitleFromFirstMessage("");
      setLocation("/");
    }
  });

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    // Basic validation
    if (!message.trim()) return;
    if (isProcessingMessage) {
      console.log("Already processing a message, ignoring this one");
      return;
    }

    // Check for duplicate message
    if (message === lastSentMessage) {
      console.log("Duplicate message detected, ignoring:", message);
      return;
    }
    
    // Check if message already exists in current conversation
    if (messages.some(msg => msg.sender === 'user' && msg.content === message)) {
      console.log("This message already exists in conversation, ignoring:", message);
      return;
    }
    
    try {
      setIsProcessingMessage(true);
      setLastSentMessage(message);
      
      // Create a new conversation if one doesn't exist
      if (!activeConversationId) {
        console.log("Creating new conversation from message:", message);
        // Use the message as the title (truncated if needed)
        setTitleFromFirstMessage(message);
        const title = message.length > 30 ? message.slice(0, 27) + "..." : message;
        await createConversationMutation.mutateAsync(title);
        return;
      }
      
      // Send the message to the existing conversation
      console.log("Sending message to conversation:", activeConversationId);
      await chatMessageMutation.mutateAsync({ 
        conversationId: activeConversationId, 
        message 
      });
    } catch (error) {
      console.error("Error handling message:", error);
      setIsProcessingMessage(false);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    }
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

  // Effect to handle the case when activeConversationId is set but titleFromFirstMessage is still pending
  useEffect(() => {
    if (titleFromFirstMessage && activeConversationId) {
      console.log("Sending first message after conversation creation:", titleFromFirstMessage, "to", activeConversationId);
      chatMessageMutation.mutate({
        conversationId: activeConversationId,
        message: titleFromFirstMessage
      });
      setTitleFromFirstMessage("");
    }
  }, [activeConversationId, titleFromFirstMessage, chatMessageMutation]);

  // Update messages when conversation data changes
  useEffect(() => {
    if (conversation && conversation.messages) {
      // Make sure we sort by timestamp to keep messages in order
      const sortedMessages = [...conversation.messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Log for debugging
      console.log("Updating messages from conversation:", activeConversationId, "message count:", sortedMessages.length);
      
      // Check for new messages only
      if (messages.length !== sortedMessages.length) {
        console.log("Message count changed, updating messages");
        setMessages(sortedMessages);
      } else {
        // Only update if there's an actual content difference (using JSON stringify to avoid infinite loop)
        const currentMessagesString = JSON.stringify(messages.map(m => ({ id: m.id, content: m.content })));
        const newMessagesString = JSON.stringify(sortedMessages.map(m => ({ id: m.id, content: m.content })));
        
        if (currentMessagesString !== newMessagesString) {
          console.log("Found new message content, updating state");
          setMessages(sortedMessages);
        }
      }
    }
  }, [conversation, activeConversationId]);

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
  
  // Function to determine if a message might trigger an internet search
  const shouldShowSearchIndicator = (message: string): boolean => {
    const searchKeywords = [
      'search', 'find', 'look up', 'google', 'information', 'about', 
      'what is', 'who is', 'where is', 'when is', 'why is', 'how to',
      'latest', 'recent', 'news', 'current', 'today', 'weather',
      'history', 'facts', 'data'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowercaseMessage.includes(keyword));
  };

  // Render the message list with a key based on message id and text to ensure uniqueness
  const renderMessages = () => {
    // Create a Map to deduplicate messages
    const deduplicatedMessages = new Map<string, MessageType>();
    
    messages.forEach(message => {
      const key = `${message.id}-${message.sender}-${message.content}`;
      deduplicatedMessages.set(key, message);
    });
    
    return Array.from(deduplicatedMessages.values()).map(message => (
      <MessageBubble
        key={`${message.id}-${message.sender}`}
        message={message}
        onFeedback={handleMessageFeedback}
      />
    ));
  };

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
              <div className="flex flex-col space-y-4 w-full max-w-5xl mx-auto pb-4 px-4">
                {renderMessages()}
                
                {chatMessageMutation.isPending && (
                  <SearchIndicator isSearching={true} />
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
              disabled={chatMessageMutation.isPending || isLoadingConversation || showFeedbackForm || isProcessingMessage}
            />
          </div>
          
          {/* Footer */}
          <Footer className="mt-auto" />
        </div>
      </div>
    </div>
  );
};

export default Chat;