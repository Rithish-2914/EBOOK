import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/storage.js';
import crypto from 'node:crypto';

function sanitizeFileName(fileName: string): string {
  const basename = fileName.split(/[/\\]/).pop() || 'file.pdf';
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized || 'file.pdf';
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
    const { fileName } = req.body;
    
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: "fileName is required" });
    }

    const sanitizedFileName = sanitizeFileName(fileName);
    const supabase = getSupabaseClient();
    const bookId = crypto.randomUUID();
    const filePath = `books/${bookId}/${sanitizedFileName}`;
    const thumbnailPath = `thumbnails/${bookId}.png`;

    const { data: fileUploadData, error: fileError } = await supabase.storage
      .from('ebooks')
      .createSignedUploadUrl(filePath);

    if (fileError) {
      throw new Error(`Failed to create file upload URL: ${fileError.message}`);
    }

    const { data: thumbnailUploadData, error: thumbError } = await supabase.storage
      .from('ebooks')
      .createSignedUploadUrl(thumbnailPath);

    if (thumbError) {
      console.error('Failed to create thumbnail upload URL:', thumbError);
    }

    return res.status(200).json({
      bookId,
      filePath,
      sanitizedFileName,
      thumbnailPath: thumbnailUploadData ? thumbnailPath : null,
      fileUploadUrl: fileUploadData.signedUrl,
      fileUploadToken: fileUploadData.token,
      thumbnailUploadUrl: thumbnailUploadData?.signedUrl || null,
      thumbnailUploadToken: thumbnailUploadData?.token || null,
    });
  } catch (error) {
    console.error("Get upload URL error:", error);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
}
