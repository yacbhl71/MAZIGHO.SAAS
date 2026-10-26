import { describe, it, expect } from "vitest";
import {
  getStoreCustomerSegments,
  saveSegmentationConfig,
  getSegmentationConfig,
} from "./db/customerSegmentationStorage";

describe("Customer Segmentation & Tags Engine", () => {
  const storeId = 77;

  it("should return customer segments with dynamic tags", async () => {
    const { config, customers } = await getStoreCustomerSegments(storeId);
    expect(config).toBeDefined();
    expect(customers.length).toBeGreaterThan(0);

    const vipCustomer = customers.find((c) => c.tags.includes("VIP"));
    expect(vipCustomer).toBeDefined();
    expect(vipCustomer?.totalSpentCents).toBeGreaterThanOrEqual(config.vipThresholdCents);
  });

  it("should update VIP threshold and recalculate customer tags", async () => {
    await saveSegmentationConfig(storeId, {
      enabled: true,
      vipThresholdCents: 100000, // Increase VIP threshold to 1000 CHF
      highAovThresholdCents: 15000,
    });

    const updatedConfig = await getSegmentationConfig(storeId);
    expect(updatedConfig.vipThresholdCents).toBe(100000);

    const { customers } = await getStoreCustomerSegments(storeId);
    const reEvaluatedVips = customers.filter((c) => c.tags.includes("VIP"));
    expect(reEvaluatedVips.length).toBe(0); // 750 CHF customer is no longer VIP with 1000 CHF threshold
  });
});
