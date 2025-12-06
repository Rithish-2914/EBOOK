import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBook, incrementDownloadCount, getFileUrl, isSupabaseConfigured } from '../../lib/storage';

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

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  try {
    const book = await getBook(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    await incrementDownloadCount(book.id);

    if (isSupabaseConfigured) {
      const fileUrl = getFileUrl(book);
      if (fileUrl) {
        return res.redirect(302, fileUrl);
      }
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(404).json({ error: "File storage not configured" });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Failed to download book" });
  }
}
