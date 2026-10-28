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

  generateStorefrontImage: storeOwnerProcedure
    .input(
      z.object({
        subject: z.string().trim().min(12).max(420),
        format: z.enum(["hero", "story", "square"]),
        style: z.enum(["editorial", "soft", "bold"]),
      })
    )
    .mutation(async ({ input }) => {
      const subject = input.subject.trim();
      const formatGuides = {
        hero: "Horizontal 16:9 banner composition, wide room or environment, elegant spacing for hero storefront headers, product showcase in ambient light.",
        story: "Vertical 9:16 portrait composition, editorial lifestyle framing, high clarity, refined texture details, suitable for mobile cards.",
        square: "Square 1:1 catalog composition, balanced center focus, studio quality lighting, clean background, sharp details.",
      };
      const styleGuides = {
        editorial: "High-end commercial aesthetic, refined organic colors, natural soft shadows, professional photography, cinematic depth of field.",
        soft: "Warm pastel lighting, gentle highlights, soothing atmosphere, minimalist aesthetic, serene mood.",
        bold: "Modern vibrant contrast, punchy accent colors, crisp studio lighting, sleek contemporary style.",
      };
      const prompt = [
        "Professional e-commerce product and storefront photography.",
        `Subject: ${subject}`,
        `Composition & Format: ${formatGuides[input.format]}`,
        `Style & Mood: ${styleGuides[input.style]}`,
        "Clean visual presentation suitable for a premium store.",
        "No text overlays, no typography, no watermarks, no logos, no lower thirds.",
      ].join("\n");

      try {
        const { generateImage } = await import("./_core/imageGeneration");
        const generated = await generateImage({ prompt });
        if (!generated.url) throw new Error("STORE_IMAGE_GENERATION_EMPTY_RESULT");
        return { url: generated.url };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error && error.message ? error.message : "La génération de l'image a échoué. Veuillez réessayer.",
        });
      }
    }),
});

