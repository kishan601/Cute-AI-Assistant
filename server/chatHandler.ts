import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";

export async function chatHandler(req: Request, res: Response) {
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
      console.error("Chat message error:", error);
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}