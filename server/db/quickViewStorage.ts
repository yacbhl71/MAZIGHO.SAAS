import {
  QuickViewConfig,
  quickViewConfigSchema,
} from "../../shared/quickViewConfig";
import { z } from "zod";

const storeQuickViewConfigs = new Map<number, QuickViewConfig>();

export async function getQuickViewConfig(storeId: number): Promise<QuickViewConfig> {
  const existing = storeQuickViewConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: QuickViewConfig = {
    storeId,
    enabled: true,
    showVariantsMatrix: true,
    enableDirectAddToCart: true,
  };

  storeQuickViewConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveQuickViewConfig(
  storeId: number,
  input: z.infer<typeof quickViewConfigSchema>
): Promise<QuickViewConfig> {
  const current = await getQuickViewConfig(storeId);

  const updated: QuickViewConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeQuickViewConfigs.set(storeId, updated);
  return updated;
}
