import test from "node:test";
import assert from "node:assert/strict";
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

test("storeScope allows AI Studio preview and localhost hosts to resolve primary platform store", () => {
  assert.equal(normalizeStoreHost("https://ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app"), "ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app");
  assert.equal(mayUsePlatformStoreFallback("ais-dev-xjk2fwcorwtvnxleanj4ym-593826265441.europe-west2.run.app", "mazigho.ch"), true);
  assert.equal(mayUsePlatformStoreFallback("localhost:3000", "mazigho.ch"), true);
  assert.equal(mayUsePlatformStoreFallback("0.0.0.0:3000", "mazigho.ch"), true);
  assert.equal(mayUsePlatformStoreFallback("unregistered-custom-domain.com", "mazigho.ch"), false);
});

test("demoFallback provides complete catalog, delivery profiles, auth users, and cart operations without DB", () => {
  assert.ok(DEMO_STORES.length >= 3);
  assert.ok(DEMO_CATEGORIES.length >= 10);
  assert.ok(DEMO_PRODUCTS.length >= 10);
  assert.ok(DEMO_DELIVERY_PROFILES.length >= 100);

  const admin = getDemoUserByEmail("admin@mazigho.ch");
  assert.ok(admin);
  assert.equal(admin.role, "admin");

  clearDemoCart(999, 1);
  addDemoCartItem(999, 1, 2, 1);
  let cart = getDemoCart(999, 1);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 2);

  updateDemoCartItem(999, 1, 5, 1);
  cart = getDemoCart(999, 1);
  assert.equal(cart.items[0].quantity, 5);

  clearDemoCart(999, 1);
  cart = getDemoCart(999, 1);
  assert.equal(cart.items.length, 0);
});
