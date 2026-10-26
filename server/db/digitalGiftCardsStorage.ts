import {
  DigitalGiftCard,
  createGiftCardSchema,
  redeemGiftCardSchema,
} from "../../shared/digitalGiftCards";
import { z } from "zod";

const storeGiftCardsMap = new Map<number, DigitalGiftCard[]>();

export async function createStoreGiftCard(
  storeId: number,
  input: z.infer<typeof createGiftCardSchema>
): Promise<DigitalGiftCard> {
  const storeCards = storeGiftCardsMap.get(storeId) || [];

  const code = `GIFT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const card: DigitalGiftCard = {
    id: `CARD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    code,
    storeId,
    initialBalanceCents: input.initialBalanceCents,
    remainingBalanceCents: input.initialBalanceCents,
    recipientEmail: input.recipientEmail,
    senderName: input.senderName,
    message: input.message,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  storeCards.unshift(card);
  storeGiftCardsMap.set(storeId, storeCards);

  return card;
}

export async function getStoreGiftCards(storeId: number): Promise<DigitalGiftCard[]> {
  return storeGiftCardsMap.get(storeId) || [];
}

export async function getGiftCardByCode(code: string): Promise<DigitalGiftCard | null> {
  for (const cards of Array.from(storeGiftCardsMap.values())) {
    const found = cards.find((c: DigitalGiftCard) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (found) return found;
  }
  return null;
}

export async function redeemGiftCardBalance(
  input: z.infer<typeof redeemGiftCardSchema>
): Promise<{ success: boolean; redeemedCents: number; remainingBalanceCents: number }> {
  const card = await getGiftCardByCode(input.code);
  if (!card) {
    throw new Error("Carte-cadeau introuvable ou code expiré.");
  }

  if (card.status !== "ACTIVE" || card.remainingBalanceCents <= 0) {
    throw new Error("Cette carte-cadeau est épuisée ou inactive.");
  }

  const redeemedCents = Math.min(card.remainingBalanceCents, input.amountCents);
  card.remainingBalanceCents -= redeemedCents;

  if (card.remainingBalanceCents === 0) {
    card.status = "EXHAUSTED";
  }

  const cards = storeGiftCardsMap.get(card.storeId)!;
  const idx = cards.findIndex((c) => c.id === card.id);
  cards[idx] = card;
  storeGiftCardsMap.set(card.storeId, cards);

  return {
    success: true,
    redeemedCents,
    remainingBalanceCents: card.remainingBalanceCents,
  };
}
