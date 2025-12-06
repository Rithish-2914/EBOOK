import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Book categories
export const CATEGORIES = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "Web Development",
  "Data Science",
  "DevOps",
  "Mobile Development",
  "Database",
  "Machine Learning",
  "System Design",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Books table
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path"),
  downloadCount: integer("download_count").default(0),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  filePath: true,
  downloadCount: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
