import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMessageSchema, 
  insertConversationSchema,
  type MessageType,
  type ConversationType
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the chat application
  
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get conversations by rating
  app.get("/api/conversations/rating/:rating", async (req, res) => {
    try {
      const ratingSchema = z.number().min(1).max(5);
      const rating = ratingSchema.parse(parseInt(req.params.rating, 10));
      
      const conversations = await storage.getConversationsByRating(rating);
      res.json(conversations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid rating parameter" });
      } else {
        res.status(500).json({ message: "Failed to fetch conversations by rating" });
      }
    }
  });
  
  // Get a single conversation with messages
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const idSchema = z.number().positive();
      const id = idSchema.parse(parseInt(req.params.id, 10));
      
      const conversation = await storage.getConversationWithMessages(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversation ID" });
      } else {
        res.status(500).json({ message: "Failed to fetch conversation" });
      }
    }
  });
  
  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      // If timestamp is a string, convert it to a Date object
      let requestData = { ...req.body };
      if (requestData.timestamp && typeof requestData.timestamp === 'string') {
        requestData.timestamp = new Date(requestData.timestamp);
      }
      
      const data = insertConversationSchema.parse(requestData);
      const conversation = await storage.createConversation(data);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create conversation" });
      }
    }
  });
  
  // Update conversation feedback
  app.patch("/api/conversations/:id/feedback", async (req, res) => {
    try {
      const idSchema = z.number().positive();
      const id = idSchema.parse(parseInt(req.params.id, 10));
      
      const feedbackSchema = z.object({
        rating: z.number().min(1).max(5),
        feedback: z.string()
      });
      
      const { rating, feedback } = feedbackSchema.parse(req.body);
      
      const updatedConversation = await storage.updateConversationFeedback(id, rating, feedback);
      if (!updatedConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update conversation feedback" });
      }
    }
  });
  
  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });
  
  // Update message feedback (like/dislike)
  app.patch("/api/messages/:id/feedback", async (req, res) => {
    try {
      const idSchema = z.number().positive();
      const id = idSchema.parse(parseInt(req.params.id, 10));
      
      const feedbackSchema = z.object({
        liked: z.boolean().optional(),
        disliked: z.boolean().optional()
      });
      
      const { liked, disliked } = feedbackSchema.parse(req.body);
      
      const updatedMessage = await storage.updateMessageFeedback(id, liked, disliked);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update message feedback" });
      }
    }
  });
  
  // Chat message API
  app.post("/api/chat", async (req, res) => {
    try {
      const messageSchema = z.object({
        conversationId: z.number().positive(),
        message: z.string().min(1)
      });
      
      const { conversationId, message } = messageSchema.parse(req.body);
      
      // Check if conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        sender: "user",
        content: message,
        timestamp: new Date(),
        liked: false,
        disliked: false
      });
      
      // Generate AI response based on user message
      let aiResponse = "Sorry, Did not understand your query!";
      
      // Simple pattern matching for demo purposes
      if (message.toLowerCase().includes('weather')) {
        aiResponse = "I don't have access to real-time weather data, but I can recommend checking a weather app or website for the most current forecast in your area.";
      } else if (message.toLowerCase().includes('location')) {
        aiResponse = "I don't have access to your current location. For privacy reasons, I cannot track or determine where you are.";
      } else if (message.toLowerCase().includes('temperature')) {
        aiResponse = "I don't have the ability to check current temperatures. To get the current temperature in your area, I'd recommend checking a weather website or app.";
      } else if (message.toLowerCase().includes('how are you')) {
        aiResponse = "I'm functioning well, thank you for asking! As Soul AI, I'm here to assist you with information and conversations. How can I help you today?";
      }
      
      // Save AI response
      const aiMessageData = await storage.createMessage({
        conversationId,
        sender: "ai",
        content: aiResponse,
        timestamp: new Date(),
        liked: false,
        disliked: false
      });
      
      res.json({
        userMessage,
        aiMessage: aiMessageData
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chat data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process chat message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
