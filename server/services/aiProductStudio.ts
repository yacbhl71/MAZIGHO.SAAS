import { GoogleGenAI } from "@google/genai";

export type CopyTone = "premium" | "persuasive" | "minimalist" | "eco" | "direct";

export interface GenerateCopyInput {
  title: string;
  category?: string;
  targetAudience?: string;
  tone?: CopyTone;
  features?: string[];
  language?: string;
}

export interface AiCopyResult {
  title: string;
  tagline: string;
  description: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ctaText: string;
}

export interface EnhanceSeoInput {
  title: string;
  description?: string;
  category?: string;
}

export interface AiSeoResult {
  optimizedTitle: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  keywords: string[];
}

export interface TranslateContentInput {
  title: string;
  tagline?: string;
  description: string;
  bulletPoints?: string[];
  targetLanguage: "de" | "en" | "ar" | "it" | "es" | "nl" | "fr";
}

export interface AiTranslationResult {
  title: string;
  tagline: string;
  description: string;
  bulletPoints: string[];
  targetLanguage: string;
}

export interface AiFaqItem {
  question: string;
  answer: string;
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Fallback smart generators in case API key is absent in preview or test env
function generateFallbackCopy(input: GenerateCopyInput): AiCopyResult {
  const lang = input.language || "fr";
  const title = input.title.trim() || "Produit Sélectionné";
  const category = input.category || "Catalogue General";

  if (lang === "en") {
    return {
      title: `${title} - Premium Edition`,
      tagline: `Elevate your lifestyle with ${title}. Exceptional Swiss craftsmanship & quality.`,
      description: `<p>Discover <strong>${title}</strong>, designed for performance, comfort, and elegance. Perfect for daily use, combining durable materials with modern Swiss design aesthetics.</p><p>Order today with fast insured delivery and 14-day guaranteed returns.</p>`,
      bulletPoints: [
        `Premium quality materials engineered for durability`,
        `Modern, minimalist design matching modern aesthetics`,
        `Fast insured delivery across Switzerland & Europe`,
        `100% satisfaction guaranteed with 14-day free returns`,
      ],
      seoTitle: `Buy ${title} Online | Fast Swiss Shipping`,
      seoDescription: `Order ${title} online with fast delivery in Switzerland and Europe. Top quality ${category} with 14-day money back guarantee.`,
      keywords: [title.toLowerCase(), category.toLowerCase(), "buy online", "swiss shop"],
      ctaText: "Add to Cart",
    };
  }

  return {
    title: `${title} - Édition Premium`,
    tagline: `Révélez le meilleur de votre quotidien avec ${title}. Conception soignée et qualité certifiée.`,
    description: `<p>Découvrez <strong>${title}</strong>, l'alliance parfaite entre esthétique moderne, durabilité et confort au quotidien.</p><p>Fabriqué avec des matériaux sélectionnés de haute qualité, il répond aux exigences de précision et de style. Profitez d'une expédition rapide et sécurisée ainsi que de notre garantie satisfaction 14 jours.</p>`,
    bulletPoints: [
      `Matériaux haute qualité garantissant longévité et confort`,
      `Design élégant et ergonomique adapté aux tendances actuelles`,
      `Livraison rapide et suivie en Suisse et en Europe`,
      `Garantie satisfait ou remboursé sous 14 jours`,
    ],
    seoTitle: `Acheter ${title} en Ligne | Livraison Rapide Suisse`,
    seoDescription: `Découvrez ${title} sur notre boutique. Produit d'exception dans la catégorie ${category}. Expédition rapide et retour garanti 14 jours.`,
    keywords: [title.toLowerCase(), category.toLowerCase(), "achat en ligne", "boutique suisse"],
    ctaText: "Ajouter au Panier",
  };
}

export async function generateAiProductCopy(input: GenerateCopyInput): Promise<AiCopyResult> {
  const ai = getGenAIClient();
  if (!ai) {
    return generateFallbackCopy(input);
  }

  try {
    const prompt = `
Tu es un expert en e-commerce et en copywriting à fort taux de conversion.
Génère une fiche produit complète en format JSON pour le produit suivant :
- Titre initial : "${input.title}"
- Catégorie : "${input.category || "Général"}"
- Cible : "${input.targetAudience || "Grand public"}"
- Ton : "${input.tone || "premium"}" (ex: luxe, persuasif, minimaliste)
- Caractéristiques : ${(input.features || []).join(", ") || "Qualité supérieure, livraison rapide"}
- Langue : "${input.language || "fr"}"

Réponds STRICTEMENT sous la forme d'un objet JSON valide sans balise markdown supplémentaire :
{
  "title": "Titre commercial accrocheur",
  "tagline": "Slogan court de 10 mots max",
  "description": "Description commerciale complète en HTML (<p>, <strong>, <ul>) de 150 mots environ",
  "bulletPoints": ["Point fort 1 avec avantage client", "Point fort 2", "Point fort 3", "Point fort 4"],
  "seoTitle": "Titre SEO optimisé Google de moins de 60 caractères",
  "seoDescription": "Méta-description SEO incitative de moins de 155 caractères",
  "keywords": ["motcle1", "motcle2", "motcle3", "motcle4"],
  "ctaText": "Texte du bouton d'action"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson) as AiCopyResult;
    return parsed;
  } catch (error) {
    console.warn("[AiProductStudio] Gemini call failed, returning smart fallback copy:", error);
    return generateFallbackCopy(input);
  }
}

export async function enhanceProductTitleAndSeo(input: EnhanceSeoInput): Promise<AiSeoResult> {
  const ai = getGenAIClient();
  const title = input.title.trim();
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!ai) {
    return {
      optimizedTitle: `${title} | Modèle Exclusif`,
      seoTitle: `Acheter ${title} - Boutique Officielle`,
      seoDescription: `Découvrez ${title}. Qualité garantie, prix avantageux et livraison rapide à domicile.`,
      slug,
      keywords: [title.toLowerCase(), input.category?.toLowerCase() || "e-commerce", "suisse", "achat en ligne"],
    };
  }

  try {
    const prompt = `
Optimise le titre et les balises SEO de ce produit e-commerce :
- Titre : "${title}"
- Description : "${input.description || ""}"
- Catégorie : "${input.category || ""}"

Réponds STRICTEMENT avec cet objet JSON :
{
  "optimizedTitle": "Titre produit clair, valorisant et vendeur",
  "seoTitle": "Titre balise Title Google (<60 char)",
  "seoDescription": "Meta description persuasive (<155 char)",
  "slug": "slug-url-optimise",
  "keywords": ["motcle1", "motcle2", "motcle3"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as AiSeoResult;
  } catch (error) {
    return {
      optimizedTitle: `${title} | Modèle Exclusif`,
      seoTitle: `Acheter ${title} - Boutique Officielle`,
      seoDescription: `Découvrez ${title}. Qualité garantie, prix avantageux et livraison rapide à domicile.`,
      slug,
      keywords: [title.toLowerCase(), input.category?.toLowerCase() || "e-commerce", "suisse", "achat en ligne"],
    };
  }
}

export async function translateProductContent(input: TranslateContentInput): Promise<AiTranslationResult> {
  const ai = getGenAIClient();
  const targetLangNames: Record<string, string> = {
    de: "Allemand (Deutsch)",
    en: "Anglais (English)",
    ar: "Arabe (العربية)",
    it: "Italien (Italiano)",
    es: "Espagnol (Español)",
    nl: "Néerlandais (Nederlands)",
    fr: "Français",
  };

  const targetName = targetLangNames[input.targetLanguage] || "Anglais";

  if (!ai) {
    return {
      title: `${input.title} [${input.targetLanguage.toUpperCase()}]`,
      tagline: input.tagline || `Top quality product translated to ${targetName}`,
      description: input.description,
      bulletPoints: input.bulletPoints || [],
      targetLanguage: input.targetLanguage,
    };
  }

  try {
    const prompt = `
Traduis avec précision et style commercial le contenu e-commerce suivant vers la langue : ${targetName}.
- Titre : "${input.title}"
- Slogan : "${input.tagline || ""}"
- Description (garder les balises HTML si présentes) : "${input.description}"
- Points forts : ${JSON.stringify(input.bulletPoints || [])}

Réponds STRICTEMENT en JSON :
{
  "title": "Titre traduit",
  "tagline": "Slogan traduit",
  "description": "Description traduite",
  "bulletPoints": ["Point 1 traduit", "Point 2 traduit"],
  "targetLanguage": "${input.targetLanguage}"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as AiTranslationResult;
  } catch (error) {
    return {
      title: `${input.title} [${input.targetLanguage.toUpperCase()}]`,
      tagline: input.tagline || `Top quality product`,
      description: input.description,
      bulletPoints: input.bulletPoints || [],
      targetLanguage: input.targetLanguage,
    };
  }
}

export async function generateProductFaq(title: string, category?: string): Promise<AiFaqItem[]> {
  const ai = getGenAIClient();

  if (!ai) {
    return [
      {
        question: `Quels sont les délais de livraison pour ${title} ?`,
        answer: `La livraison s'effectue généralement sous 2 à 4 jours ouvrés avec suivi Colissimo / La Poste Suisse.`,
      },
      {
        question: `Puis-je retourner le produit s'il ne me convient pas ?`,
        answer: `Oui, vous disposez de 14 jours à compter de la réception pour effectuer un retour gratuit.`,
      },
      {
        question: `Quelle est la garantie appliquée sur ${title} ?`,
        answer: `Tous nos articles bénéficient de la garantie légale de conformité de 2 ans.`,
      },
    ];
  }

  try {
    const prompt = `
Génère 3 à 4 questions/réponses de réassurance client (FAQ) pour le produit e-commerce :
- Produit : "${title}"
- Catégorie : "${category || "E-commerce"}"

Réponds STRICTEMENT sous forme d'un tableau JSON d'objets :
[
  { "question": "Question client fréquente", "answer": "Réponse rassurante et professionnelle" }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as AiFaqItem[];
  } catch (error) {
    return [
      {
        question: `Quels sont les délais de livraison pour ${title} ?`,
        answer: `La livraison s'effectue généralement sous 2 à 4 jours ouvrés avec suivi postal.`,
      },
      {
        question: `Puis-je retourner le produit s'il ne me convient pas ?`,
        answer: `Oui, vous disposez de 14 jours pour effectuer un retour en toute sérénité.`,
      },
    ];
  }
}
