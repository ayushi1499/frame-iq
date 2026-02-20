import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faceData = pgTable("face_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  facePath: text("face_path"),
  vectorPath: text("vector_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const summaryHistory = pgTable("summary_history", {
  id: serial("id").primaryKey(),
  originalText: text("original_text"),
  summary: text("summary"),
  modelUsed: text("model_used"),
  summaryStyle: text("summary_style"),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFaceDataSchema = createInsertSchema(faceData).omit({ id: true, createdAt: true });
export const insertSummarySchema = createInsertSchema(summaryHistory).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FaceData = typeof faceData.$inferSelect;
export type SummaryHistory = typeof summaryHistory.$inferSelect;

export interface FaceAnalysisResult {
  age: number;
  gender: string;
  emotion: string;
  ethnicity: string;
  confidence_scores: { gender_pct: number; emotion_pct: number; ethnicity_pct: number };
}

export interface RecognitionResult {
  name: string;
  confidence: number;
  annotated_image: string; // base64
}

export interface SummaryResult {
  summary: string;
  word_count: number;
  style: string;
  created_at: string;
}

export interface StatsResult {
  total_faces: number;
  total_summaries: number;
}
