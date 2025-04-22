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
      // Use our dedicated handler for conversation creation
      const { createConversationHandler } = await import('./createConversation');
      return createConversationHandler(req, res);
    } catch (error) {
      console.error("Error importing conversation handler:", error);
      res.status(500).json({ 
        message: "Failed to create conversation",
        error: error instanceof Error ? error.message : String(error)
      });
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
  
  // Rename conversation (update title)
  app.patch("/api/conversations/:id/title", async (req, res) => {
    try {
      const idSchema = z.number().positive();
      const id = idSchema.parse(parseInt(req.params.id, 10));
      
      const titleSchema = z.object({
        title: z.string().min(1)
      });
      
      const { title } = titleSchema.parse(req.body);
      
      const updatedConversation = await storage.updateConversationTitle(id, title);
      if (!updatedConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update conversation title" });
      }
    }
  });
  
  // Delete conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const idSchema = z.number().positive();
      const id = idSchema.parse(parseInt(req.params.id, 10));
      
      const success = await storage.deleteConversation(id);
      if (!success) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversation ID" });
      } else {
        res.status(500).json({ message: "Failed to delete conversation" });
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
      // Use our dedicated handler for chat messages
      const { chatHandler } = await import('./chatHandler');
      return chatHandler(req, res);
    } catch (error) {
      console.error("Error importing chat handler:", error);
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
