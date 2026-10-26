import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { stickyAddToCartConfigSchema } from "../shared/stickyAddToCart";
import {
  getStickyAddToCartConfig,
  saveStickyAddToCartConfig,
} from "./db/stickyAddToCartStorage";

export const stickyAddToCartRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getStickyAddToCartConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(stickyAddToCartConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveStickyAddToCartConfig(ctx.store.id, input);
    }),
});
