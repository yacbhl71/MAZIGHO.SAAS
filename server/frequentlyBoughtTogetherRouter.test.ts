import { describe, it, expect } from "vitest";
import {
  saveFbtBundle,
  getFbtBundleForProduct,
  getStoreFbtBundles,
} from "./db/frequentlyBoughtTogetherStorage";

describe("Frequently Bought Together Cross-Sell Engine", () => {
  const storeId = 11;
  const mainProductId = 100;

  it("should create a frequently bought together bundle", async () => {
    const bundle = await saveFbtBundle(storeId, {
      mainProductId,
      addonProductIds: [101, 102],
      discountPercentage: 15,
      title: "Complétez votre look",
      enabled: true,
    });

    expect(bundle).toBeDefined();
    expect(bundle.id).toMatch(/^FBT-/);
    expect(bundle.discountPercentage).toBe(15);
  });

  it("should retrieve active FBT bundle for product page", async () => {
    const bundle = await getFbtBundleForProduct(storeId, mainProductId);
    expect(bundle).not.toBeNull();
    expect(bundle?.addonProductIds).toContain(101);
  });
});
