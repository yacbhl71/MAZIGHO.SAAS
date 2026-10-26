import { z } from "zod";

export type SegmentTag =
  | "VIP"
  | "RECURRING"
  | "HIGH_AOV"
  | "NEW_CUSTOMER"
  | "INACTIVE_60D";

export interface SegmentedCustomer {
  userId: number;
  email: string;
  name: string;
  totalSpentCents: number;
  ordersCount: number;
  lastOrderDate: string;
  tags: SegmentTag[];
}

export interface CustomerSegmentsConfig {
  storeId: number;
  enabled: boolean;
  vipThresholdCents: number; // e.g. 50000 cents (500 CHF)
  highAovThresholdCents: number; // e.g. 15000 cents (150 CHF)
}

export const customerSegmentationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  vipThresholdCents: z.number().int().min(1000).default(50000),
  highAovThresholdCents: z.number().int().min(1000).default(15000),
});
