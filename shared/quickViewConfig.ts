import { z } from "zod";

export interface QuickViewConfig {
  storeId: number;
  enabled: boolean;
  showVariantsMatrix: boolean;
  enableDirectAddToCart: boolean;
}

export const quickViewConfigSchema = z.object({
  enabled: z.boolean().default(true),
  showVariantsMatrix: z.boolean().default(true),
  enableDirectAddToCart: z.boolean().default(true),
});
