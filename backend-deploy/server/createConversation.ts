import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";

// This is a standalone handler for creating new conversations
export async function createConversationHandler(req: Request, res: Response) {
  try {
    console.log("Creating conversation with request body:", req.body);
    
    // Explicitly parse the request body with a more flexible schema
    const schema = z.object({
      title: z.string(),
      timestamp: z.string(), // Accept string directly
      rating: z.number().default(0),
      feedback: z.string().default("")
    });
    
    const validatedData = schema.parse(req.body);
    console.log("Validated data:", validatedData);
    
    // Get all existing conversations for debugging
    const existingConversations = await storage.getAllConversations();
    console.log("Existing conversations before creation:", existingConversations.map(c => c.id));
    
    // Create the conversation with a new Date object
    const conversation = await storage.createConversation({
      title: validatedData.title,
      timestamp: new Date(validatedData.timestamp), // Convert the string to Date
      rating: validatedData.rating,
      feedback: validatedData.feedback
    });
    
    console.log("Created conversation:", conversation);
    
    // Verify the conversation was stored correctly
    const storedConversation = await storage.getConversation(conversation.id);
    console.log("Conversation stored successfully:", storedConversation !== undefined);
    
    res.status(201).json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: "Invalid conversation data", 
        errors: error.errors 
      });
    } else {
      console.error("Conversation creation error:", error);
      res.status(500).json({ 
        message: "Failed to create conversation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}