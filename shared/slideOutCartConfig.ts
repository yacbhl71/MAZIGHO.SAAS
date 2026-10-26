import { z } from "zod";

export interface SlideOutCartConfig {
  storeId: number;
  enabled: boolean;
  freeShippingGoalEnabled: boolean;
  freeShippingThresholdCents: number; // e.g., 10000 cents (100 CHF)
  upsellEnabled: boolean;
  featuredUpsellProductIds: number[];
  customShippingNote?: string;
}

export const slideOutCartConfigSchema = z.object({
  enabled: z.boolean().default(true),
  freeShippingGoalEnabled: z.boolean().default(true),
  freeShippingThresholdCents: z.number().int().min(0).default(10000),
  upsellEnabled: z.boolean().default(true),
  featuredUpsellProductIds: z.array(z.number().int()).default([]),
  customShippingNote: z.string().optional(),
});
