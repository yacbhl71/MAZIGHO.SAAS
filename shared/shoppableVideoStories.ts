import { z } from "zod";

export interface ShoppableStoryItem {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  productId?: number;
  productTitle?: string;
  productPriceCents?: number;
  productImageUrl?: string;
}

export interface ShoppableStoriesConfig {
  enabled: boolean;
  sectionTitle: string;
  stories: ShoppableStoryItem[];
}

export const defaultShoppableStories: ShoppableStoryItem[] = [
  {
    id: "story-1",
    title: "Nouveautés Tendance",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    productTitle: "Montre Chrono Élégance Edition Luxe",
    productPriceCents: 18900,
  },
  {
    id: "story-2",
    title: "Coulisses & Atelier",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80",
    productTitle: "Collier Pendentif Éclat Précieux",
    productPriceCents: 12500,
  },
  {
    id: "story-3",
    title: "Inspirations Style",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    productTitle: "Baskets Urban Run Pro",
    productPriceCents: 14900,
  },
];

export const defaultShoppableStoriesConfig: ShoppableStoriesConfig = {
  enabled: true,
  sectionTitle: "Découvrir en Stories",
  stories: defaultShoppableStories,
};

export const shoppableStoryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Titre requis"),
  videoUrl: z.string().min(1, "URL vidéo requise"),
  posterUrl: z.string().default(""),
  productId: z.number().int().optional(),
  productTitle: z.string().optional(),
  productPriceCents: z.number().int().optional(),
  productImageUrl: z.string().optional(),
});

export const shoppableStoriesConfigSchema = z.object({
  enabled: z.boolean().default(true),
  sectionTitle: z.string().min(1, "Titre de section requis"),
  stories: z.array(shoppableStoryItemSchema).default([]),
});
