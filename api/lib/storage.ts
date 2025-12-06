import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  filePath: string | null;
  downloadCount: number | null;
}

export interface InsertBook {
  title: string;
  author: string;
  description?: string | null;
  fileName: string;
  fileSize: number;
}

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

function mapDbBookToBook(dbBook: any): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    description: dbBook.description,
    fileName: dbBook.file_name,
    fileSize: dbBook.file_size,
    filePath: dbBook.file_path,
    downloadCount: dbBook.download_count,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(mapDbBookToBook);
}

export async function getBook(id: string): Promise<Book | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return undefined;
  }
  
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  
  return data ? mapDbBookToBook(data) : undefined;
}

export async function createBook(insertBook: InsertBook, fileBuffer?: Buffer): Promise<Book> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase not configured");
  }
  
  const id = crypto.randomUUID();
  let filePath = "";
  
  if (fileBuffer) {
    const fileName = `${id}_${insertBook.fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("ebooks")
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    
    if (uploadError) throw uploadError;
    filePath = fileName;
  }
  
  const { data, error } = await supabase
    .from("books")
    .insert({
      id,
      title: insertBook.title,
      author: insertBook.author,
      description: insertBook.description,
      file_name: insertBook.fileName,
      file_size: insertBook.fileSize,
      file_path: filePath,
      download_count: 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return mapDbBookToBook(data);
}

export async function incrementDownloadCount(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  const { error } = await supabase.rpc("increment_download_count", {
    book_id: id,
  });
  
  if (error) {
    const book = await getBook(id);
    if (book && supabase) {
      await supabase
        .from("books")
        .update({ download_count: (book.downloadCount || 0) + 1 })
        .eq("id", id);
    }
  }
}

export async function deleteBook(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const book = await getBook(id);
  if (!book) return false;
  
  if (book.filePath) {
    const { error: storageError } = await supabase.storage
      .from("ebooks")
      .remove([book.filePath]);
    
    if (storageError) console.error("Storage delete error:", storageError);
  }
  
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id);
  
  return !error;
}

export async function getFileUrl(book: Book): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !book.filePath) return null;
  
  const { data } = supabase.storage
    .from("ebooks")
    .getPublicUrl(book.filePath);
  
  return data.publicUrl;
}
