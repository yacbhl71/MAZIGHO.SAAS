import { describe, it, expect } from "vitest";
import {
  createProductReview,
  getProductPublicReviews,
  getStoreReviews,
  moderateReview,
  saveReviewsConfig,
} from "./db/productReviewsUgcStorage";

describe("Product Reviews UGC & Moderation Engine", () => {
  const storeId = 55;
  const productId = 10;

  it("should create a pending product review", async () => {
    const rev = await createProductReview(storeId, {
      productId,
      productTitle: "Casque Audio Sans Fil",
      authorName: "Thomas",
      authorEmail: "thomas@example.com",
      rating: 5,
      comment: "Excellente qualité sonore et batterie longue durée !",
      verifiedBuyer: false,
    });

    expect(rev).toBeDefined();
    expect(rev.id).toMatch(/^REV-/);
    expect(rev.status).toBe("PENDING");
  });

  it("should approve a review and calculate aggregate rating", async () => {
    const storeReviews = await getStoreReviews(storeId);
    expect(storeReviews.length).toBeGreaterThan(0);

    const firstRev = storeReviews[0];
    await moderateReview(storeId, {
      reviewId: firstRev.id,
      status: "APPROVED",
      merchantReply: "Merci Thomas pour votre avis !",
    });

    const publicData = await getProductPublicReviews(storeId, productId);
    expect(publicData.reviews.length).toBe(1);
    expect(publicData.averageRating).toBe(5);
    expect(publicData.reviews[0].merchantReply).toContain("Merci");
  });

  it("should return empty reviews when UGC is disabled by store owner", async () => {
    await saveReviewsConfig(storeId, {
      enabled: false,
      requireApproval: true,
      allowMediaUploads: true,
      autoApproveVerified: true,
    });

    const publicData = await getProductPublicReviews(storeId, productId);
    expect(publicData.reviews.length).toBe(0);
  });
});
