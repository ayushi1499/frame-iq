import { z } from "zod";

export const api = {
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats" as const,
      responses: {
        200: z.object({
          total_faces: z.number(),
          total_summaries: z.number(),
        }),
      },
    },
  },
  face: {
    register: {
      method: "POST" as const,
      path: "/api/register-face" as const,
      responses: {
        200: z.object({
          success: z.boolean(),
          name: z.string(),
          preview_image: z.string(),
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
    recognize: {
      method: "POST" as const,
      path: "/api/recognize-face" as const,
      responses: {
        200: z.object({
          match_found: z.boolean(),
          best_match: z.object({
            name: z.string(),
            confidence: z.number(),
          }).nullable(),
          all_matches: z.array(z.object({
            name: z.string(),
            confidence: z.number(),
            face_image: z.string().optional(),
          })),
          annotated_image: z.string(),
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
    analyze: {
      method: "POST" as const,
      path: "/api/analyze-face" as const,
      responses: {
        200: z.object({
          age: z.number(),
          gender: z.string(),
          emotion: z.string(),
          ethnicity: z.string(),
          confidence_scores: z.object({
            gender_pct: z.number(),
            emotion_pct: z.number(),
            ethnicity_pct: z.number(),
          }),
          fun_facts: z.array(z.string()).optional(),
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  },
  summarize: {
    create: {
      method: "POST" as const,
      path: "/api/summarize" as const,
      input: z.object({
        text: z.string(),
        style: z.string(),
        max_length: z.number(),
      }),
      responses: {
        200: z.object({
          summary: z.string(),
          word_count: z.number(),
          style: z.string(),
          created_at: z.string(),
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
