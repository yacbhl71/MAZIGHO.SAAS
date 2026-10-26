import { z } from "zod";
import { router, storeOwnerProcedure } from "./_core/trpc";
import { parseShopifyCsv } from "../shared/shopifyMigration";
import { executeShopifyMigration, generateFullCatalogueCsv } from "./services/shopifyMigration";

export const shopifyMigrationRouter = router({
  previewShopifyImport: storeOwnerProcedure
    .input(z.object({ csvText: z.string().min(10, "Fichier CSV vide.") }))
    .mutation(async ({ input }) => {
      const report = parseShopifyCsv(input.csvText);
      return report;
    }),

  confirmShopifyImport: storeOwnerProcedure
    .input(z.object({ csvText: z.string().min(10, "Fichier CSV vide.") }))
    .mutation(async ({ ctx, input }) => {
      const report = parseShopifyCsv(input.csvText);
      if (report.sampleProducts.length === 0) {
        throw new Error("Aucun produit valide détecté dans le fichier CSV Shopify.");
      }

      const result = await executeShopifyMigration(ctx.store.id, report.sampleProducts);
      return {
        success: true,
        message: `Migration réussie ! ${result.createdCount} produit(s) importé(s) au catalogue.`,
        ...result,
      };
    }),

  exportFullCatalogueCsv: storeOwnerProcedure.query(async ({ ctx }) => {
    const csvContent = await generateFullCatalogueCsv(ctx.store.id);
    return {
      filename: `catalogue-${ctx.store.slug || "boutique"}-${new Date().toISOString().slice(0, 10)}.csv`,
      csvContent,
    };
  }),
});
