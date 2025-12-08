import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface BookData {
  title: string;
  author: string;
  description: string | null;
  category: string;
  fileName: string;
  fileSize: number;
}

export async function createBook(
  data: BookData,
  fileBuffer: Buffer,
  thumbnailBuffer?: Buffer
) {
  const supabase = getSupabaseClient();
  
  const bookId = crypto.randomUUID();
  const filePath = `books/${bookId}/${data.fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('ebooks')
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  let thumbnailPath: string | null = null;
  if (thumbnailBuffer) {
    thumbnailPath = `thumbnails/${bookId}.png`;
    const { error: thumbError } = await supabase.storage
      .from('ebooks')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/png',
        upsert: false,
      });
    if (thumbError) {
      console.error('Thumbnail upload failed:', thumbError);
      thumbnailPath = null;
    }
  }

  const insertData: any = {
    id: bookId,
    title: data.title,
    author: data.author,
    description: data.description,
    category: data.category,
    file_name: data.fileName,
    file_size: data.fileSize,
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
    throw new Error(`Failed to save book: ${insertError.message}`);
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    category: book.category,
    fileName: book.file_name,
    fileSize: book.file_size,
    downloadCount: book.download_count,
    filePath: book.file_path,
  };
}

export async function getAllBooks() {
  const supabase = getSupabaseClient();
  
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }

  return books.map((book: any) => {
    let thumbnailUrl: string | null = null;
    if (book.thumbnail_path) {
      const { data } = supabase.storage.from('ebooks').getPublicUrl(book.thumbnail_path);
      thumbnailUrl = data.publicUrl;
    }
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      fileName: book.file_name,
      fileSize: book.file_size,
      downloadCount: book.download_count,
      filePath: book.file_path,
      thumbnailUrl,
    };
  });
}

export async function getBook(id: string) {
  const supabase = getSupabaseClient();
  
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) {
    return null;
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    category: book.category,
    fileName: book.file_name,
    fileSize: book.file_size,
    downloadCount: book.download_count,
    filePath: book.file_path,
  };
}

export async function incrementDownloadCount(id: string) {
  const supabase = getSupabaseClient();
  
  await supabase.rpc('increment_download_count', { book_id: id });
}

export async function deleteBook(id: string) {
  const supabase = getSupabaseClient();
  
  const book = await getBook(id);
  if (!book) return false;

  await supabase.storage.from('ebooks').remove([book.filePath]);
  
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  return !error;
}

export function getFileUrl(filePath: string) {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from('ebooks').getPublicUrl(filePath);
  return data.publicUrl;
}
