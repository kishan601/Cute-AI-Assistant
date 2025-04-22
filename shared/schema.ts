import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping as is from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  sender: text("sender").notNull(), // "user" or "ai"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  liked: boolean("liked").default(false),
  disliked: boolean("disliked").default(false),
});

// Create a custom schema for message inserts that accepts string timestamps
export const insertMessageSchema = z.object({
  conversationId: z.number(),
  sender: z.string(),
  content: z.string(),
  timestamp: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  liked: z.boolean().optional().default(false),
  disliked: z.boolean().optional().default(false)
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  rating: integer("rating").default(0),
  feedback: text("feedback").default(""),
});

// Create a custom schema for conversation inserts that accepts string timestamps
export const insertConversationSchema = z.object({
  title: z.string(),
  timestamp: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  rating: z.number().default(0),
  feedback: z.string().default("")
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

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
