import { z } from "zod";
import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import {
  submitReviewSchema,
  reviewsConfigSchema,
  moderateReviewSchema,
} from "../shared/productReviewsUgc";
import {
  getReviewsConfig,
  saveReviewsConfig,
  createProductReview,
  getStoreReviews,
  getProductPublicReviews,
  moderateReview,
} from "./db/productReviewsUgcStorage";

export const productReviewsUgcRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getReviewsConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(reviewsConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveReviewsConfig(ctx.store.id, input);
    }),

  getPublicReviews: publicProcedure
    .input(z.object({ productId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const storeId = ctx.store?.id || 1;
      return await getProductPublicReviews(storeId, input.productId);
    }),

  submitReview: publicProcedure
    .input(submitReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const storeId = ctx.store?.id || 1;
      return await createProductReview(storeId, input);
    }),

  getStoreReviews: storeOwnerProcedure.query(async ({ ctx }) => {
    return await getStoreReviews(ctx.store.id);
  }),

  moderateReview: storeOwnerProcedure
    .input(moderateReviewSchema)
    .mutation(async ({ ctx, input }) => {
      return await moderateReview(ctx.store.id, input);
    }),
});
