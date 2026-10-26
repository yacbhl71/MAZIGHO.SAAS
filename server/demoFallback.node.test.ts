import { describe, expect, it } from "vitest";
import { mayUsePlatformStoreFallback, normalizeStoreHost } from "./services/storeScope";
import {
  DEMO_STORES,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_DELIVERY_PROFILES,
  getDemoCart,
  addDemoCartItem,
  updateDemoCartItem,
  clearDemoCart,
  getDemoUserByEmail,
} from "./db/demoFallback";

describe("demoFallback and storeScope preview", () => {
  it("storeScope allows AI Studio preview and localhost hosts to resolve primary platform store", () => {
    expect(normalizeStoreHost("https://ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app")).toBe("ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app");
    expect(mayUsePlatformStoreFallback("ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app", "mazigho.ch")).toBe(true);
    expect(mayUsePlatformStoreFallback("localhost:3000", "mazigho.ch")).toBe(true);
    expect(mayUsePlatformStoreFallback("0.0.0.0:3000", "mazigho.ch")).toBe(true);
    expect(mayUsePlatformStoreFallback("unregistered-custom-domain.com", "mazigho.ch")).toBe(false);
  });

  it("demoFallback provides complete catalog, delivery profiles, auth users, and cart operations without DB", () => {
    expect(DEMO_STORES.length).toBeGreaterThanOrEqual(3);
    expect(DEMO_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    expect(DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(10);
    expect(DEMO_DELIVERY_PROFILES.length).toBeGreaterThanOrEqual(100);

    const admin = getDemoUserByEmail("admin@mazigho.ch");
    expect(admin).toBeDefined();
    expect(admin?.role).toBe("admin");

    clearDemoCart(999, 1);
    addDemoCartItem(999, 1, 2, 1);
    let cart = getDemoCart(999, 1);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(2);

    updateDemoCartItem(999, 1, 5, 1);
    cart = getDemoCart(999, 1);
    expect(cart.items[0].quantity).toBe(5);

    clearDemoCart(999, 1);
    cart = getDemoCart(999, 1);
    expect(cart.items.length).toBe(0);
  });
});

