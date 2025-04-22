import { 
  users, 
  type User, 
  type InsertUser, 
  messages, 
  type Message, 
  type InsertMessage,
  conversations,
  type Conversation,
  type InsertConversation,
  type MessageType,
  type ConversationType
} from "@shared/schema";

export interface IStorage {
  // User methods (keeping from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  updateMessageFeedback(id: number, liked?: boolean, disliked?: boolean): Promise<Message | undefined>;
  
  // Conversation methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  getConversationWithMessages(id: number): Promise<ConversationType | undefined>;
  updateConversationFeedback(id: number, rating: number, feedback: string): Promise<Conversation | undefined>;
  getConversationsByRating(rating: number): Promise<Conversation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private conversations: Map<number, Conversation>;
  
  currentUserId: number;
  currentMessageId: number;
  currentConversationId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentConversationId = 1;
  }

  // User methods (keeping from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const timestamp = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp,
      liked: insertMessage.liked || false,
      disliked: insertMessage.disliked || false 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.conversationId === conversationId
    );
  }
  
  async updateMessageFeedback(id: number, liked?: boolean, disliked?: boolean): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { 
      ...message, 
      liked: liked !== undefined ? liked : message.liked,
      disliked: disliked !== undefined ? disliked : message.disliked
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const timestamp = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      timestamp,
      rating: insertConversation.rating || 0,
      feedback: insertConversation.feedback || ""
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async getConversationWithMessages(id: number): Promise<ConversationType | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const messagesForConversation = await this.getMessagesByConversationId(id);
    
    return {
      ...conversation,
      timestamp: conversation.timestamp.toISOString(),
      messages: messagesForConversation.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        sender: msg.sender as 'user' | 'ai',
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        liked: msg.liked === null ? undefined : msg.liked,
        disliked: msg.disliked === null ? undefined : msg.disliked
      })).sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    };
  }
  
  async updateConversationFeedback(id: number, rating: number, feedback: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, rating, feedback };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async getConversationsByRating(rating: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.rating === rating)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();
