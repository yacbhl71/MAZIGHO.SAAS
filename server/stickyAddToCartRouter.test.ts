import { describe, it, expect } from "vitest";
import {
  getStickyAddToCartConfig,
  saveStickyAddToCartConfig,
} from "./db/stickyAddToCartStorage";

describe("Sticky Add to Cart Bar Engine", () => {
  const storeId = 22;

  it("should return default sticky add to cart config", async () => {
    const config = await getStickyAddToCartConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.showOnMobile).toBe(true);
  });

  it("should update sticky add to cart settings", async () => {
    const updated = await saveStickyAddToCartConfig(storeId, {
      enabled: false,
      showOnMobile: false,
      showPriceAndImage: true,
    });

    expect(updated.enabled).toBe(false);

    const refetched = await getStickyAddToCartConfig(storeId);
    expect(refetched.enabled).toBe(false);
  });
});
