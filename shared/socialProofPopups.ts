import { z } from "zod";

export interface SocialProofNotification {
  id: string;
  customerName: string;
  city: string;
  productTitle: string;
  timeAgo: string;
  productImageUrl?: string;
}

export interface SocialProofConfig {
  storeId: number;
  enabled: boolean;
  displayIntervalSeconds: number; // e.g. 10s between popups
  hideOnMobile: boolean;
}

export const socialProofConfigSchema = z.object({
  enabled: z.boolean().default(true),
  displayIntervalSeconds: z.number().int().min(3).max(60).default(10),
  hideOnMobile: z.boolean().default(false),
});
