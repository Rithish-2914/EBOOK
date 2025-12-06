import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSupabaseConfigured } from './lib/storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({ 
    status: "ok", 
    storage: isSupabaseConfigured() ? "supabase" : "not-configured" 
  });
}
