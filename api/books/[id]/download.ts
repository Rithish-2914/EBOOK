import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBook, incrementDownloadCount, getFileUrl, isSupabaseConfigured } from '../../lib/storage.js';

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

  const { id } = req.query;
  const bookId = Array.isArray(id) ? id[0] : id;

  if (!bookId) {
    return res.status(400).json({ error: "Book ID is required" });
  }

  try {
    const book = await getBook(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    await incrementDownloadCount(bookId);

    const fileUrl = getFileUrl(book.filePath);
    return res.redirect(fileUrl);
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Failed to download book" });
  }
}
