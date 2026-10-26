import { z } from "zod";

export interface StickyAddToCartConfig {
  storeId: number;
  enabled: boolean;
  showOnMobile: boolean;
  showPriceAndImage: boolean;
}

export const stickyAddToCartConfigSchema = z.object({
  enabled: z.boolean().default(true),
  showOnMobile: z.boolean().default(true),
  showPriceAndImage: z.boolean().default(true),
});
