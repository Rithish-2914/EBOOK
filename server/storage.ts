import { type User, type InsertUser, type Book, type InsertBook } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  incrementDownloadCount(id: string): Promise<void>;
  deleteBook(id: string): Promise<boolean>;
  
  // File storage methods (in-memory - data persists only during server runtime)
  storeFile(bookId: string, buffer: Buffer): void;
  getFile(bookId: string): Buffer | undefined;
}

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

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = { ...insertBook, id, downloadCount: 0 };
    this.books.set(id, book);
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

  storeFile(bookId: string, buffer: Buffer): void {
    this.fileStore.set(bookId, buffer);
  }

  getFile(bookId: string): Buffer | undefined {
    return this.fileStore.get(bookId);
  }
}

export const storage = new MemStorage();
