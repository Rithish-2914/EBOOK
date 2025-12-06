import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBook, deleteBook } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  if (req.method === 'GET') {
    try {
      const book = await getBook(id);
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
      const deleted = await deleteBook(id);
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.status(204).end();
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Failed to delete book" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
