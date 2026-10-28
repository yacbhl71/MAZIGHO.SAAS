import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { defaultSpinToWinSettings, spinToWinSettingsSchema } from "../shared/spinToWinGamification";
import { z } from "zod";

// In-memory tenant store settings map
const storeSpinToWinSettings = new Map<number, typeof defaultSpinToWinSettings>();

export const spinToWinRouter = router({
  getSettings: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return storeSpinToWinSettings.get(storeId) || defaultSpinToWinSettings;
  }),

  saveSettings: protectedProcedure.input(spinToWinSettingsSchema).mutation(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    storeSpinToWinSettings.set(storeId, input);
    return input;
  }),

  claimReward: publicProcedure.input(z.object({
    email: z.string().email("Adresse email requise"),
    rewardCode: z.string().min(1),
    rewardLabel: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    const storeId = ctx.store?.id || 1;
    console.log(`[SpinToWin] Lead captured for store ${storeId}: ${input.email} -> ${input.rewardCode} (${input.rewardLabel})`);
    return { success: true, message: `Code ${input.rewardCode} débloqué pour ${input.email} !` };
  }),
});
