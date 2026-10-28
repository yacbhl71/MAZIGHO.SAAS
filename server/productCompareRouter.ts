import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { defaultProductCompareConfig, productCompareConfigSchema } from "../shared/productCompareConfig";

const storeProductCompareConfig = new Map<number, typeof defaultProductCompareConfig>();

export const productCompareRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return storeProductCompareConfig.get(storeId) || defaultProductCompareConfig;
  }),

  saveConfig: protectedProcedure.input(productCompareConfigSchema).mutation(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    storeProductCompareConfig.set(storeId, input);
    return input;
  }),
});
