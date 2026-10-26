import { z } from "zod";

export interface FbtBundle {
  id: string;
  storeId: number;
  mainProductId: number;
  addonProductIds: number[];
  discountPercentage: number; // e.g. 15%
  title: string;
  enabled: boolean;
  createdAt: string;
}

export const fbtBundleSchema = z.object({
  id: z.string().optional(),
  mainProductId: z.number().int().positive(),
  addonProductIds: z.array(z.number().int().positive()).min(1, "Au moins 1 produit complémentaire requis"),
  discountPercentage: z.number().min(0).max(50).default(10),
  title: z.string().default("Fréquemment Achetés Ensemble"),
  enabled: z.boolean().default(true),
});
