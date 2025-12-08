import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import { createBook, isSupabaseConfigured } from '../lib/storage.js';
import { readFileSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedFormData {
  fields: {
    title?: string;
    author?: string;
    description?: string;
    category?: string;
  };
  file?: {
    filepath: string;
    originalFilename: string;
    size: number;
  };
  thumbnail?: {
    filepath: string;
  };
}

async function parseFormData(req: VercelRequest): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const fileArray = files.file;
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      const thumbnailArray = files.thumbnail;
      const thumbnail = Array.isArray(thumbnailArray) ? thumbnailArray[0] : thumbnailArray;

      resolve({
        fields: {
          title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
          author: Array.isArray(fields.author) ? fields.author[0] : fields.author,
          description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
          category: Array.isArray(fields.category) ? fields.category[0] : fields.category,
        },
        file: file ? {
          filepath: file.filepath,
          originalFilename: file.originalFilename || 'unknown.pdf',
          size: file.size,
        } : undefined,
        thumbnail: thumbnail ? {
          filepath: thumbnail.filepath,
        } : undefined,
      });
    });
  });
}

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

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Storage not configured. Please set up Supabase." });
  }

  try {
    const { fields, file, thumbnail } = await parseFormData(req);
    
    const title = fields.title;
    const author = fields.author;
    const description = fields.description;
    const category = fields.category;

    if (!title || !author || !category) {
      return res.status(400).json({ error: "Missing required fields: title, author, and category are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = readFileSync(file.filepath);
    const thumbnailBuffer = thumbnail ? readFileSync(thumbnail.filepath) : undefined;

    const book = await createBook(
      {
        title,
        author,
        description: description || null,
        category,
        fileName: file.originalFilename,
        fileSize: file.size,
      },
      fileBuffer,
      thumbnailBuffer
    );

    return res.status(201).json(book);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload book" });
  }
}
