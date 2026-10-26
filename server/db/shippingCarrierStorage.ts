import {
  CarrierCode,
  ShippingLabel,
  TrackingEvent,
  TrackingEventType,
  generateLabelSchema,
  updateTrackingStatusSchema,
} from "../../shared/shippingCarrier";
import {
  generateTrackingNumber,
  getCarrierTrackingUrl,
} from "../services/shippingCarrierService";
import { z } from "zod";

const storeLabelsMap = new Map<number, ShippingLabel[]>();

export interface StoreSenderAddress {
  companyName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

const defaultSenderAddresses = new Map<number, StoreSenderAddress>();

export async function getStoreSenderAddress(storeId: number): Promise<StoreSenderAddress> {
  return (
    defaultSenderAddresses.get(storeId) || {
      companyName: "Boutique Officielle",
      street: "Rue du Commerce 12",
      postalCode: "1003",
      city: "Lausanne",
      country: "CH",
    }
  );
}

export async function setStoreSenderAddress(
  storeId: number,
  address: StoreSenderAddress
): Promise<StoreSenderAddress> {
  defaultSenderAddresses.set(storeId, address);
  return address;
}

export async function createShippingLabelForOrder(
  storeId: number,
  input: z.infer<typeof generateLabelSchema>
): Promise<ShippingLabel> {
  const storeLabels = storeLabelsMap.get(storeId) || [];
  const senderAddress = await getStoreSenderAddress(storeId);

  const trackingNumber = generateTrackingNumber(input.carrier);
  const trackingUrl = getCarrierTrackingUrl(input.carrier, trackingNumber);

  const initialEvent: TrackingEvent = {
    status: "LABEL_CREATED",
    description: "Étiquette d'expédition générée par le commerçant.",
    location: `${senderAddress.city}, ${senderAddress.country}`,
    timestamp: new Date().toISOString(),
  };

  const label: ShippingLabel = {
    id: `LBL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    orderId: input.orderId,
    storeId,
    carrier: input.carrier,
    trackingNumber,
    trackingUrl,
    senderAddress,
    recipientAddress: {
      name: input.recipientName,
      street: input.recipientStreet,
      postalCode: input.recipientPostalCode,
      city: input.recipientCity,
      country: input.recipientCountry,
    },
    weightKg: input.weightKg,
    barcodeSvgOrText: trackingNumber,
    createdAt: new Date().toISOString(),
    events: [initialEvent],
  };

  storeLabels.unshift(label);
  storeLabelsMap.set(storeId, storeLabels);

  return label;
}

export async function getStoreShippingLabels(
  storeId: number
): Promise<ShippingLabel[]> {
  return storeLabelsMap.get(storeId) || [];
}

export async function getShippingLabelByTracking(
  trackingNumber: string
): Promise<ShippingLabel | null> {
  for (const labels of Array.from(storeLabelsMap.values())) {
    const found = labels.find(
      (l: ShippingLabel) => l.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
    );
    if (found) return found;
  }
  return null;
}

export async function getShippingLabelByOrder(
  storeId: number,
  orderId: string
): Promise<ShippingLabel | null> {
  const storeLabels = storeLabelsMap.get(storeId) || [];
  return storeLabels.find((l: ShippingLabel) => l.orderId === orderId) || null;
}

export async function updateLabelTrackingStatus(
  input: z.infer<typeof updateTrackingStatusSchema>
): Promise<ShippingLabel> {
  let targetLabel: ShippingLabel | null = null;
  let targetStoreId: number | null = null;

  for (const [sId, labels] of Array.from(storeLabelsMap.entries())) {
    const idx = labels.findIndex(
      (l: ShippingLabel) => l.trackingNumber.toLowerCase() === input.trackingNumber.toLowerCase()
    );
    if (idx !== -1) {
      targetLabel = labels[idx];
      targetStoreId = sId;
      break;
    }
  }

  if (!targetLabel || targetStoreId === null) {
    throw new Error("Étiquette / Numéro de suivi introuvable.");
  }

  const newEvent: TrackingEvent = {
    status: input.status,
    description: input.description,
    location: input.location,
    timestamp: new Date().toISOString(),
  };

  targetLabel.events.unshift(newEvent);

  const labels = storeLabelsMap.get(targetStoreId)!;
  const index = labels.findIndex((l) => l.id === targetLabel!.id);
  labels[index] = targetLabel;
  storeLabelsMap.set(targetStoreId, labels);

  return targetLabel;
}
