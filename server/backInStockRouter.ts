import { z } from "zod";
import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { subscribeBackInStockSchema } from "../shared/backInStock";
import {
  subscribeToBackInStock,
  getStoreBackInStockSubscriptions,
  notifyBackInStockForProduct,
} from "./db/backInStockStorage";

export const backInStockRouter = router({
  subscribe: publicProcedure
    .input(subscribeBackInStockSchema)
    .mutation(async ({ ctx, input }) => {
      const storeId = ctx.store?.id || 1;
      return await subscribeToBackInStock(storeId, input);
    }),

  getSubscriptions: storeOwnerProcedure.query(async ({ ctx }) => {
    return await getStoreBackInStockSubscriptions(ctx.store.id);
  }),

  triggerNotification: storeOwnerProcedure
    .input(z.object({ productId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return await notifyBackInStockForProduct(ctx.store.id, input.productId);
    }),
});
