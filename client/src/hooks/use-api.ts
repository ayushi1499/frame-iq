import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// ============================================
// STATS
// ============================================
export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Live updates every 5s
  });
}

// ============================================
// FACE RECOGNITION
// ============================================
export function useAllFaces() {
  return useQuery({
    queryKey: ["/api/faces"],
    queryFn: async () => {
      const res = await fetch("/api/faces");
      if (!res.ok) throw new Error("Failed to fetch faces");
      return z.array(z.any()).parse(await res.json());
    },
  });
}

export function useRegisterFace() {
  return useMutation({
    mutationFn: async ({ name, image }: { name: string; image: File }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);

      const res = await fetch(api.face.register.path, {
        method: api.face.register.method,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to register face");
      }
      return api.face.register.responses[200].parse(await res.json());
    },
  });
}

export function useRecognizeFace() {
  return useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(api.face.recognize.path, {
        method: api.face.recognize.method,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to recognize face");
      }
      return api.face.recognize.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// FACE ANALYSIS
// ============================================
export function useAnalyzeFace() {
  return useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(api.face.analyze.path, {
        method: api.face.analyze.method,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to analyze face");
      }
      return api.face.analyze.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// TEXT SUMMARIZATION
// ============================================
export function useAllSummaries() {
  return useQuery({
    queryKey: ["/api/summaries"],
    queryFn: async () => {
      const res = await fetch("/api/summaries");
      if (!res.ok) throw new Error("Failed to fetch summaries");
      return z.array(z.any()).parse(await res.json());
    },
  });
}

type SummarizeInput = z.infer<typeof api.summarize.create.input>;

export function useSummarize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SummarizeInput) => {
      const validated = api.summarize.create.input.parse(data);
      const res = await fetch(api.summarize.create.path, {
        method: api.summarize.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to summarize text");
      }
      return api.summarize.create.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}
