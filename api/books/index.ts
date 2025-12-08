import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllBooks, isSupabaseConfigured } from '../lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Storage not configured. Please set up Supabase." });
  }

  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error("Get books error:", error);
    return res.status(500).json({ error: "Failed to fetch books" });
  }
}
