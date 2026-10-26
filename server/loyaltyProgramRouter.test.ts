import { describe, it, expect } from "vitest";
import {
  getStoreLoyaltyConfig,
  saveStoreLoyaltyConfig,
  getCustomerLoyaltyAccount,
  redeemPointsForDiscount,
} from "./db/loyaltyProgramStorage";

describe("Loyalty Program & Referral System", () => {
  const storeId = 999;
  const userId = 888;
  const userEmail = "testloyalty@example.com";

  it("should return default loyalty config for store", async () => {
    const config = await getStoreLoyaltyConfig(storeId);
    expect(config).toBeDefined();
    expect(config.storeId).toBe(storeId);
    expect(config.enabled).toBe(true);
    expect(config.pointsPerSpentCents).toBeGreaterThan(0);
  });

  it("should update loyalty config for store", async () => {
    const updated = await saveStoreLoyaltyConfig(storeId, {
      pointsPerSpentCents: 2,
      centsPerRedeemedPoint: 10,
      minRedeemPoints: 100,
      referralRewardCents: 1500,
      enabled: true,
    });

    expect(updated.pointsPerSpentCents).toBe(2);
    expect(updated.centsPerRedeemedPoint).toBe(10);
    expect(updated.minRedeemPoints).toBe(100);

    const reFetched = await getStoreLoyaltyConfig(storeId);
    expect(reFetched.centsPerRedeemedPoint).toBe(10);
  });

  it("should create/retrieve customer loyalty account with referral code", async () => {
    const account = await getCustomerLoyaltyAccount(storeId, userId, userEmail);
    expect(account).toBeDefined();
    expect(account.userId).toBe(userId);
    expect(account.referralCode).toBeDefined();
    expect(account.referralCode.length).toBeGreaterThan(3);
  });

  it("should handle point redemption", async () => {
    // First retrieve account to ensure initialized
    const account = await getCustomerLoyaltyAccount(storeId, userId, userEmail);

    // Give points balance if needed to test redemption
    if (account.pointsBalance < 100) {
      account.pointsBalance = 200;
    }

    const redemption = await redeemPointsForDiscount(storeId, userId, 100, userEmail);
    expect(redemption.success).toBe(true);
    expect(redemption.promoCode).toMatch(/^FIDELITE-/);
    expect(redemption.discountCents).toBeGreaterThan(0);
  });
});
