import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { slideOutCartConfigSchema } from "../shared/slideOutCartConfig";
import {
  getSlideOutCartConfig,
  saveSlideOutCartConfig,
} from "./db/slideOutCartStorage";

export const slideOutCartRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getSlideOutCartConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(slideOutCartConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveSlideOutCartConfig(ctx.store.id, input);
    }),
});
