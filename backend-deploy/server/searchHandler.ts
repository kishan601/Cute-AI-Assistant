import { Request, Response } from "express";

interface TavilySearchResponse {
  results: {
    title: string;
    url: string;
    content: string;
  }[];
  query: string;
  search_id: string;
}

export async function searchHandler(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Tavily API key is not configured' });
    }
    
    console.log(`Searching Tavily for: ${query}`);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_domains: [],
        exclude_domains: [],
        max_results: 5,
        include_answer: true,
        include_images: false,
        include_raw_content: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tavily API error:', errorData);
      return res.status(response.status).json({ 
        error: `Error from Tavily API: ${response.statusText}`,
        details: errorData
      });
    }
    
    const data: TavilySearchResponse = await response.json();
    
    return res.status(200).json({
      results: data.results,
      searchId: data.search_id,
      query: data.query
    });
  } catch (error) {
    console.error('Error in search handler:', error);
    return res.status(500).json({ error: 'Failed to perform search' });
  }
}