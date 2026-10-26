import { z } from "zod";

export interface AffiliateAmbassador {
  id: string;
  storeId: number;
  name: string;
  email: string;
  affiliateCode: string;
  commissionPercentage: number;
  totalSalesCents: number;
  totalCommissionCents: number;
  status: "ACTIVE" | "PAUSED";
  createdAt: string;
}

export interface AffiliateProgramConfig {
  storeId: number;
  enabled: boolean;
  defaultCommissionPercentage: number; // e.g. 10%
}

export const createAffiliateSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Adresse email invalide"),
  commissionPercentage: z.number().min(1).max(50).default(10),
});

export const affiliateConfigSchema = z.object({
  enabled: z.boolean().default(true),
  defaultCommissionPercentage: z.number().min(1).max(50).default(10),
});
