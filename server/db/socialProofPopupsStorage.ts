import {
  SocialProofConfig,
  SocialProofNotification,
  socialProofConfigSchema,
} from "../../shared/socialProofPopups";
import { z } from "zod";

const storeSocialConfigs = new Map<number, SocialProofConfig>();

export async function getSocialProofConfig(
  storeId: number
): Promise<SocialProofConfig> {
  const existing = storeSocialConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: SocialProofConfig = {
    storeId,
    enabled: true,
    displayIntervalSeconds: 8,
    hideOnMobile: false,
  };

  storeSocialConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveSocialProofConfig(
  storeId: number,
  input: z.infer<typeof socialProofConfigSchema>
): Promise<SocialProofConfig> {
  const current = await getSocialProofConfig(storeId);
  const updated: SocialProofConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeSocialConfigs.set(storeId, updated);
  return updated;
}

export async function getRecentPurchasesForSocialProof(
  storeId: number
): Promise<SocialProofNotification[]> {
  const config = await getSocialProofConfig(storeId);
  if (!config.enabled) return [];

  // Generate realistic recent purchase social proof feed
  return [
    {
      id: "SP-1",
      customerName: "Sophie M.",
      city: "Lausanne",
      productTitle: "Veste d'Hiver Laine & Cachemire",
      timeAgo: "il y a 4 minutes",
      productImageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200",
    },
    {
      id: "SP-2",
      customerName: "Marc B.",
      city: "Genève",
      productTitle: "Montre Chronographe Automatique",
      timeAgo: "il y a 12 minutes",
      productImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
    },
    {
      id: "SP-3",
      customerName: "Elena R.",
      city: "Zurich",
      productTitle: "Chaussures en Cuir Pro",
      timeAgo: "il y a 28 minutes",
      productImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
    },
  ];
}
