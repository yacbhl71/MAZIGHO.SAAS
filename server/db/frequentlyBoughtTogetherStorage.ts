import {
  FbtBundle,
  fbtBundleSchema,
} from "../../shared/frequentlyBoughtTogether";
import { z } from "zod";

const storeFbtBundlesMap = new Map<number, FbtBundle[]>();

export async function getStoreFbtBundles(storeId: number): Promise<FbtBundle[]> {
  return storeFbtBundlesMap.get(storeId) || [];
}

export async function saveFbtBundle(
  storeId: number,
  input: z.infer<typeof fbtBundleSchema>
): Promise<FbtBundle> {
  const storeBundles = storeFbtBundlesMap.get(storeId) || [];

  if (input.id) {
    const idx = storeBundles.findIndex((b) => b.id === input.id);
    if (idx !== -1) {
      const updated: FbtBundle = {
        ...storeBundles[idx],
        ...input,
        storeId,
      };
      storeBundles[idx] = updated;
      storeFbtBundlesMap.set(storeId, storeBundles);
      return updated;
    }
  }

  const newBundle: FbtBundle = {
    id: `FBT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId,
    mainProductId: input.mainProductId,
    addonProductIds: input.addonProductIds,
    discountPercentage: input.discountPercentage,
    title: input.title || "Fréquemment Achetés Ensemble",
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString(),
  };

  storeBundles.unshift(newBundle);
  storeFbtBundlesMap.set(storeId, storeBundles);

  return newBundle;
}

export async function getFbtBundleForProduct(
  storeId: number,
  mainProductId: number
): Promise<FbtBundle | null> {
  const storeBundles = (storeFbtBundlesMap.get(storeId) || []).filter((b) => b.enabled);
  return storeBundles.find((b) => b.mainProductId === mainProductId) || null;
}
