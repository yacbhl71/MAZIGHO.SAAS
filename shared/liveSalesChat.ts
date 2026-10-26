import { z } from "zod";

export interface LiveSalesChatConfig {
  storeId: number;
  enabled: boolean;
  whatsappNumber: string; // e.g. "+41791234567"
  welcomeMessage: string;
  position: "bottom-right" | "bottom-left";
  showMessenger: boolean;
  messengerUrl?: string;
}

export const liveSalesChatConfigSchema = z.object({
  enabled: z.boolean().default(true),
  whatsappNumber: z.string().min(5, "Numéro WhatsApp requis"),
  welcomeMessage: z
    .string()
    .default("Bonjour ! Avez-vous une question sur nos produits ? Je vous réponds directement."),
  position: z.enum(["bottom-right", "bottom-left"]).default("bottom-right"),
  showMessenger: z.boolean().default(false),
  messengerUrl: z.string().optional(),
});
