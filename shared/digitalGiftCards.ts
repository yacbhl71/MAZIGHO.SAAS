import { z } from "zod";

export interface DigitalGiftCard {
  id: string;
  code: string;
  storeId: number;
  initialBalanceCents: number;
  remainingBalanceCents: number;
  recipientEmail?: string;
  senderName?: string;
  message?: string;
  status: "ACTIVE" | "EXHAUSTED" | "EXPIRED";
  createdAt: string;
}

export const createGiftCardSchema = z.object({
  initialBalanceCents: z.number().int().min(500, "Montant minimum 5 CHF"),
  recipientEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  message: z.string().optional(),
});

export const redeemGiftCardSchema = z.object({
  code: z.string().min(4, "Code de carte-cadeau invalide"),
  amountCents: z.number().int().positive(),
});
