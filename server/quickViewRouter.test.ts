import { describe, it, expect } from "vitest";
import {
  getQuickViewConfig,
  saveQuickViewConfig,
} from "./db/quickViewStorage";

describe("Quick View & Quick Buy Modal Engine", () => {
  const storeId = 66;

  it("should return default quick view config", async () => {
    const config = await getQuickViewConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.showVariantsMatrix).toBe(true);
  });

  it("should update quick view config and toggles", async () => {
    const updated = await saveQuickViewConfig(storeId, {
      enabled: false,
      showVariantsMatrix: true,
      enableDirectAddToCart: true,
    });

    expect(updated.enabled).toBe(false);

    const refetched = await getQuickViewConfig(storeId);
    expect(refetched.enabled).toBe(false);
  });
});
