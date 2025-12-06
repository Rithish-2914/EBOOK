import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllBooks, isSupabaseConfigured } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      if (!isSupabaseConfigured()) {
        return res.status(200).json([]);
      }
      const books = await getAllBooks();
      return res.status(200).json(books);
    } catch (error: any) {
      console.error("Get books error:", error);
      return res.status(500).json({ 
        error: "Failed to fetch books",
        details: error?.message || String(error),
        supabaseConfigured: isSupabaseConfigured()
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
