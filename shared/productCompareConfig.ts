import { z } from "zod";

export interface ProductCompareConfig {
  enabled: boolean;
  maxItems: number;
}

export const defaultProductCompareConfig: ProductCompareConfig = {
  enabled: true,
  maxItems: 4,
};

export const productCompareConfigSchema = z.object({
  enabled: z.boolean().default(true),
  maxItems: z.number().min(2).max(6).default(4),
});
