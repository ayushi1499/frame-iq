import { db } from "./db";
import { users, faceData, summaryHistory, type User, type InsertUser, type FaceData, type SummaryHistory } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFaceData(data: Omit<FaceData, "id" | "createdAt">): Promise<FaceData>;
  getAllFaceData(): Promise<(FaceData & { user: User })[]>;
  createSummary(summary: Omit<SummaryHistory, "id" | "createdAt">): Promise<SummaryHistory>;
  getAllSummaries(): Promise<SummaryHistory[]>;
  getStats(): Promise<{ total_faces: number; total_summaries: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFaceData(data: Omit<FaceData, "id" | "createdAt">): Promise<FaceData> {
    const [fd] = await db.insert(faceData).values(data).returning();
    return fd;
  }

  async getAllFaceData(): Promise<(FaceData & { user: User })[]> {
    const results = await db.select({
      faceData: faceData,
      user: users
    }).from(faceData).innerJoin(users, eq(faceData.userId, users.id));
    
    return results.map(r => ({ ...r.faceData, user: r.user }));
  }

  async createSummary(summary: Omit<SummaryHistory, "id" | "createdAt">): Promise<SummaryHistory> {
    const [sh] = await db.insert(summaryHistory).values(summary).returning();
    return sh;
  }

  async getAllSummaries(): Promise<SummaryHistory[]> {
    return await db.select().from(summaryHistory);
  }

  async getStats(): Promise<{ total_faces: number; total_summaries: number }> {
    const faces = await db.select().from(faceData);
    const summaries = await db.select().from(summaryHistory);
    return {
      total_faces: faces.length,
      total_summaries: summaries.length,
    };
  }
}

export const storage = new DatabaseStorage();
