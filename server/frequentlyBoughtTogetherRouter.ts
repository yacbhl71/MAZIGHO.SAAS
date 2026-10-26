import { z } from "zod";
import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { fbtBundleSchema } from "../shared/frequentlyBoughtTogether";
import {
  getStoreFbtBundles,
  saveFbtBundle,
  getFbtBundleForProduct,
} from "./db/frequentlyBoughtTogetherStorage";

export const frequentlyBoughtTogetherRouter = router({
  getForProduct: publicProcedure
    .input(z.object({ mainProductId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const storeId = ctx.store?.id || 1;
      return await getFbtBundleForProduct(storeId, input.mainProductId);
    }),

  getBundles: storeOwnerProcedure.query(async ({ ctx }) => {
    return await getStoreFbtBundles(ctx.store.id);
  }),

  saveBundle: storeOwnerProcedure
    .input(fbtBundleSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveFbtBundle(ctx.store.id, input);
    }),
});
