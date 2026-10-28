import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { defaultShoppableStoriesConfig, shoppableStoriesConfigSchema } from "../shared/shoppableVideoStories";

const storeShoppableStoriesConfig = new Map<number, typeof defaultShoppableStoriesConfig>();

export const shoppableStoriesRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return storeShoppableStoriesConfig.get(storeId) || defaultShoppableStoriesConfig;
  }),

  saveConfig: protectedProcedure.input(shoppableStoriesConfigSchema).mutation(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    storeShoppableStoriesConfig.set(storeId, input);
    return input;
  }),
});
