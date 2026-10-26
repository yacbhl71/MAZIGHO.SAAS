import {
  LiveSalesChatConfig,
  liveSalesChatConfigSchema,
} from "../../shared/liveSalesChat";
import { z } from "zod";

const storeChatConfigs = new Map<number, LiveSalesChatConfig>();

export async function getLiveSalesChatConfig(
  storeId: number
): Promise<LiveSalesChatConfig> {
  const existing = storeChatConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: LiveSalesChatConfig = {
    storeId,
    enabled: true,
    whatsappNumber: "+41791234567",
    welcomeMessage: "Bonjour ! Une question sur un produit ? Écrivez-nous directement sur WhatsApp !",
    position: "bottom-right",
    showMessenger: false,
  };

  storeChatConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveLiveSalesChatConfig(
  storeId: number,
  input: z.infer<typeof liveSalesChatConfigSchema>
): Promise<LiveSalesChatConfig> {
  const current = await getLiveSalesChatConfig(storeId);
  const updated: LiveSalesChatConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeChatConfigs.set(storeId, updated);
  return updated;
}
