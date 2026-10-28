import { z } from "zod";

export interface SpinToWinReward {
  id: string;
  label: string;
  code: string;
  discountPercent: number;
  probabilityWeight: number; // e.g. 1 to 10
}

export interface SpinToWinSettings {
  enabled: boolean;
  title: string;
  description: string;
  rewards: SpinToWinReward[];
}

export const defaultSpinToWinRewards: SpinToWinReward[] = [
  { id: "r1", label: "-10% sur tout le panier", code: "CHANCE10", discountPercent: 10, probabilityWeight: 4 },
  { id: "r2", label: "Livraison Offerte", code: "FREESHIP", discountPercent: 0, probabilityWeight: 3 },
  { id: "r3", label: "-15% de bienvenue", code: "SUPER15", discountPercent: 15, probabilityWeight: 2 },
  { id: "r4", label: "-5% immédiats", code: "CADEAU5", discountPercent: 5, probabilityWeight: 5 },
];

export const defaultSpinToWinSettings: SpinToWinSettings = {
  enabled: true,
  title: "Tournez la Roue Privilège !",
  description: "Tentez votre chance pour remporter un code promo exclusif valable immédiatement.",
  rewards: defaultSpinToWinRewards,
};

export const spinToWinRewardSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Libellé requis"),
  code: z.string().min(1, "Code promo requis"),
  discountPercent: z.number().min(0).max(100),
  probabilityWeight: z.number().min(1).max(100),
});

export const spinToWinSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().min(1, "Titre requis"),
  description: z.string().default(""),
  rewards: z.array(spinToWinRewardSchema).min(2, "Au moins 2 récompenses requises"),
});
