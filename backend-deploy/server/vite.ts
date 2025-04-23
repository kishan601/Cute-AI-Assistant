import express, { type Express } from "express";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// These functions are simplified for backend-only deployment
export async function setupVite(app: Express, server: Server) {
  // For backend-only deployment, add a simple status endpoint
  app.get('/', (req, res) => {
    res.json({ 
      status: 'online',
      message: 'AI Chat Backend API is running',
      version: '1.0.0' 
    });
  });
}

export function serveStatic(app: Express) {
  // For backend-only deployment, add a simple status endpoint
  app.get('/', (req, res) => {
    res.json({ 
      status: 'online',
      message: 'AI Chat Backend API is running',
      version: '1.0.0' 
    });
  });
}