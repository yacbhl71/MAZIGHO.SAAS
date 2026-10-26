import { z } from "zod";

export type DiscountType = "AUTOMATIC_TIER" | "BUY_X_GET_Y" | "PROMO_CODE";

export interface DiscountRule {
  id: string;
  storeId: number;
  title: string;
  type: DiscountType;
  enabled: boolean;
  // For AUTOMATIC_TIER
  minSubtotalCents?: number;
  discountPercentage?: number;
  discountFixedCents?: number;
  // For BUY_X_GET_Y (BOGO)
  buyProductId?: number;
  buyQuantity?: number;
  getDiscountedProductId?: number;
  getDiscountPercentage?: number; // 100 = free, 50 = half price
  // For PROMO_CODE
  code?: string;
  usageLimit?: number;
  timesUsed?: number;
  createdAt: string;
}

export const discountRuleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Intitulé de la règle requis"),
  type: z.enum(["AUTOMATIC_TIER", "BUY_X_GET_Y", "PROMO_CODE"]),
  enabled: z.boolean().default(true),
  minSubtotalCents: z.number().int().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountFixedCents: z.number().int().min(0).optional(),
  buyProductId: z.number().int().optional(),
  buyQuantity: z.number().int().min(1).optional(),
  getDiscountedProductId: z.number().int().optional(),
  getDiscountPercentage: z.number().min(0).max(100).optional(),
  code: z.string().optional(),
  usageLimit: z.number().int().min(1).optional(),
});

export interface EvaluatedDiscountResult {
  appliedRules: {
    ruleId: string;
    title: string;
    discountCents: number;
  }[];
  totalDiscountCents: number;
  finalSubtotalCents: number;
}
