import { router, storeOwnerProcedure, publicProcedure } from "./_core/trpc";
import { currencyConverterConfigSchema } from "../shared/currencyConverter";
import {
  getCurrencyConverterConfig,
  saveCurrencyConverterConfig,
} from "./db/currencyConverterStorage";

export const currencyConverterRouter = router({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const storeId = ctx.store?.id || 1;
    return await getCurrencyConverterConfig(storeId);
  }),

  saveConfig: storeOwnerProcedure
    .input(currencyConverterConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveCurrencyConverterConfig(ctx.store.id, input);
    }),
});
