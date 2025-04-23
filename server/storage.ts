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
  updateConversationTitle(id: number, title: string): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;
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
    
    // Create sample conversation for testing
    this.initializeTestData();
  }
  
  private initializeTestData() {
    console.log("Initializing test data for chat application...");
    
    // Create a sample conversation
    const sampleConversation: Conversation = {
      id: 1,
      title: "Welcome Conversation",
      timestamp: new Date(),
      rating: 0,
      feedback: ""
    };
    
    this.conversations.set(1, sampleConversation);
    console.log("Created sample conversation with ID:", 1);
    
    // Set the next conversation ID
    this.currentConversationId = 2;
    
    // Create welcome messages
    const userMessage: Message = {
      id: 1,
      conversationId: 1,
      sender: "user",
      content: "Hello, I'm new here!",
      timestamp: new Date(),
      liked: false,
      disliked: false
    };
    
    const aiMessage: Message = {
      id: 2,
      conversationId: 1,
      sender: "ai",
      content: "Welcome! I'm your AI assistant. I can help you find information, answer questions, and more. Try asking me something!",
      timestamp: new Date(),
      liked: false,
      disliked: false
    };
    
    this.messages.set(1, userMessage);
    this.messages.set(2, aiMessage);
    this.currentMessageId = 3;
    
    console.log("Test data initialized successfully!");
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
      id: conversation.id,
      title: conversation.title,
      timestamp: conversation.timestamp.toISOString(),
      rating: conversation.rating || 0,
      feedback: conversation.feedback || "",
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
  
  async updateConversationTitle(id: number, title: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, title };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async deleteConversation(id: number): Promise<boolean> {
    if (!this.conversations.has(id)) return false;
    
    // Delete all messages for this conversation first
    const messages = await this.getMessagesByConversationId(id);
    messages.forEach(message => {
      this.messages.delete(message.id);
    });
    
    // Delete the conversation
    return this.conversations.delete(id);
  }
}

export const storage = new MemStorage();
