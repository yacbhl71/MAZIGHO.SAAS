import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { liveSalesChatConfigSchema } from "../shared/liveSalesChat";
import {
  getLiveSalesChatConfig,
  saveLiveSalesChatConfig,
} from "./db/liveSalesChatStorage";

export const liveSalesChatRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getLiveSalesChatConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(liveSalesChatConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveLiveSalesChatConfig(ctx.store.id, input);
    }),
});
