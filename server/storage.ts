import { type User, type InsertUser, type Book, type InsertBook } from "@shared/schema";
import { randomUUID } from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook, fileBuffer?: Buffer): Promise<Book>;
  incrementDownloadCount(id: string): Promise<void>;
  deleteBook(id: string): Promise<boolean>;
  
  getFileUrl(book: Book): string | null;
  getFileBuffer(bookId: string): Buffer | undefined;
}

// In-memory storage (for development without Supabase)
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private fileStore: Map<string, Buffer>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.fileStore = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook, fileBuffer?: Buffer): Promise<Book> {
    const id = randomUUID();
    const book: Book = { ...insertBook, id, filePath: null, downloadCount: 0 };
    this.books.set(id, book);
    if (fileBuffer) {
      this.fileStore.set(id, fileBuffer);
    }
    return book;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const book = this.books.get(id);
    if (book) {
      book.downloadCount = (book.downloadCount || 0) + 1;
      this.books.set(id, book);
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    const deleted = this.books.delete(id);
    this.fileStore.delete(id);
    return deleted;
  }

  getFileUrl(_book: Book): string | null {
    return null; // In-memory doesn't have URLs
  }

  getFileBuffer(bookId: string): Buffer | undefined {
    return this.fileStore.get(bookId);
  }
}

// Supabase storage (for production)
// NOTE: User storage remains in-memory as this ebook library is public and doesn't require user auth.
// If auth is needed in the future, add a users table to Supabase and implement persistence here.
export class SupabaseStorage implements IStorage {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(this.mapDbBookToBook);
  }

  async getBook(id: string): Promise<Book | undefined> {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return undefined; // Not found
      throw error;
    }
    
    return data ? this.mapDbBookToBook(data) : undefined;
  }

  async createBook(insertBook: InsertBook, fileBuffer?: Buffer): Promise<Book> {
    if (!supabase) throw new Error("Supabase not configured");
    
    const id = randomUUID();
    let filePath = "";
    
    // Upload file to Supabase Storage
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
    
    // Insert book record
    const { data, error } = await supabase
      .from("books")
      .insert({
        id,
        title: insertBook.title,
        author: insertBook.author,
        description: insertBook.description,
        category: insertBook.category,
        file_name: insertBook.fileName,
        file_size: insertBook.fileSize,
        file_path: filePath,
        download_count: 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return this.mapDbBookToBook(data);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { error } = await supabase.rpc("increment_download_count", {
      book_id: id,
    });
    
    // If RPC doesn't exist, do manual update
    if (error) {
      const book = await this.getBook(id);
      if (book) {
        await supabase
          .from("books")
          .update({ download_count: (book.downloadCount || 0) + 1 })
          .eq("id", id);
      }
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase not configured");
    
    // Get book to find file path
    const book = await this.getBook(id);
    if (!book) return false;
    
    // Delete file from storage using the stored file_path
    if (book.filePath) {
      const { error: storageError } = await supabase.storage
        .from("ebooks")
        .remove([book.filePath]);
      
      if (storageError) console.error("Storage delete error:", storageError);
    }
    
    // Delete book record
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id);
    
    return !error;
  }

  getFileUrl(book: Book): string | null {
    if (!supabase || !book.filePath) return null;
    
    const { data } = supabase.storage
      .from("ebooks")
      .getPublicUrl(book.filePath);
    
    return data.publicUrl;
  }

  getFileBuffer(_bookId: string): Buffer | undefined {
    // Supabase uses URLs, not buffers
    return undefined;
  }

  private mapDbBookToBook(dbBook: any): Book {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author,
      description: dbBook.description,
      category: dbBook.category,
      fileName: dbBook.file_name,
      fileSize: dbBook.file_size,
      filePath: dbBook.file_path,
      downloadCount: dbBook.download_count,
    };
  }
}

// Export the appropriate storage based on configuration
export const storage: IStorage = isSupabaseConfigured
  ? new SupabaseStorage()
  : new MemStorage();

console.log(
  isSupabaseConfigured
    ? "Using Supabase storage"
    : "Using in-memory storage (Supabase not configured)"
);
