// Type definitions for the frontend
export type MessageType = {
    id: number;
    conversationId: number;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    liked?: boolean;
    disliked?: boolean;
  };
  
  export type ConversationType = {
    id: number;
    title: string;
    timestamp: string;
    rating: number;
    feedback: string;
    messages?: MessageType[];
  };
  
  export type FeedbackType = {
    conversationId: number;
    rating: number;
    feedback: string;
  };