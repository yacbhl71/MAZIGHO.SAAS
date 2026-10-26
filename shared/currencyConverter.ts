import { z } from "zod";

export type SupportedCurrency = "CHF" | "EUR" | "USD" | "DZD" | "GBP" | "CAD";

export interface CurrencyConverterConfig {
  storeId: number;
  enabled: boolean;
  baseCurrency: SupportedCurrency;
  supportedCurrencies: SupportedCurrency[];
  rates: Record<SupportedCurrency, number>; // Base CHF -> 1.0
}

export const defaultExchangeRates: Record<SupportedCurrency, number> = {
  CHF: 1.0,
  EUR: 1.05,
  USD: 1.12,
  DZD: 152.5,
  GBP: 0.88,
  CAD: 1.52,
};

export const currencyConverterConfigSchema = z.object({
  enabled: z.boolean().default(true),
  baseCurrency: z.enum(["CHF", "EUR", "USD", "DZD", "GBP", "CAD"]).default("CHF"),
  supportedCurrencies: z
    .array(z.enum(["CHF", "EUR", "USD", "DZD", "GBP", "CAD"]))
    .default(["CHF", "EUR", "USD", "DZD"]),
  rates: z.record(z.string(), z.number()).optional(),
});

export function convertCurrency(
  amountCents: number,
  targetCurrency: SupportedCurrency,
  rates: Record<SupportedCurrency, number> = defaultExchangeRates
): { amountCents: number; formatted: string } {
  const rate = rates[targetCurrency] || 1.0;
  const convertedCents = Math.round(amountCents * rate);
  const amountMajor = convertedCents / 100;

  let formatted = `${amountMajor.toFixed(2)} ${targetCurrency}`;
  if (targetCurrency === "CHF") formatted = `${amountMajor.toFixed(2)} CHF`;
  else if (targetCurrency === "EUR") formatted = `${amountMajor.toFixed(2)} €`;
  else if (targetCurrency === "USD") formatted = `$${amountMajor.toFixed(2)}`;
  else if (targetCurrency === "DZD") formatted = `${Math.round(amountMajor)} DZD`;

  return { amountCents: convertedCents, formatted };
}
