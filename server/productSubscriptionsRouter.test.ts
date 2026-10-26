import { describe, it, expect } from "vitest";
import {
  createCustomerSubscription,
  getCustomerSubscriptions,
  getSubscriptionConfig,
  saveSubscriptionConfig,
} from "./db/productSubscriptionsStorage";

describe("Product Subscriptions & Subscribe & Save Engine", () => {
  const storeId = 66;
  const userId = 88;

  it("should create a recurring customer subscription with discount", async () => {
    const sub = await createCustomerSubscription(storeId, userId, {
      productId: 15,
      productTitle: "Café Bio en Grain (1kg)",
      priceCents: 3000, // 30 CHF
      frequency: "1_MONTH",
    });

    expect(sub).toBeDefined();
    expect(sub.id).toMatch(/^SUB-/);
    expect(sub.discountPercentage).toBe(10);
    expect(sub.finalPriceCents).toBe(2700); // 27 CHF
    expect(sub.status).toBe("ACTIVE");
  });

  it("should fetch active customer subscriptions", async () => {
    const subs = await getCustomerSubscriptions(storeId, userId);
    expect(subs.length).toBeGreaterThan(0);
    expect(subs[0].productId).toBe(15);
  });

  it("should allow store owner to customize subscription discount rate", async () => {
    await saveSubscriptionConfig(storeId, {
      enabled: true,
      defaultDiscountPercentage: 15,
      supportedFrequencies: ["2_WEEKS", "1_MONTH"],
    });

    const config = await getSubscriptionConfig(storeId);
    expect(config.defaultDiscountPercentage).toBe(15);
  });
});
