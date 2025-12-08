import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/storage.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;

function validatePaths(bookId: string, filePath: string, thumbnailPath: string | null): boolean {
  if (!UUID_REGEX.test(bookId)) return false;
  
  const expectedFilePrefix = `books/${bookId}/`;
  if (!filePath.startsWith(expectedFilePrefix)) return false;
  
  const fileName = filePath.slice(expectedFilePrefix.length);
  if (!SAFE_FILENAME_REGEX.test(fileName)) return false;
  
  if (thumbnailPath !== null) {
    const expectedThumbnailPath = `thumbnails/${bookId}.png`;
    if (thumbnailPath !== expectedThumbnailPath) return false;
  }
  
  return true;
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
    return res.status(503).json({ error: "Storage not configured" });
  }

  try {
    const { 
      bookId, 
      title, 
      author, 
      description, 
      category, 
      fileName, 
      fileSize, 
      filePath,
      thumbnailPath 
    } = req.body;

    if (!bookId || !title || !author || !category || !fileName || !fileSize || !filePath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validatePaths(bookId, filePath, thumbnailPath || null)) {
      return res.status(400).json({ error: "Invalid file paths" });
    }

    const supabase = getSupabaseClient();

    const { data: fileExists } = await supabase.storage
      .from('ebooks')
      .list(`books/${bookId}`);

    if (!fileExists || fileExists.length === 0) {
      return res.status(400).json({ error: "File not found in storage. Please upload the file first." });
    }

    const insertData: Record<string, unknown> = {
      id: bookId,
      title,
      author,
      description: description || null,
      category,
      file_name: fileName,
      file_size: fileSize,
      file_path: filePath,
      download_count: 0,
    };

    if (thumbnailPath) {
      insertData.thumbnail_path = thumbnailPath;
    }

    const { data: book, error: insertError } = await supabase
      .from('books')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from('ebooks').remove([filePath]);
      if (thumbnailPath) {
        await supabase.storage.from('ebooks').remove([thumbnailPath]);
      }
      throw new Error(`Failed to save book: ${insertError.message}`);
    }

    return res.status(201).json({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      fileName: book.file_name,
      fileSize: book.file_size,
      downloadCount: book.download_count,
      filePath: book.file_path,
    });
  } catch (error) {
    console.error("Save metadata error:", error);
    return res.status(500).json({ error: "Failed to save book metadata" });
  }
}
