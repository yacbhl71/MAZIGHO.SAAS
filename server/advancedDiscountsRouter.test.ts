import { describe, it, expect } from "vitest";
import {
  saveStoreDiscountRule,
  getStoreDiscountRules,
  toggleStoreDiscountRule,
  evaluateCartDiscounts,
} from "./db/advancedDiscountsStorage";

describe("Advanced Automatic Discounts & BOGO Engine", () => {
  const storeId = 444;

  it("should create an automatic tier discount rule", async () => {
    const rule = await saveStoreDiscountRule(storeId, {
      title: "-10% Dès 100 CHF",
      type: "AUTOMATIC_TIER",
      enabled: true,
      minSubtotalCents: 10000,
      discountPercentage: 10,
    });

    expect(rule).toBeDefined();
    expect(rule.id).toMatch(/^DISC-/);
    expect(rule.enabled).toBe(true);
  });

  it("should evaluate automatic cart discount when subtotal threshold is reached", async () => {
    const result = await evaluateCartDiscounts(
      storeId,
      [{ productId: 1, quantity: 1, priceCents: 12000 }],
      12000
    );

    expect(result.appliedRules.length).toBeGreaterThan(0);
    expect(result.totalDiscountCents).toBe(1200); // 10% of 12000
    expect(result.finalSubtotalCents).toBe(10800);
  });

  it("should disable rule and verify no discount is applied when toggled off", async () => {
    const rules = await getStoreDiscountRules(storeId);
    expect(rules.length).toBeGreaterThan(0);

    await toggleStoreDiscountRule(storeId, rules[0].id, false);

    const result = await evaluateCartDiscounts(
      storeId,
      [{ productId: 1, quantity: 1, priceCents: 12000 }],
      12000
    );

    expect(result.appliedRules.length).toBe(0);
    expect(result.totalDiscountCents).toBe(0);
    expect(result.finalSubtotalCents).toBe(12000);
  });
});
