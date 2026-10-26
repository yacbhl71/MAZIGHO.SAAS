import {
  StickyAddToCartConfig,
  stickyAddToCartConfigSchema,
} from "../../shared/stickyAddToCart";
import { z } from "zod";

const storeStickyConfigs = new Map<number, StickyAddToCartConfig>();

export async function getStickyAddToCartConfig(
  storeId: number
): Promise<StickyAddToCartConfig> {
  const existing = storeStickyConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: StickyAddToCartConfig = {
    storeId,
    enabled: true,
    showOnMobile: true,
    showPriceAndImage: true,
  };

  storeStickyConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveStickyAddToCartConfig(
  storeId: number,
  input: z.infer<typeof stickyAddToCartConfigSchema>
): Promise<StickyAddToCartConfig> {
  const current = await getStickyAddToCartConfig(storeId);
  const updated: StickyAddToCartConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeStickyConfigs.set(storeId, updated);
  return updated;
}
