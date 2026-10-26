import {
  CurrencyConverterConfig,
  SupportedCurrency,
  defaultExchangeRates,
  currencyConverterConfigSchema,
} from "../../shared/currencyConverter";
import { z } from "zod";

const storeCurrencyConfigs = new Map<number, CurrencyConverterConfig>();

export async function getCurrencyConverterConfig(
  storeId: number
): Promise<CurrencyConverterConfig> {
  const existing = storeCurrencyConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: CurrencyConverterConfig = {
    storeId,
    enabled: true,
    baseCurrency: "CHF",
    supportedCurrencies: ["CHF", "EUR", "USD", "DZD"],
    rates: defaultExchangeRates,
  };

  storeCurrencyConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveCurrencyConverterConfig(
  storeId: number,
  input: z.infer<typeof currencyConverterConfigSchema>
): Promise<CurrencyConverterConfig> {
  const current = await getCurrencyConverterConfig(storeId);

  const mergedRates = {
    ...current.rates,
    ...(input.rates || {}),
  } as Record<SupportedCurrency, number>;

  const updated: CurrencyConverterConfig = {
    ...current,
    enabled: input.enabled,
    baseCurrency: input.baseCurrency as SupportedCurrency,
    supportedCurrencies: input.supportedCurrencies as SupportedCurrency[],
    rates: mergedRates,
    storeId,
  };

  storeCurrencyConfigs.set(storeId, updated);
  return updated;
}
