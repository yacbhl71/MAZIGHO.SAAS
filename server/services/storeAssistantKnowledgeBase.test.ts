import { describe, expect, it } from "vitest";
import {
  STORE_FEATURES_GUIDE,
  buildStoreAssistantSystemPrompt,
} from "./storeAssistantKnowledgeBase";

describe("storeAssistantKnowledgeBase", () => {
  it("contains comprehensive operational guides for store features", () => {
    expect(STORE_FEATURES_GUIDE.length).toBeGreaterThanOrEqual(8);

    const categories = STORE_FEATURES_GUIDE.map(guide => guide.category);
    expect(categories).toContain("Catalogue & Produits");
    expect(categories).toContain("Thèmes & Vitrine");
    expect(categories).toContain("Expéditions & Livraisons");
    expect(categories).toContain("Paiements & Facturation");
    expect(categories).toContain("Marketing & Conversion");
    expect(categories).toContain("Nom de Domaine & Mise en Ligne");
  });

  it("includes drag-and-drop image guidance and step-by-step procedures", () => {
    const dndGuide = STORE_FEATURES_GUIDE.find(guide =>
      guide.featureName.includes("glisser-déposer")
    );
    expect(dndGuide).toBeDefined();
    expect(dndGuide?.steps.length).toBeGreaterThanOrEqual(4);
    expect(dndGuide?.steps.some(step => step.includes("Couverture"))).toBe(true);
  });

  it("includes Algerian 58 wilayas and COD guidance", () => {
    const algeriaGuide = STORE_FEATURES_GUIDE.find(guide =>
      guide.featureName.includes("Algérie")
    );
    expect(algeriaGuide).toBeDefined();
    expect(algeriaGuide?.steps.some(step => step.includes("58 wilayas") || step.includes("Stop-Desk"))).toBe(true);
    expect(algeriaGuide?.summary).toContain("livraison");
  });

  it("builds a rich system prompt for the store merchant", () => {
    const prompt = buildStoreAssistantSystemPrompt({
      storeName: "Atelier Berbère",
      isStudioAdmin: false,
      storeContextJson: JSON.stringify({ theme: "Artisanat" }),
    });

    expect(prompt).toContain("Atelier Berbère");
    expect(prompt).toContain("DIRECTIVES DE RÉPONSE OBLIGATOIRES");
    expect(prompt).toContain("DRAG & DROP D'IMAGES");
    expect(prompt).toContain("THÈMES & VITRINE");
    expect(prompt).toContain("BASE DE CONNAISSANCES OPÉRATIONNELLE");
  });

  it("builds an operator-focused system prompt for MAZIGHO Studio console", () => {
    const prompt = buildStoreAssistantSystemPrompt({
      storeName: "Console Studio",
      isStudioAdmin: true,
      storeContextJson: JSON.stringify({ totalStores: 12 }),
    });

    expect(prompt).toContain("MAZIGHO Studio");
    expect(prompt).toContain("opérateur de la console d'administration");
    expect(prompt).toContain("BASE DE CONNAISSANCES OPÉRATIONNELLE");
  });
});
