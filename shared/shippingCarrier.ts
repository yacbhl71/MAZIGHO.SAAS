import { z } from "zod";

export type CarrierCode =
  | "SWISS_POST"
  | "DHL_EXPRESS"
  | "COLISSIMO"
  | "YALIDINE"
  | "FEDEX";

export type TrackingEventType =
  | "LABEL_CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "EXCEPTION";

export interface TrackingEvent {
  status: TrackingEventType;
  description: string;
  location?: string;
  timestamp: string;
}

export interface ShippingLabel {
  id: string;
  orderId: string;
  storeId: number;
  carrier: CarrierCode;
  trackingNumber: string;
  trackingUrl: string;
  senderAddress: {
    companyName: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  recipientAddress: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  weightKg: number;
  barcodeSvgOrText: string;
  createdAt: string;
  events: TrackingEvent[];
}

export const generateLabelSchema = z.object({
  orderId: z.string().min(1, "ID de commande requis"),
  carrier: z.enum([
    "SWISS_POST",
    "DHL_EXPRESS",
    "COLISSIMO",
    "YALIDINE",
    "FEDEX",
  ]),
  recipientName: z.string().min(1, "Nom du destinataire requis"),
  recipientStreet: z.string().min(1, "Adresse requise"),
  recipientPostalCode: z.string().min(1, "NPA/Code Postal requis"),
  recipientCity: z.string().min(1, "Ville requise"),
  recipientCountry: z.string().min(2, "Pays requis").default("CH"),
  weightKg: z.number().positive().default(0.5),
});

export const updateTrackingStatusSchema = z.object({
  trackingNumber: z.string().min(1),
  status: z.enum([
    "LABEL_CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "EXCEPTION",
  ]),
  description: z.string().min(1),
  location: z.string().optional(),
});
