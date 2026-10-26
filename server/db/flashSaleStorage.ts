import {
  FlashSaleCampaign,
  flashSaleCampaignSchema,
} from "../../shared/flashSaleTimer";
import { z } from "zod";

const storeFlashSalesMap = new Map<number, FlashSaleCampaign[]>();

export async function getStoreFlashSales(storeId: number): Promise<FlashSaleCampaign[]> {
  return storeFlashSalesMap.get(storeId) || [];
}

export async function saveStoreFlashSale(
  storeId: number,
  input: z.infer<typeof flashSaleCampaignSchema>
): Promise<FlashSaleCampaign> {
  const campaigns = storeFlashSalesMap.get(storeId) || [];

  if (input.id) {
    const idx = campaigns.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      const updated: FlashSaleCampaign = {
        ...campaigns[idx],
        ...input,
        storeId,
      };
      campaigns[idx] = updated;
      storeFlashSalesMap.set(storeId, campaigns);
      return updated;
    }
  }

  const newCampaign: FlashSaleCampaign = {
    id: `FLASH-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId,
    title: input.title,
    enabled: input.enabled ?? true,
    startTime: input.startTime,
    endTime: input.endTime,
    discountPercentage: input.discountPercentage,
    affectedProductIds: input.affectedProductIds,
    showBannerCountdown: input.showBannerCountdown,
    showProductCountdown: input.showProductCountdown,
    createdAt: new Date().toISOString(),
  };

  campaigns.unshift(newCampaign);
  storeFlashSalesMap.set(storeId, campaigns);

  return newCampaign;
}

export async function toggleStoreFlashSale(
  storeId: number,
  id: string,
  enabled: boolean
): Promise<FlashSaleCampaign> {
  const campaigns = storeFlashSalesMap.get(storeId) || [];
  const idx = campaigns.findIndex((c) => c.id === id);

  if (idx === -1) {
    throw new Error("Campagne Vente Flash introuvable.");
  }

  campaigns[idx].enabled = enabled;
  storeFlashSalesMap.set(storeId, campaigns);
  return campaigns[idx];
}

export async function getActiveFlashSaleForStore(
  storeId: number
): Promise<FlashSaleCampaign | null> {
  const campaigns = (storeFlashSalesMap.get(storeId) || []).filter((c) => c.enabled);
  const now = new Date();

  const active = campaigns.find((c) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);
    return now >= start && now <= end;
  });

  return active || null;
}
