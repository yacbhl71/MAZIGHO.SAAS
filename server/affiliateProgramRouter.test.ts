import { describe, it, expect } from "vitest";
import {
  createAffiliateAmbassador,
  getStoreAffiliates,
  recordAffiliateSale,
  getAffiliateConfig,
  saveAffiliateConfig,
} from "./db/affiliateProgramStorage";

describe("Affiliate & Ambassador Program Engine", () => {
  const storeId = 33;

  it("should create an affiliate ambassador with unique referral code", async () => {
    const aff = await createAffiliateAmbassador(storeId, {
      name: "Sonia Mode",
      email: "sonia@example.com",
      commissionPercentage: 12,
    });

    expect(aff).toBeDefined();
    expect(aff.id).toMatch(/^AFF-/);
    expect(aff.affiliateCode).toContain("SONIA");
    expect(aff.commissionPercentage).toBe(12);
  });

  it("should record sale and calculate commission correctly", async () => {
    const affiliates = await getStoreAffiliates(storeId);
    expect(affiliates.length).toBeGreaterThan(0);

    const targetCode = affiliates[0].affiliateCode;
    const saleResult = await recordAffiliateSale(storeId, targetCode, 20000); // 200 CHF sale

    expect(saleResult).not.toBeNull();
    expect(saleResult?.totalSalesCents).toBe(20000);
    expect(saleResult?.totalCommissionCents).toBe(2400); // 12% of 200 CHF = 24 CHF
  });

  it("should throw error when program is disabled", async () => {
    await saveAffiliateConfig(storeId, {
      enabled: false,
      defaultCommissionPercentage: 10,
    });

    await expect(
      createAffiliateAmbassador(storeId, {
        name: "Test",
        email: "test@example.com",
        commissionPercentage: 10,
      })
    ).rejects.toThrow();
  });
});
