import { z } from "zod";

export type ReturnReason =
  | "WRONG_SIZE"
  | "DEFECTIVE"
  | "NOT_AS_PICTURED"
  | "CHANGED_MIND"
  | "OTHER";

export type ReturnResolution = "REFUND" | "EXCHANGE" | "STORE_CREDIT";

export type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PACKAGE_RECEIVED"
  | "COMPLETED";

export interface ReturnItem {
  productId: number;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  priceCents: number;
}

export interface ReturnRequest {
  id: string;
  storeId: number;
  userId: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: ReturnItem[];
  reason: ReturnReason;
  notes?: string;
  resolution: ReturnResolution;
  status: ReturnStatus;
  adminNote?: string;
  returnLabelUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const createReturnRequestSchema = z.object({
  orderId: z.string().min(1, "Le numéro de commande est requis"),
  customerName: z.string().min(1, "Le nom est requis"),
  customerEmail: z.string().email("Adresse email invalide"),
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        productTitle: z.string(),
        variantTitle: z.string().optional(),
        quantity: z.number().int().min(1),
        priceCents: z.number().int().min(0),
      })
    )
    .min(1, "Veuillez sélectionner au moins un article à retourner"),
  reason: z.enum([
    "WRONG_SIZE",
    "DEFECTIVE",
    "NOT_AS_PICTURED",
    "CHANGED_MIND",
    "OTHER",
  ]),
  notes: z.string().optional(),
  resolution: z.enum(["REFUND", "EXCHANGE", "STORE_CREDIT"]),
});

export const updateReturnStatusSchema = z.object({
  returnId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "PACKAGE_RECEIVED",
    "COMPLETED",
  ]),
  adminNote: z.string().optional(),
  returnLabelUrl: z.string().optional(),
});
