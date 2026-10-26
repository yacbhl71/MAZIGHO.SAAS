import { describe, it, expect } from "vitest";
import {
  getSlideOutCartConfig,
  saveSlideOutCartConfig,
} from "./db/slideOutCartStorage";

describe("Slide-out Cart & Free Shipping Goal", () => {
  const storeId = 333;

  it("should return default slide-out cart config", async () => {
    const config = await getSlideOutCartConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.freeShippingThresholdCents).toBe(10000);
  });

  it("should update slide-out cart config and free shipping threshold", async () => {
    const updated = await saveSlideOutCartConfig(storeId, {
      enabled: true,
      freeShippingGoalEnabled: true,
      freeShippingThresholdCents: 15000, // 150 CHF
      upsellEnabled: true,
      featuredUpsellProductIds: [10, 20],
    });

    expect(updated.freeShippingThresholdCents).toBe(15000);
    expect(updated.featuredUpsellProductIds).toContain(10);

    const refetched = await getSlideOutCartConfig(storeId);
    expect(refetched.freeShippingThresholdCents).toBe(15000);
  });
});
