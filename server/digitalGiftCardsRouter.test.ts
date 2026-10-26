import { describe, it, expect } from "vitest";
import {
  createStoreGiftCard,
  getStoreGiftCards,
  getGiftCardByCode,
  redeemGiftCardBalance,
} from "./db/digitalGiftCardsStorage";

describe("Digital Gift Cards Engine", () => {
  const storeId = 44;

  it("should create a new store gift card with balance", async () => {
    const card = await createStoreGiftCard(storeId, {
      initialBalanceCents: 10000, // 100 CHF
      recipientEmail: "cadeau@example.com",
      message: "Bon anniversaire !",
    });

    expect(card).toBeDefined();
    expect(card.code).toMatch(/^GIFT-/);
    expect(card.remainingBalanceCents).toBe(10000);
    expect(card.status).toBe("ACTIVE");
  });

  it("should redeem balance partial and update status when exhausted", async () => {
    const cards = await getStoreGiftCards(storeId);
    const code = cards[0].code;

    // Partial redeem 40 CHF (4000 cents)
    const redeem1 = await redeemGiftCardBalance({ code, amountCents: 4000 });
    expect(redeem1.redeemedCents).toBe(4000);
    expect(redeem1.remainingBalanceCents).toBe(6000);

    // Redeem remaining 60 CHF (6000 cents)
    const redeem2 = await redeemGiftCardBalance({ code, amountCents: 6000 });
    expect(redeem2.remainingBalanceCents).toBe(0);

    const check = await getGiftCardByCode(code);
    expect(check?.status).toBe("EXHAUSTED");
  });
});
