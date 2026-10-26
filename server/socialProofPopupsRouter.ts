import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { socialProofConfigSchema } from "../shared/socialProofPopups";
import {
  getSocialProofConfig,
  saveSocialProofConfig,
  getRecentPurchasesForSocialProof,
} from "./db/socialProofPopupsStorage";

export const socialProofPopupsRouter = router({
  getFeed: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    const [config, notifications] = await Promise.all([
      getSocialProofConfig(storeId),
      getRecentPurchasesForSocialProof(storeId),
    ]);
    return { config, notifications };
  }),

  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getSocialProofConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(socialProofConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveSocialProofConfig(ctx.store.id, input);
    }),
});
