import { router, storeOwnerProcedure } from "./_core/trpc";
import { customerSegmentationConfigSchema } from "../shared/customerSegmentation";
import {
  getStoreCustomerSegments,
  saveSegmentationConfig,
} from "./db/customerSegmentationStorage";

export const customerSegmentationRouter = router({
  getSegments: storeOwnerProcedure.query(async ({ ctx }) => {
    return await getStoreCustomerSegments(ctx.store.id);
  }),

  saveConfig: storeOwnerProcedure
    .input(customerSegmentationConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveSegmentationConfig(ctx.store.id, input);
    }),
});
