import { describe, it, expect } from "vitest";
import {
  subscribeToBackInStock,
  getStoreBackInStockSubscriptions,
  notifyBackInStockForProduct,
} from "./db/backInStockStorage";

describe("Back in Stock Alert System", () => {
  const storeId = 111;
  const productId = 99;

  it("should subscribe a customer email for an out of stock product", async () => {
    const sub = await subscribeToBackInStock(storeId, {
      productId,
      productTitle: "Veste en Cuir Noir (M)",
      customerEmail: "attente@example.com",
    });

    expect(sub).toBeDefined();
    expect(sub.id).toMatch(/^BIS-/);
    expect(sub.notified).toBe(false);
  });

  it("should list waiting customers for a store", async () => {
    const subs = await getStoreBackInStockSubscriptions(storeId);
    expect(subs.length).toBeGreaterThan(0);
    expect(subs[0].productId).toBe(productId);
  });

  it("should notify customers and mark subscription as notified", async () => {
    const result = await notifyBackInStockForProduct(storeId, productId);
    expect(result.notifiedCount).toBeGreaterThan(0);

    const subs = await getStoreBackInStockSubscriptions(storeId);
    const updated = subs.find((s) => s.productId === productId);
    expect(updated?.notified).toBe(true);
  });
});
