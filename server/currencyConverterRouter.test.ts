import { describe, it, expect } from "vitest";
import {
  getCurrencyConverterConfig,
  saveCurrencyConverterConfig,
} from "./db/currencyConverterStorage";
import { convertCurrency } from "../shared/currencyConverter";

describe("Multi-Currency Converter Engine", () => {
  const storeId = 55;

  it("should convert CHF amount to EUR and DZD correctly", () => {
    const chfAmountCents = 10000; // 100 CHF

    const inEur = convertCurrency(chfAmountCents, "EUR");
    expect(inEur.amountCents).toBeGreaterThan(10000);
    expect(inEur.formatted).toContain("€");

    const inDzd = convertCurrency(chfAmountCents, "DZD");
    expect(inDzd.amountCents).toBe(1525000);
    expect(inDzd.formatted).toContain("DZD");
  });

  it("should return and update currency converter config", async () => {
    const config = await getCurrencyConverterConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.supportedCurrencies).toContain("CHF");

    const updated = await saveCurrencyConverterConfig(storeId, {
      enabled: true,
      baseCurrency: "CHF",
      supportedCurrencies: ["CHF", "EUR", "USD", "DZD", "GBP"],
    });

    expect(updated.supportedCurrencies).toContain("GBP");
  });
});
