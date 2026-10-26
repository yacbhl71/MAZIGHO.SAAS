import { describe, it, expect } from "vitest";
import {
  getSocialProofConfig,
  saveSocialProofConfig,
  getRecentPurchasesForSocialProof,
} from "./db/socialProofPopupsStorage";

describe("Social Proof Popups & Sales Feed Engine", () => {
  const storeId = 99;

  it("should return social proof config and recent purchases feed", async () => {
    const config = await getSocialProofConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);

    const feed = await getRecentPurchasesForSocialProof(storeId);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0].customerName).toBeDefined();
  });

  it("should return empty feed when social proof is toggled off", async () => {
    await saveSocialProofConfig(storeId, {
      enabled: false,
      displayIntervalSeconds: 10,
      hideOnMobile: true,
    });

    const feed = await getRecentPurchasesForSocialProof(storeId);
    expect(feed.length).toBe(0);
  });
});
