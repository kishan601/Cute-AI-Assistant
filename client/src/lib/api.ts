import { apiRequest } from "./queryClient";
import API_URL from '../config';
import { 
  MessageType, 
  ConversationType, 
  FeedbackType 
} from "@shared/schema";

// API functions for the chat application
export const api = {
  // Conversation APIs
  async getConversations(): Promise<ConversationType[]> {
    const res = await fetch(`${API_URL}/api/conversations`);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },
  
  async getConversation(id: number): Promise<ConversationType> {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  },
  
  async createConversation(title: string): Promise<ConversationType> {
    const res = await apiRequest("POST", "/api/conversations", {
      title,
      timestamp: new Date().toISOString(),
      rating: 0,
      feedback: ""
    });
    return res.json();
  },
  
  async updateConversationTitle(id: number, title: string): Promise<ConversationType> {
    const res = await apiRequest("PATCH", `/api/conversations/${id}/title`, { title });
    return res.json();
  },
  
  async deleteConversation(id: number): Promise<{ message: string }> {
    const res = await apiRequest("DELETE", `/api/conversations/${id}`);
    return res.json();
  },
  
  async getConversationsByRating(rating: number): Promise<ConversationType[]> {
    const res = await fetch(`/api/conversations/rating/${rating}`);
    if (!res.ok) throw new Error("Failed to fetch conversations by rating");
    return res.json();
  },
  
  async submitFeedback(id: number, rating: number, feedback: string): Promise<ConversationType> {
    const res = await apiRequest("PATCH", `/api/conversations/${id}/feedback`, { rating, feedback });
    return res.json();
  },
  
  // Message APIs
  async sendMessage(conversationId: number, message: string): Promise<{ userMessage: MessageType; aiMessage: MessageType }> {
    const res = await apiRequest("POST", "/api/chat", { conversationId, message });
    return res.json();
  },
  
  async updateMessageFeedback(id: number, liked?: boolean, disliked?: boolean): Promise<MessageType> {
    const res = await apiRequest("PATCH", `/api/messages/${id}/feedback`, { liked, disliked });
    return res.json();
  }
};
