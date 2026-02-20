import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { ai } from "./replit_integrations/image/client";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

const FACE_DATASET_DIR = path.join(process.cwd(), "face_dataset");

async function ensureDatasetDir() {
  try {
    await fs.mkdir(FACE_DATASET_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

// Ensure the dataset directory exists on startup
ensureDatasetDir();

const IMG_SIZE = 100;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function histogramEqualize(pixels: number[]): number[] {
  const hist = new Array(256).fill(0);
  for (const p of pixels) hist[Math.min(255, Math.max(0, Math.round(p)))]++;
  const cdf = new Array(256).fill(0);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
  const cdfMin = cdf.find(v => v > 0) || 0;
  const total = pixels.length;
  const scale = 255 / (total - cdfMin || 1);
  return pixels.map(p => Math.round((cdf[Math.min(255, Math.max(0, Math.round(p)))] - cdfMin) * scale));
}

function extractGradientFeatures(pixels: number[], width: number, height: number): number[] {
  const gradients: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = pixels[idx + 1] - pixels[idx - 1];
      const gy = pixels[idx + width] - pixels[idx - width];
      const mag = Math.sqrt(gx * gx + gy * gy);
      const angle = Math.atan2(gy, gx);
      gradients.push(mag, angle);
    }
  }
  return gradients;
}

function extractBlockHistograms(pixels: number[], width: number, height: number, gridSize: number): number[][] {
  const blockW = Math.floor(width / gridSize);
  const blockH = Math.floor(height / gridSize);
  const histograms: number[][] = [];

  for (let by = 0; by < gridSize; by++) {
    for (let bx = 0; bx < gridSize; bx++) {
      const bins = new Array(16).fill(0);
      for (let y = by * blockH; y < (by + 1) * blockH; y++) {
        for (let x = bx * blockW; x < (bx + 1) * blockW; x++) {
          const val = pixels[y * width + x];
          const bin = Math.min(15, Math.floor(val / 16));
          bins[bin]++;
        }
      }
      const total = bins.reduce((s, v) => s + v, 0) || 1;
      histograms.push(bins.map(b => b / total));
    }
  }
  return histograms;
}

function blockHistogramSimilarity(histsA: number[][], histsB: number[][], gridSize: number): number {
  const centerWeight = 2.0;
  const edgeWeight = 0.5;
  let totalSim = 0;
  let totalWeight = 0;

  for (let i = 0; i < histsA.length; i++) {
    const by = Math.floor(i / gridSize);
    const bx = i % gridSize;
    const isCenterY = by >= Math.floor(gridSize * 0.25) && by < Math.floor(gridSize * 0.75);
    const isCenterX = bx >= Math.floor(gridSize * 0.25) && bx < Math.floor(gridSize * 0.75);
    const weight = (isCenterX && isCenterY) ? centerWeight : edgeWeight;

    let intersection = 0;
    for (let j = 0; j < histsA[i].length; j++) {
      intersection += Math.min(histsA[i][j], histsB[i][j]);
    }
    totalSim += intersection * weight;
    totalWeight += weight;
  }
  return totalSim / totalWeight;
}

function computeMatchConfidence(queryVec: number[], savedVec: number[]): number {
  const eqQuery = histogramEqualize(queryVec);
  const eqSaved = histogramEqualize(savedVec);

  const meanQ = eqQuery.reduce((s, v) => s + v, 0) / eqQuery.length;
  const stdQ = Math.sqrt(eqQuery.reduce((s, v) => s + (v - meanQ) ** 2, 0) / eqQuery.length) || 1;
  const normQuery = eqQuery.map(v => (v - meanQ) / stdQ);
  const meanS = eqSaved.reduce((s, v) => s + v, 0) / eqSaved.length;
  const stdS = Math.sqrt(eqSaved.reduce((s, v) => s + (v - meanS) ** 2, 0) / eqSaved.length) || 1;
  const normSaved = eqSaved.map(v => (v - meanS) / stdS);

  const pixelCosine = cosineSimilarity(normQuery, normSaved);

  const gradQuery = extractGradientFeatures(eqQuery, IMG_SIZE, IMG_SIZE);
  const gradSaved = extractGradientFeatures(eqSaved, IMG_SIZE, IMG_SIZE);
  const gradCosine = cosineSimilarity(gradQuery, gradSaved);

  const gridSize = 5;
  const histsQuery = extractBlockHistograms(eqQuery, IMG_SIZE, IMG_SIZE, gridSize);
  const histsSaved = extractBlockHistograms(eqSaved, IMG_SIZE, IMG_SIZE, gridSize);
  const blockSim = blockHistogramSimilarity(histsQuery, histsSaved, gridSize);

  const combined = pixelCosine * 0.25 + gradCosine * 0.45 + blockSim * 0.30;

  const scaled = Math.max(0, Math.min(1, (combined - 0.3) / 0.7));
  const confidence = scaled * 100;
  return Math.round(confidence * 100) / 100;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/faces", async (req, res) => {
    try {
      const faces = await storage.getAllFaceData();
      res.json(faces);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch faces" });
    }
  });

  app.get("/api/summaries", async (req, res) => {
    try {
      const summaries = await storage.getAllSummaries();
      res.json(summaries);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch summaries" });
    }
  });

  app.post(api.face.register.path, upload.single("image"), async (req, res) => {
    try {
      const name = req.body.name;
      const file = req.file;

      if (!name || !file) {
        return res.status(400).json({ error: "Name and image are required" });
      }

      const grayscaleBuffer = await sharp(file.buffer)
        .resize(100, 100, { fit: 'cover', position: 'center' })
        .grayscale()
        .toBuffer();
        
      const { data } = await sharp(grayscaleBuffer).raw().toBuffer({ resolveWithObject: true });
      const pixelArray = Array.from(data);

      const displayBuffer = await sharp(file.buffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toBuffer();

      let user = await storage.getUserByName(name);
      if (!user) {
        user = await storage.createUser({ name });
      }

      const timestamp = Date.now();
      const faceFileName = `${user.id}_${timestamp}.jpg`;
      const vectorFileName = `${user.id}_${timestamp}.json`;

      await fs.writeFile(path.join(FACE_DATASET_DIR, faceFileName), displayBuffer);
      await fs.writeFile(path.join(FACE_DATASET_DIR, vectorFileName), JSON.stringify(pixelArray));

      await storage.createFaceData({
        userId: user.id,
        facePath: faceFileName,
        vectorPath: vectorFileName,
      });

      res.json({
        success: true,
        name,
        preview_image: `data:image/jpeg;base64,${displayBuffer.toString('base64')}`
      });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to register face" });
    }
  });

  app.post(api.face.recognize.path, upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const allFaces = await storage.getAllFaceData();
      if (allFaces.length === 0) {
        return res.status(400).json({ error: "No faces registered yet" });
      }

      const queryBuffer = await sharp(file.buffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toBuffer();
      const queryBase64 = queryBuffer.toString('base64');

      const faceEntries: { name: string; base64: string; facePath: string | null }[] = [];
      for (const face of allFaces) {
        if (!face.facePath) continue;
        try {
          const imgBuffer = await fs.readFile(path.join(FACE_DATASET_DIR, face.facePath));
          faceEntries.push({
            name: face.user.name,
            base64: imgBuffer.toString('base64'),
            facePath: face.facePath,
          });
        } catch(e) {
          console.error(`Error reading face image ${face.id}:`, e);
        }
      }

      if (faceEntries.length === 0) {
        return res.status(400).json({ error: "No face images available for comparison" });
      }

      const nameList = faceEntries.map((f, i) => `Person ${i + 1}: "${f.name}"`).join('\n');

      const parts: any[] = [
        { text: `You are a strict face recognition system. Compare the QUERY face photo against ${faceEntries.length} registered face photos and determine if ANY of them are the SAME PERSON as the query.

IMPORTANT: Be very strict. Only give high scores when you are genuinely confident the faces belong to the same person. Most comparisons between different people should score BELOW 25.

For each registered person, give a similarity score from 0 to 100:
- 80-100: Clearly the same person (matching facial structure, bone structure, distinctive features)
- 50-79: Possibly the same person (several key features match closely)
- 25-49: Some superficial similarity but likely different people
- 0-24: Different person (this should be the most common score for genuinely different people)

Focus on: face shape, eye spacing and shape, nose shape and size, jawline, forehead shape, cheekbone structure, mouth shape, ear shape, distinctive facial features. Ignore: lighting, angle, expression, glasses, hair style, makeup, image quality, clothing.

CRITICAL: If the query face does not match anyone, ALL scores should be below 25. Do NOT inflate scores. Two different people should score low even if they share the same gender, age range, or ethnicity.

Registered people:
${nameList}

Respond ONLY with valid JSON array, no other text:
[{"name": "exact name", "score": number}]

QUERY FACE:` },
        { inlineData: { mimeType: 'image/jpeg', data: queryBase64 } },
        { text: '\n\nREGISTERED FACES:' },
      ];

      for (let i = 0; i < faceEntries.length; i++) {
        parts.push({ text: `\nPerson ${i + 1} ("${faceEntries[i].name}"):` });
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: faceEntries[i].base64 } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      let aiScores: { name: string; score: number }[] = [];
      
      if (jsonMatch) {
        try {
          aiScores = JSON.parse(jsonMatch[0]);
        } catch(e) {
          console.error("Failed to parse AI scores:", responseText);
        }
      }

      const matches: { name: string; confidence: number; facePath: string | null }[] = [];

      for (const entry of faceEntries) {
        const aiMatch = aiScores.find(s => s.name === entry.name);
        const confidence = aiMatch ? Math.max(0, Math.min(100, aiMatch.score)) : 0;
        matches.push({
          name: entry.name,
          confidence: Math.round(confidence * 100) / 100,
          facePath: entry.facePath,
        });
      }

      matches.sort((a, b) => b.confidence - a.confidence);

      const MATCH_THRESHOLD = 40;
      const hasMatch = matches.length > 0 && matches[0].confidence >= MATCH_THRESHOLD;

      const annotatedBuffer = await sharp(file.buffer)
        .resize(400)
        .toBuffer();

      const allMatchesWithImages = matches.map((m) => {
        const entry = faceEntries.find(f => f.name === m.name);
        const face_image = entry ? `data:image/jpeg;base64,${entry.base64}` : undefined;
        return { name: m.name, confidence: m.confidence, face_image };
      });

      res.json({
        match_found: hasMatch,
        best_match: hasMatch ? { name: matches[0].name, confidence: matches[0].confidence } : null,
        all_matches: hasMatch ? allMatchesWithImages : [],
        annotated_image: `data:image/jpeg;base64,${annotatedBuffer.toString('base64')}`
      });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to recognize face" });
    }
  });

  app.post(api.face.analyze.path, upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const base64Image = file.buffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';

      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
              {
                text: `Analyze the face in this image. Return ONLY valid JSON (no markdown, no backticks, no extra text) with exactly these keys:
{
  "age": integer (estimated age),
  "gender": "Male" or "Female",
  "emotion": one of ["Happy","Neutral","Serious","Surprised","Sad"],
  "ethnicity": one of ["Caucasian","Asian","African","Latino","Middle Eastern"],
  "confidence_scores": { "gender_pct": float 0-100, "emotion_pct": float 0-100, "ethnicity_pct": float 0-100 },
  "fun_facts": [3 short, fun, personalized observations about this specific face or person based on what you see in the image - e.g. about their expression, style, features, accessories, or vibe. Each fact should be 1-2 sentences and entertaining.]
}`
              },
            ],
          },
        ],
        config: { maxOutputTokens: 8192 },
      });

      const raw = response.text || "";
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleaned);
      return res.json(result);

    } catch (err: any) {
      console.error("Face analysis error:", err.message || err);
      res.status(500).json({ error: 'Face analysis failed' });
    }
  });

  app.post(api.summarize.create.path, async (req, res) => {
    try {
      const { text, style, max_length } = req.body;

      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a professional text summarization assistant. Return only the summary, no preamble, no explanation.\n\nSummarize the following text in ${style} style, maximum ${max_length} words:\n\n${text}`,
              },
            ],
          },
        ],
        config: { maxOutputTokens: 8192 },
      });

      const summary = response.text || "";
      const word_count = summary.split(' ').filter(Boolean).length;

      await storage.createSummary({
        originalText: text,
        summary: summary,
        modelUsed: 'gemini-2.5-flash',
        summaryStyle: style,
        wordCount: word_count,
      });

      return res.json({ summary, word_count, style, created_at: new Date().toISOString() });

    } catch (err: any) {
      console.error("Summarization error:", err.message || err);
      res.status(500).json({ error: 'Summarization failed' });
    }
  });

  return httpServer;
}
