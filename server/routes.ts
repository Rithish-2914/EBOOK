import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertBookSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

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
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  // Upload a book
  app.post("/api/books/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, author, description, category } = req.body;

      const parseResult = insertBookSchema.safeParse({
        title,
        author,
        description: description || null,
        category,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.message });
      }

      const book = await storage.createBook(parseResult.data);
      
      // Store the file buffer in memory
      storage.storeFile(book.id, req.file.buffer);

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

      const fileBuffer = storage.getFile(book.id);
      if (!fileBuffer) {
        return res.status(404).json({ error: "File not found" });
      }

      // Increment download count
      await storage.incrementDownloadCount(book.id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(book.fileName)}"`
      );
      res.send(fileBuffer);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  return httpServer;
}
