import { z } from "zod";

export interface FlashSaleCampaign {
  id: string;
  storeId: number;
  title: string;
  enabled: boolean;
  startTime: string; // ISO string
  endTime: string; // ISO string
  discountPercentage: number;
  affectedProductIds: number[];
  showBannerCountdown: boolean;
  showProductCountdown: boolean;
  createdAt: string;
}

export const flashSaleCampaignSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Intitulé requis"),
  enabled: z.boolean().default(true),
  startTime: z.string().min(1, "Date de début requise"),
  endTime: z.string().min(1, "Date de fin requise"),
  discountPercentage: z.number().min(1).max(99).default(20),
  affectedProductIds: z.array(z.number().int()).default([]),
  showBannerCountdown: z.boolean().default(true),
  showProductCountdown: z.boolean().default(true),
});
