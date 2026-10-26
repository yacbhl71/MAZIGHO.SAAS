import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, storeOwnerProcedure } from "./_core/trpc";
import {
  generateAiProductCopy,
  enhanceProductTitleAndSeo,
  translateProductContent,
  generateProductFaq,
} from "./services/aiProductStudio";

export const aiProductStudioRouter = router({
  generateCopy: storeOwnerProcedure
    .input(
      z.object({
        title: z.string().min(2, "Indiquez un titre ou une idée de produit."),
        category: z.string().optional(),
        targetAudience: z.string().optional(),
        tone: z.enum(["premium", "persuasive", "minimalist", "eco", "direct"]).optional(),
        features: z.array(z.string()).optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await generateAiProductCopy(input);
    }),

  enhanceSeo: storeOwnerProcedure
    .input(
      z.object({
        title: z.string().min(2, "Indiquez le titre actuel."),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await enhanceProductTitleAndSeo(input);
    }),

  translateContent: storeOwnerProcedure
    .input(
      z.object({
        title: z.string(),
        tagline: z.string().optional(),
        description: z.string(),
        bulletPoints: z.array(z.string()).optional(),
        targetLanguage: z.enum(["de", "en", "ar", "it", "es", "nl", "fr"]),
      })
    )
    .mutation(async ({ input }) => {
      return await translateProductContent(input);
    }),

  generateFaq: storeOwnerProcedure
    .input(
      z.object({
        title: z.string().min(2),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await generateProductFaq(input.title, input.category);
    }),
});
