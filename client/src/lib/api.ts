import { API_URL } from "../config";
import { 
  MessageType, 
  ConversationType 
} from "../types";

// API functions for the chat application
export const api = {
  // Conversation APIs
  async getConversations(): Promise<ConversationType[]> {
    const res = await fetch(`${API_URL}/api/conversations`);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },
  
  async getConversation(id: number): Promise<ConversationType> {
    const res = await fetch(`${API_URL}/api/conversations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  },
  
  async createConversation(title: string): Promise<ConversationType> {
    const res = await fetch(`${API_URL}/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        timestamp: new Date().toISOString(),
        rating: 0,
        feedback: ""
      }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  },
  
  async updateConversationTitle(id: number, title: string): Promise<ConversationType> {
    const res = await fetch(`${API_URL}/api/conversations/${id}/title`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to update conversation title");
    return res.json();
  },
  
  async deleteConversation(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/conversations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
    return res.json();
  },
  
  async getConversationsByRating(rating: number): Promise<ConversationType[]> {
    const res = await fetch(`${API_URL}/api/conversations/rating/${rating}`);
    if (!res.ok) throw new Error("Failed to fetch conversations by rating");
    return res.json();
  },
  
  async submitFeedback(id: number, rating: number, feedback: string): Promise<ConversationType> {
    const res = await fetch(`${API_URL}/api/conversations/${id}/feedback`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, feedback }),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
  },
  
  // Message APIs
  async sendMessage(conversationId: number, message: string): Promise<{ userMessage: MessageType; aiMessage: MessageType }> {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationId, message }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },
  
  async updateMessageFeedback(id: number, liked?: boolean, disliked?: boolean): Promise<MessageType> {
    const res = await fetch(`${API_URL}/api/messages/${id}/feedback`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ liked, disliked }),
    });
    if (!res.ok) throw new Error("Failed to update message feedback");
    return res.json();
  },
  
  // Search API
  async searchWeb(query: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Failed to search web");
    return res.json();
  }
};