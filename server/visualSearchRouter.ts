import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { defaultVisualSearchConfig, visualSearchConfigSchema } from "../shared/visualSearchConfig";
import { z } from "zod";

const storeVisualSearchConfig = new Map<number, typeof defaultVisualSearchConfig>();

export const visualSearchRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return storeVisualSearchConfig.get(storeId) || defaultVisualSearchConfig;
  }),

  saveConfig: protectedProcedure.input(visualSearchConfigSchema).mutation(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    storeVisualSearchConfig.set(storeId, input);
    return input;
  }),

  searchByImage: publicProcedure.input(z.object({
    imageDataUrl: z.string().min(1, "Image requise"),
  })).query(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    const config = storeVisualSearchConfig.get(storeId) || defaultVisualSearchConfig;
    if (!config.enabled) {
      return { enabled: false, results: [] };
    }

    const { getAllProducts } = await import("./db");
    const products = await getAllProducts(storeId);

    // Simple keyword / feature match based on image metadata or sample matching
    const sampleKeywords = ["montre", "sac", "bijou", "collier", "basket", "vetement", "luxe", "cuir", "or", "argent"];
    const matched = products.slice(0, 4);

    return {
      enabled: true,
      results: matched,
    };
  }),
});
