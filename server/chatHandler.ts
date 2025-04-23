import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";

// Request processing lock to prevent duplicate message processing
const processingMessages = new Set<string>();

interface TavilySearchResponse {
  results: {
    title: string;
    url: string;
    content: string;
  }[];
  query: string;
  search_id: string;
  answer?: string;
}

// Keywords that indicate a search might be appropriate
const SEARCH_KEYWORDS = [
  'search', 'find', 'look up', 'google', 'information', 'about', 
  'what is', 'who is', 'where is', 'when is', 'why is', 'how to',
  'latest', 'recent', 'news', 'current', 'today', 'weather',
  'history', 'facts', 'data', 'recipe', 'receipe', 'how do I', 'tell me about',
  'what are', 'chocolate', 'make', 'best way to', 'top', 'list of', 'when did',
  'where can I', 'show me', 'price of', 'cost of', 'explain', 'describe'
];

// Common chat messages that should NOT trigger a search
const NON_SEARCH_PHRASES = [
  'hello', 'hi there', 'how are you', 'nice to meet you', 'thanks', 'thank you',
  'goodbye', 'bye', 'see you', 'your name', 'who are you', 'what can you do',
  'help me', 'ok', 'okay', 'yes', 'no', 'please', 'great', 'awesome'
];

// Function to determine if a message likely needs internet search
function shouldPerformSearch(message: string): boolean {
  // Convert to lowercase for case-insensitive matching
  const lowercaseMessage = message.toLowerCase().trim();
  
  // First check if it's a common non-search phrase
  if (NON_SEARCH_PHRASES.some(phrase => lowercaseMessage === phrase || 
      lowercaseMessage.startsWith(phrase + ' ') || 
      lowercaseMessage.endsWith(' ' + phrase))) {
    return false;
  }
  
  // If message is longer than 3 words and not in non-search phrases, likely a search
  const wordCount = lowercaseMessage.split(/\s+/).length;
  if (wordCount >= 3) {
    return true;
  }
  
  // Check if message contains search-indicating keywords
  if (SEARCH_KEYWORDS.some(keyword => lowercaseMessage.includes(keyword))) {
    return true;
  }
  
  // Fallback rule: search for anything that's not a simple greeting
  // and more than one word (except basic conversational phrases)
  return wordCount > 1 && !NON_SEARCH_PHRASES.includes(lowercaseMessage);
}

// Function to perform internet search using Tavily API
async function performSearch(query: string): Promise<{success: boolean, result?: string, error?: string}> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      return { 
        success: false, 
        error: 'Search API key is not configured'
      };
    }
    
    console.log(`Performing internet search for: ${query}`);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_domains: [],
        exclude_domains: [],
        max_results: 5,
        include_answer: true,
        include_images: false,
        include_raw_content: false
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error:', errorText);
      return { 
        success: false, 
        error: `Error from search API: ${response.statusText}`
      };
    }
    
    const data: TavilySearchResponse = await response.json();
    
    if (data.answer) {
      return {
        success: true,
        result: data.answer
      };
    }
    
    // If no direct answer, format the search results
    if (data.results && data.results.length > 0) {
      let formattedResult = `Here's what I found about "${query}":\n\n`;
      
      data.results.forEach((result, index) => {
        formattedResult += `${index + 1}. ${result.title}\n`;
        formattedResult += `   ${result.content.substring(0, 150)}...\n`;
        formattedResult += `   Source: ${result.url}\n\n`;
      });
      
      return {
        success: true,
        result: formattedResult
      };
    }
    
    return {
      success: false,
      error: 'No results found for this query'
    };
    
  } catch (error) {
    console.error('Error in search function:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred during search'
    };
  }
}

export async function chatHandler(req: Request, res: Response) {
  // Define requestKey at function scope so it's available in catch block
  let requestKey = '';
  
  try {
    console.log("Chat handler received request body:", req.body);
    
    const messageSchema = z.object({
      conversationId: z.number().positive(),
      message: z.string().min(1)
    });
    
    const { conversationId, message } = messageSchema.parse(req.body);
    
    // Create a unique key for this request to prevent duplicate processing
    requestKey = `${conversationId}-${message}-${Date.now()}`;
    
    // Check if we're already processing this message
    if (processingMessages.has(requestKey)) {
      console.log("Duplicate message detected, ignoring:", { conversationId, message });
      return res.status(409).json({ message: "Message is already being processed" });
    }
    
    // Add to processing set
    processingMessages.add(requestKey);
    
    console.log("Parsed message request:", { conversationId, message });
    
    // Check if conversation exists
    console.log("Checking for conversation ID:", conversationId);
    const conversation = await storage.getConversation(conversationId);
    console.log("Conversation found:", conversation !== undefined);
    
    if (!conversation) {
      console.log("Conversation not found, returning 404");
      
      // Debugging: Check what conversations actually exist
      const allConversations = await storage.getAllConversations();
      console.log("All available conversations:", allConversations.map(c => c.id));
      
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    console.log("Found conversation:", conversation);
    
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
    let aiResponse = "Sorry, I didn't understand your query.";
    
    // Check if this message might benefit from an internet search
    const shouldSearch = shouldPerformSearch(message);
    console.log(`Message "${message}" - Should search: ${shouldSearch}`);
    
    if (shouldSearch) {
      // Perform search
      const searchResult = await performSearch(message);
      
      if (searchResult.success && searchResult.result) {
        aiResponse = searchResult.result;
      } else {
        // Fallback responses if search failed
        if (message.toLowerCase().includes('weather')) {
          aiResponse = "I tried to search for weather information, but couldn't access real-time data at the moment. You can check a weather service like weather.com for current forecasts.";
        } else if (message.toLowerCase().includes('news')) {
          aiResponse = "I tried to search for news, but couldn't access the latest headlines at the moment. You can check news websites for the most current information.";
        } else {
          aiResponse = `I tried to search the internet for information about your question, but encountered an issue: ${searchResult.error || "couldn't find relevant information"}. Could you try rephrasing your question?`;
        }
      }
    } else {
      // Simple pattern matching for demo purposes when search isn't needed
      if (message.toLowerCase().includes('how are you')) {
        aiResponse = "I'm functioning well, thank you for asking! I'm here to assist you with information and conversations. How can I help you today?";
      } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi ')) {
        aiResponse = "Hello! It's nice to chat with you. How can I assist you today?";
      } else if (message.toLowerCase().includes('thank')) {
        aiResponse = "You're welcome! I'm happy to help. Is there anything else you'd like to know?";
      } else if (message.toLowerCase().includes('your name')) {
        aiResponse = "I'm an AI assistant built to help answer your questions and provide information. Is there something specific you'd like to know about?";
      } else {
        // Suggest using search terms
        aiResponse = "I'm not sure I have enough information about that. Try asking a question with search terms like 'search for...' or 'find information about...' so I can look up the latest information for you.";
      }
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
    
    // Remove from processing set
    processingMessages.delete(requestKey);
    
    res.json({
      userMessage,
      aiMessage: aiMessageData
    });
  } catch (error) {
    // Make sure to cleanup the processing set even if there's an error
    if (requestKey) {
      processingMessages.delete(requestKey);
    }
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