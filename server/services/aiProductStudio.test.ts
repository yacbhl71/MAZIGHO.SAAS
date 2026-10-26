import { describe, expect, it, vi } from "vitest";

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: async (args: any) => {
          const contents = args?.contents || "";
          if (contents.includes("FAQ") || contents.includes("questions/réponses")) {
            return {
              text: JSON.stringify([
                { question: "Quels sont les délais ?", answer: "Livraison en 2-4 jours." },
                { question: "Quelle est la garantie ?", answer: "Garantie 2 ans." },
              ]),
            };
          }
          return {
            text: JSON.stringify({
              title: "Diffuseur Céramique Luxe",
              tagline: "L'élégance du bien-être chez vous.",
              description: "<p>Un diffuseur d'exception pour une ambiance apaisante.</p>",
              bulletPoints: ["Réservoir 300ml", "LED 7 teintes", "Silencieux"],
              seoTitle: "Acheter Diffuseur Céramique Luxe | Suisse",
              seoDescription: "Diffuseur d'arômes haut de gamme avec livraison rapide.",
              keywords: ["diffuseur", "maison", "bien-etre", "vaisselle"],
              ctaText: "Ajouter au Panier",
              optimizedTitle: "Mug Céramique Mat | Vaisselle Design",
              slug: "mug-ceramique-mat",
              targetLanguage: "de",
            }),
          };
        },
      };
    },
  };
});

import {
  generateAiProductCopy,
  enhanceProductTitleAndSeo,
  translateProductContent,
  generateProductFaq,
} from "./aiProductStudio";

describe("aiProductStudio - Service Rédacteur & SEO IA", () => {
  it("génère une fiche produit complète avec slogan, description, points forts et balises SEO", async () => {
    const result = await generateAiProductCopy({
      title: "Diffuseur Céramique Luxe",
      category: "Maison & Bien-être",
      targetAudience: "Amateurs de décoration contemporaine",
      tone: "premium",
      features: ["Réservoir 300ml", "Éclairage LED 7 teintes", "Silencieux"],
      language: "fr",
    });

    expect(result.title).toBeDefined();
    expect(result.tagline).toBeDefined();
    expect(result.description).toContain("<p>");
    expect(result.bulletPoints.length).toBeGreaterThan(0);
    expect(result.seoTitle).toBeDefined();
    expect(result.seoDescription).toBeDefined();
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.ctaText).toBeDefined();
  });

  it("génère un résultat anglais valide lorsque la langue cible est 'en'", async () => {
    const result = await generateAiProductCopy({
      title: "Swiss Cotton Hoodie",
      category: "Apparel",
      language: "en",
    });

    expect(result.title).toBeDefined();
    expect(result.ctaText).toBeDefined();
  });

  it("optimise le titre et génère des méta-balises SEO pour Google", async () => {
    const seoResult = await enhanceProductTitleAndSeo({
      title: "Mug Céramique Mat",
      description: "Mug artisanal 330ml de couleur noir mat",
      category: "Vaisselle",
    });

    expect(seoResult.optimizedTitle).toBeDefined();
    expect(seoResult.seoTitle).toBeDefined();
    expect(seoResult.seoDescription).toBeDefined();
    expect(seoResult.slug).toBe("mug-ceramique-mat");
    expect(seoResult.keywords).toContain("vaisselle");
  });

  it("traduit un contenu produit vers une langue cible (ex: Allemand 'de')", async () => {
    const translated = await translateProductContent({
      title: "Sweat à Capuche Bio",
      tagline: "Le confort suisse au quotidien",
      description: "Fabriqué en coton biologique de haute qualité.",
      bulletPoints: ["100% Coton Bio", "Livraison rapide"],
      targetLanguage: "de",
    });

    expect(translated.title).toBeDefined();
    expect(translated.description).toBeDefined();
    expect(translated.targetLanguage).toBe("de");
  });

  it("génère des éléments de FAQ de réassurance pour la page produit", async () => {
    const faq = await generateProductFaq("Montre Automatique Suisse", "Horlogerie");

    expect(Array.isArray(faq)).toBe(true);
    expect(faq.length).toBeGreaterThan(0);
    expect(faq[0].question).toBeDefined();
    expect(faq[0].answer).toBeDefined();
  });
});
