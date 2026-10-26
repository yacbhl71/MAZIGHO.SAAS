export type AbandonedCartStatus = "abandoned" | "reminded" | "recovered" | "expired";

export interface CartItemDraft {
  productId: number;
  productName: string;
  priceCents: number;
  quantity: number;
  thumbnail?: string;
  variantLabel?: string;
}

export interface AbandonedCart {
  id: string;
  storeId: number;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItemDraft[];
  totalAmountCents: number;
  currency: string;
  abandonedAt: string;
  status: AbandonedCartStatus;
  recoveryToken: string;
  reminderCount: number;
  lastReminderSentAt?: string;
  recoveredAt?: string;
  recoveryDiscountCode?: string;
}

export interface AbandonedCartAnalytics {
  totalAbandonedCents: number;
  totalRecoveredCents: number;
  totalCartsCount: number;
  recoveredCartsCount: number;
  recoveryRatePercent: number;
  potentialRevenueCents: number;
}

export interface TrackingPixelsConfig {
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  gaMeasurementId?: string | null; // e.g. G-XXXXXXX
  gtmContainerId?: string | null;  // e.g. GTM-XXXXXXX
  enabled: boolean;
}

export function isValidGaMeasurementId(value: string): boolean {
  return /^G-[A-Za-z0-9]{4,20}$/.test(value.trim());
}

export function isValidGtmContainerId(value: string): boolean {
  return /^GTM-[A-Za-z0-9]{4,20}$/.test(value.trim());
}

export function isValidMetaPixelId(value: string): boolean {
  return /^\d{5,30}$/.test(value.trim());
}

export function isValidTikTokPixelId(value: string): boolean {
  return /^[A-Za-z0-9_-]{5,64}$/.test(value.trim());
}

export function sanitizeTrackingPixelsConfig(input: {
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  gaMeasurementId?: string | null;
  gtmContainerId?: string | null;
  enabled?: boolean;
}): TrackingPixelsConfig {
  const metaPixelId = (input.metaPixelId || "").trim();
  const tiktokPixelId = (input.tiktokPixelId || "").trim();
  const gaMeasurementId = (input.gaMeasurementId || "").trim();
  const gtmContainerId = (input.gtmContainerId || "").trim();

  return {
    metaPixelId: isValidMetaPixelId(metaPixelId) ? metaPixelId : null,
    tiktokPixelId: isValidTikTokPixelId(tiktokPixelId) ? tiktokPixelId : null,
    gaMeasurementId: isValidGaMeasurementId(gaMeasurementId) ? gaMeasurementId : null,
    gtmContainerId: isValidGtmContainerId(gtmContainerId) ? gtmContainerId : null,
    enabled: input.enabled ?? true,
  };
}
