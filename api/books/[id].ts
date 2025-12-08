import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBook, deleteBook, isSupabaseConfigured } from '../lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Storage not configured. Please set up Supabase." });
  }

  const { id } = req.query;
  const bookId = Array.isArray(id) ? id[0] : id;

  if (!bookId) {
    return res.status(400).json({ error: "Book ID is required" });
  }

  if (req.method === 'GET') {
    try {
      const book = await getBook(bookId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.status(200).json(book);
    } catch (error) {
      console.error("Get book error:", error);
      return res.status(500).json({ error: "Failed to fetch book" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteBook(bookId);
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.status(204).end();
    } catch (error) {
      console.error("Delete book error:", error);
      return res.status(500).json({ error: "Failed to delete book" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
