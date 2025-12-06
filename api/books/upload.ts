import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBook, isSupabaseConfigured } from '../lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: "Storage not configured. Please set up Supabase." });
  }

  try {
    const { title, author, description, category, fileName, fileSize, fileData } = req.body;

    if (!title || !author || !category || !fileName || !fileSize) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let fileBuffer: Buffer | undefined;
    if (fileData) {
      fileBuffer = Buffer.from(fileData, 'base64');
    }

    const book = await createBook(
      {
        title,
        author,
        description: description || null,
        category,
        fileName,
        fileSize,
      },
      fileBuffer
    );

    return res.status(201).json(book);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload book" });
  }
}
