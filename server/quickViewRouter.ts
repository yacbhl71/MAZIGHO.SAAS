import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { quickViewConfigSchema } from "../shared/quickViewConfig";
import {
  getQuickViewConfig,
  saveQuickViewConfig,
} from "./db/quickViewStorage";

export const quickViewRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getQuickViewConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(quickViewConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveQuickViewConfig(ctx.store.id, input);
    }),
});
