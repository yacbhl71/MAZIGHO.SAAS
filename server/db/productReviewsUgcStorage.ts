import {
  ProductReviewItem,
  ProductReviewsConfig,
  submitReviewSchema,
  reviewsConfigSchema,
  moderateReviewSchema,
} from "../../shared/productReviewsUgc";
import { z } from "zod";

const storeReviewsConfigs = new Map<number, ProductReviewsConfig>();
const storeReviewsMap = new Map<number, ProductReviewItem[]>();

export async function getReviewsConfig(storeId: number): Promise<ProductReviewsConfig> {
  const existing = storeReviewsConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: ProductReviewsConfig = {
    storeId,
    enabled: true,
    requireApproval: true,
    allowMediaUploads: true,
    autoApproveVerified: true,
  };

  storeReviewsConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveReviewsConfig(
  storeId: number,
  input: z.infer<typeof reviewsConfigSchema>
): Promise<ProductReviewsConfig> {
  const current = await getReviewsConfig(storeId);
  const updated: ProductReviewsConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeReviewsConfigs.set(storeId, updated);
  return updated;
}

export async function createProductReview(
  storeId: number,
  input: z.infer<typeof submitReviewSchema>
): Promise<ProductReviewItem> {
  const config = await getReviewsConfig(storeId);
  if (!config.enabled) {
    throw new Error("Les avis clients sont temporairement désactivés.");
  }

  const storeReviews = storeReviewsMap.get(storeId) || [];

  const autoApprove =
    !config.requireApproval || (config.autoApproveVerified && input.verifiedBuyer);

  const newReview: ProductReviewItem = {
    id: `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId,
    productId: input.productId,
    productTitle: input.productTitle,
    authorName: input.authorName,
    authorEmail: input.authorEmail.toLowerCase().trim(),
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    mediaUrls: input.mediaUrls || [],
    verifiedBuyer: input.verifiedBuyer ?? false,
    status: autoApprove ? "APPROVED" : "PENDING",
    createdAt: new Date().toISOString(),
  };

  storeReviews.unshift(newReview);
  storeReviewsMap.set(storeId, storeReviews);

  return newReview;
}

export async function getStoreReviews(storeId: number): Promise<ProductReviewItem[]> {
  return storeReviewsMap.get(storeId) || [];
}

export async function getProductPublicReviews(
  storeId: number,
  productId: number
): Promise<{
  reviews: ProductReviewItem[];
  averageRating: number;
  totalReviews: number;
}> {
  const config = await getReviewsConfig(storeId);
  if (!config.enabled) {
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }

  const storeReviews = storeReviewsMap.get(storeId) || [];
  const approved = storeReviews.filter(
    (r) => r.productId === productId && r.status === "APPROVED"
  );

  const totalReviews = approved.length;
  const averageRating =
    totalReviews > 0
      ? approved.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    reviews: approved,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}

export async function moderateReview(
  storeId: number,
  input: z.infer<typeof moderateReviewSchema>
): Promise<ProductReviewItem> {
  const storeReviews = storeReviewsMap.get(storeId) || [];
  const idx = storeReviews.findIndex((r) => r.id === input.reviewId);

  if (idx === -1) {
    throw new Error("Avis introuvable.");
  }

  const existing = storeReviews[idx];
  const updated: ProductReviewItem = {
    ...existing,
    status: input.status,
    merchantReply: input.merchantReply ?? existing.merchantReply,
  };

  storeReviews[idx] = updated;
  storeReviewsMap.set(storeId, storeReviews);

  return updated;
}
