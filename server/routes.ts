import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isSupabaseConfigured } from "./supabase";
import multer from "multer";
import { insertBookSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

const uploadFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all books
  app.get("/api/books", async (_req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Get books error:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get single book
  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Get book error:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  // Upload a book
  app.post("/api/books/upload", uploadFields, async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const pdfFile = files?.file?.[0];
      const thumbnailFile = files?.thumbnail?.[0];

      if (!pdfFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (pdfFile.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }

      const { title, author, description, category } = req.body;

      const parseResult = insertBookSchema.safeParse({
        title,
        author,
        description: description || null,
        category,
        fileName: pdfFile.originalname,
        fileSize: pdfFile.size,
      });

      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.message });
      }

      const book = await storage.createBook(
        parseResult.data, 
        pdfFile.buffer, 
        thumbnailFile?.buffer
      );

      res.status(201).json(book);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload book" });
    }
  });

  // Download a book
  app.get("/api/books/:id/download", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Increment download count
      await storage.incrementDownloadCount(book.id);

      // If using Supabase, redirect to the file URL
      if (isSupabaseConfigured) {
        const fileUrl = storage.getFileUrl(book);
        if (fileUrl) {
          return res.redirect(fileUrl);
        }
        return res.status(404).json({ error: "File not found" });
      }

      // For in-memory storage, return the buffer
      const fileBuffer = storage.getFileBuffer(book.id);
      if (!fileBuffer) {
        return res.status(404).json({ error: "File not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(book.fileName)}"`
      );
      res.send(fileBuffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download book" });
    }
  });

  // Delete a book
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBook(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Health check endpoint for deployment
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      storage: isSupabaseConfigured ? "supabase" : "in-memory" 
    });
  });

  return httpServer;
}
