import { z } from "zod";

export type SubscriptionFrequency =
  | "2_WEEKS"
  | "1_MONTH"
  | "2_MONTHS"
  | "3_MONTHS";

export interface CustomerSubscription {
  id: string;
  storeId: number;
  userId: number;
  productId: number;
  productTitle: string;
  priceCents: number;
  discountPercentage: number;
  finalPriceCents: number;
  frequency: SubscriptionFrequency;
  nextDeliveryDate: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  createdAt: string;
}

export interface ProductSubscriptionsConfig {
  storeId: number;
  enabled: boolean;
  defaultDiscountPercentage: number; // e.g. 10%
  supportedFrequencies: SubscriptionFrequency[];
}

export const subscriptionsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  defaultDiscountPercentage: z.number().min(1).max(50).default(10),
  supportedFrequencies: z
    .array(z.enum(["2_WEEKS", "1_MONTH", "2_MONTHS", "3_MONTHS"]))
    .default(["2_WEEKS", "1_MONTH", "2_MONTHS"]),
});

export const createSubscriptionSchema = z.object({
  productId: z.number().int().positive(),
  productTitle: z.string().min(1),
  priceCents: z.number().int().min(1),
  frequency: z.enum(["2_WEEKS", "1_MONTH", "2_MONTHS", "3_MONTHS"]),
});
