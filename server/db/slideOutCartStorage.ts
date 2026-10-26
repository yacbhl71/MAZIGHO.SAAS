import {
  SlideOutCartConfig,
  slideOutCartConfigSchema,
} from "../../shared/slideOutCartConfig";
import { z } from "zod";

const storeCartConfigs = new Map<number, SlideOutCartConfig>();

export async function getSlideOutCartConfig(storeId: number): Promise<SlideOutCartConfig> {
  const existing = storeCartConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: SlideOutCartConfig = {
    storeId,
    enabled: true,
    freeShippingGoalEnabled: true,
    freeShippingThresholdCents: 10000, // 100 CHF default
    upsellEnabled: true,
    featuredUpsellProductIds: [],
    customShippingNote: "Livraison rapide assurée en 24-48h.",
  };

  storeCartConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveSlideOutCartConfig(
  storeId: number,
  input: z.infer<typeof slideOutCartConfigSchema>
): Promise<SlideOutCartConfig> {
  const current = await getSlideOutCartConfig(storeId);

  const updated: SlideOutCartConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeCartConfigs.set(storeId, updated);
  return updated;
}
