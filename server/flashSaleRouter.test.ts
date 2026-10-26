import { describe, it, expect } from "vitest";
import {
  saveStoreFlashSale,
  getStoreFlashSales,
  getActiveFlashSaleForStore,
  toggleStoreFlashSale,
} from "./db/flashSaleStorage";

describe("Flash Sales & Countdown Timers Engine", () => {
  const storeId = 222;

  it("should create and schedule a flash sale campaign", async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 1000 * 60 * 10).toISOString(); // 10 mins ago
    const endTime = new Date(now.getTime() + 1000 * 60 * 60 * 2).toISOString(); // 2 hours in future

    const sale = await saveStoreFlashSale(storeId, {
      title: "Vente Flash Spéciale 2H",
      discountPercentage: 25,
      startTime,
      endTime,
      showBannerCountdown: true,
      showProductCountdown: true,
      affectedProductIds: [],
      enabled: true,
    });

    expect(sale).toBeDefined();
    expect(sale.id).toMatch(/^FLASH-/);
    expect(sale.discountPercentage).toBe(25);
  });

  it("should detect currently active flash sale campaign", async () => {
    const active = await getActiveFlashSaleForStore(storeId);
    expect(active).not.toBeNull();
    expect(active?.discountPercentage).toBe(25);
  });

  it("should return null active sale when toggled off", async () => {
    const sales = await getStoreFlashSales(storeId);
    expect(sales.length).toBeGreaterThan(0);

    await toggleStoreFlashSale(storeId, sales[0].id, false);

    const active = await getActiveFlashSaleForStore(storeId);
    expect(active).toBeNull();
  });
});
