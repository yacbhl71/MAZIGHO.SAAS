import { z } from "zod";

export interface BackInStockSubscription {
  id: string;
  storeId: number;
  productId: number;
  productTitle: string;
  customerEmail: string;
  notified: boolean;
  createdAt: string;
}

export const subscribeBackInStockSchema = z.object({
  productId: z.number().int().positive(),
  productTitle: z.string().min(1),
  customerEmail: z.string().email("Adresse email invalide"),
});
