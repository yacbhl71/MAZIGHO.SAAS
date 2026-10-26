export type WhatsAppSmsChannel = "whatsapp" | "sms";

export type WhatsAppSmsSegment = "all_customers" | "abandoned_carts" | "vip_loyalty" | "recent_buyers";

export type WhatsAppSmsCampaign = {
  id: string;
  storeId: number;
  channel: WhatsAppSmsChannel;
  title: string;
  message: string;
  segment: WhatsAppSmsSegment;
  status: "draft" | "scheduled" | "sent";
  recipientCount: number;
  deliveredCount?: number;
  createdAt: string;
  sentAt?: string;
};

export type WhatsAppSmsSettings = {
  enabled: boolean;
  provider: "twilio" | "brevo" | "mazigho_gateway";
  accountSidOrApiKey: string;
  senderIdOrNumber: string;
};

const storeCampaignsMap = new Map<number, WhatsAppSmsCampaign[]>();
const storeSettingsMap = new Map<number, WhatsAppSmsSettings>();

export async function getStoreWhatsAppSmsCampaigns(storeId: number): Promise<WhatsAppSmsCampaign[]> {
  return storeCampaignsMap.get(storeId) || [
    {
      id: `WS-DEFAULT-1`,
      storeId,
      channel: "whatsapp",
      title: "Relance Panier Abandonné - Suisse & Maghreb",
      message: "Bonjour ! Votre panier sur MAZIGHO vous attend. Finalisez votre commande en 1 clic et profitez de la livraison rapide.",
      segment: "abandoned_carts",
      status: "sent",
      recipientCount: 42,
      deliveredCount: 41,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      sentAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: `WS-DEFAULT-2`,
      storeId,
      channel: "sms",
      title: "Alerte Flash Vente - 24h",
      message: "🔥 Vente Flash Exclusive ! -30% sur toute la collection pendant 24h sur notre boutique. Commandez vite :",
      segment: "all_customers",
      status: "draft",
      recipientCount: 156,
      createdAt: new Date().toISOString(),
    }
  ];
}

export async function saveWhatsAppSmsCampaign(
  storeId: number,
  input: {
    id?: string;
    channel: WhatsAppSmsChannel;
    title: string;
    message: string;
    segment: WhatsAppSmsSegment;
    status?: "draft" | "scheduled" | "sent";
    recipientCount?: number;
  }
): Promise<WhatsAppSmsCampaign> {
  const campaigns = await getStoreWhatsAppSmsCampaigns(storeId);

  if (input.id) {
    const idx = campaigns.findIndex(c => c.id === input.id);
    if (idx !== -1) {
      const updated: WhatsAppSmsCampaign = {
        ...campaigns[idx],
        ...input,
        status: input.status || campaigns[idx].status,
        recipientCount: input.recipientCount ?? campaigns[idx].recipientCount,
        sentAt: input.status === "sent" && campaigns[idx].status !== "sent" ? new Date().toISOString() : campaigns[idx].sentAt,
        deliveredCount: input.status === "sent" ? Math.floor((input.recipientCount ?? campaigns[idx].recipientCount) * 0.98) : campaigns[idx].deliveredCount,
      };
      campaigns[idx] = updated;
      storeCampaignsMap.set(storeId, campaigns);
      return updated;
    }
  }

  const newCampaign: WhatsAppSmsCampaign = {
    id: `WS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId,
    channel: input.channel,
    title: input.title,
    message: input.message,
    segment: input.segment,
    status: input.status || "draft",
    recipientCount: input.recipientCount || 100,
    deliveredCount: input.status === "sent" ? 98 : undefined,
    createdAt: new Date().toISOString(),
    sentAt: input.status === "sent" ? new Date().toISOString() : undefined,
  };

  campaigns.unshift(newCampaign);
  storeCampaignsMap.set(storeId, campaigns);
  return newCampaign;
}

export async function getStoreWhatsAppSmsSettings(storeId: number): Promise<WhatsAppSmsSettings> {
  return storeSettingsMap.get(storeId) || {
    enabled: true,
    provider: "mazigho_gateway",
    accountSidOrApiKey: "mz_live_gateway_token_swiss_maghreb",
    senderIdOrNumber: "+41228199100",
  };
}

export async function saveStoreWhatsAppSmsSettings(
  storeId: number,
  settings: WhatsAppSmsSettings
): Promise<WhatsAppSmsSettings> {
  storeSettingsMap.set(storeId, settings);
  return settings;
}
