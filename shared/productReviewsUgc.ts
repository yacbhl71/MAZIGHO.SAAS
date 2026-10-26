import { z } from "zod";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProductReviewItem {
  id: string;
  storeId: number;
  productId: number;
  productTitle?: string;
  authorName: string;
  authorEmail: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  mediaUrls: string[];
  verifiedBuyer: boolean;
  status: ReviewStatus;
  merchantReply?: string;
  createdAt: string;
}

export interface ProductReviewsConfig {
  storeId: number;
  enabled: boolean;
  requireApproval: boolean;
  allowMediaUploads: boolean;
  autoApproveVerified: boolean;
}

export const submitReviewSchema = z.object({
  productId: z.number().int().positive(),
  productTitle: z.string().optional(),
  authorName: z.string().min(1, "Votre nom est requis"),
  authorEmail: z.string().email("Adresse email invalide"),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(3, "Veuillez détailler votre avis"),
  mediaUrls: z.array(z.string().url()).default([]),
  verifiedBuyer: z.boolean().default(false),
});

export const reviewsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  requireApproval: z.boolean().default(true),
  allowMediaUploads: z.boolean().default(true),
  autoApproveVerified: z.boolean().default(true),
});

export const moderateReviewSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  merchantReply: z.string().optional(),
});
