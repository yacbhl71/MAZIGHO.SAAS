export interface SwissCreditorConfig {
  iban: string; // e.g., CH56 3000 0000 0000 0000 0
  creditorName: string;
  creditorStreet: string;
  creditorPostalCode: string;
  creditorCity: string;
  creditorCountry: string; // "CH"
  vatNumber?: string; // e.g. CHE-123.456.789 TVA
  enabled: boolean;
}

export interface SwissInvoiceItem {
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface SwissInvoiceData {
  invoiceNumber: string; // e.g., FAC-2026-0104
  orderId: number;
  invoiceDate: string;
  dueDate: string;
  storeName: string;
  creditor: SwissCreditorConfig;
  customerName: string;
  customerEmail: string;
  customerStreet: string;
  customerPostalCode: string;
  customerCity: string;
  customerCountry: string;
  items: SwissInvoiceItem[];
  subtotalCents: number;
  taxAmountCents: number;
  taxRatePercent: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  currency: "CHF" | "EUR";
  qrReference?: string;
  unstructuredMessage: string;
}

export function isValidSwissIban(iban: string): boolean {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  return /^(CH|LI)\d{19}$/.test(clean);
}

export function formatSwissIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (!clean) return "";
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

/** Formats structured SIX Interbank Clearing Swiss QR-Code string (v2.2 specification) */
export function generateSixQrCodePayload(data: {
  iban: string;
  creditorName: string;
  creditorStreet: string;
  creditorPostalCode: string;
  creditorCity: string;
  creditorCountry: string;
  customerName: string;
  customerStreet: string;
  customerPostalCode: string;
  customerCity: string;
  customerCountry: string;
  amountCents: number;
  currency: "CHF" | "EUR";
  unstructuredMessage: string;
}): string {
  const cleanIban = data.iban.replace(/\s+/g, "").toUpperCase();
  const amountStr = (data.amountCents / 100).toFixed(2);

  // SIX QR-Code specification line format
  const lines = [
    "SPC",                   // QRType
    "0200",                  // Version
    "1",                     // Coding Type (1 = UTF-8)
    cleanIban,               // IBAN
    "K",                     // Creditor address type (K = combined)
    data.creditorName,       // Name
    data.creditorStreet,     // Street / House No
    `${data.creditorPostalCode} ${data.creditorCity}`, // PostalCode + City
    "",                      // SubDivision
    "",                      // Reserved
    data.creditorCountry || "CH", // Country
    "",                      // Ultimate Creditor Address Type
    "", "", "", "", "", "",  // Ultimate Creditor fields
    amountStr,               // Amount
    data.currency,           // Currency (CHF or EUR)
    "K",                     // Debtor address type
    data.customerName || "Client", // Debtor Name
    data.customerStreet || "-",  // Debtor Street
    `${data.customerPostalCode || "-"} ${data.customerCity || "-"}`, // Debtor PostalCode + City
    "",                      // Debtor SubDivision
    "",                      // Debtor Reserved
    data.customerCountry || "CH", // Debtor Country
    "NON",                   // Reference Type (NON = No structured reference)
    "",                      // Reference
    data.unstructuredMessage,// Unstructured Message
    "EPD",                   // End Payment Data
  ];

  return lines.join("\n");
}
