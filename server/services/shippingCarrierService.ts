import {
  CarrierCode,
  ShippingLabel,
  generateLabelSchema,
} from "../../shared/shippingCarrier";
import { z } from "zod";

export function generateTrackingNumber(carrier: CarrierCode): string {
  const random8 = Math.floor(10000000 + Math.random() * 90000000);
  const random6 = Math.floor(100000 + Math.random() * 900000);

  switch (carrier) {
    case "SWISS_POST":
      // Standard Swiss Post format: 99.00.123456.12345678
      return `99.00.${random6}.${random8}`;
    case "DHL_EXPRESS":
      // DHL format: JJD00030000001234567
      return `JJD0003${random6}${random8}`;
    case "COLISSIMO":
      // Colissimo format: 6A12345678901
      return `6A${random8}${Math.floor(10 + Math.random() * 90)}`;
    case "YALIDINE":
      // Yalidine Algeria format: YAL-2026-9900123
      return `YAL-2026-${random6}`;
    case "FEDEX":
      return `77${random8}${random6}`;
  }
}

export function getCarrierTrackingUrl(carrier: CarrierCode, trackingNumber: string): string {
  switch (carrier) {
    case "SWISS_POST":
      return `https://www.post.ch/swisspost-tracking?formattedParcelCodes=${encodeURIComponent(trackingNumber)}`;
    case "DHL_EXPRESS":
      return `https://www.dhl.com/global-en/home/tracking.html?submit=1&tracking-id=${encodeURIComponent(trackingNumber)}`;
    case "COLISSIMO":
      return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
    case "YALIDINE":
      return `https://yalidine.app/tracking/${encodeURIComponent(trackingNumber)}`;
    case "FEDEX":
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  }
}

export function renderPrintableLabelHtml(label: ShippingLabel): string {
  const carrierLogoName =
    label.carrier === "SWISS_POST"
      ? "SWISS POST 🇨🇭 / LA POSTE"
      : label.carrier === "DHL_EXPRESS"
      ? "DHL EXPRESS 🟡🔴"
      : label.carrier === "COLISSIMO"
      ? "COLISSIMO 🇫🇷"
      : label.carrier === "YALIDINE"
      ? "YALIDINE EXPRESS 🇩🇿"
      : "FEDEX EXPRESS 🟣🟠";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Étiquette d'Expédition - ${label.trackingNumber}</title>
  <style>
    @page { size: 100mm 150mm; margin: 0; }
    body {
      font-family: Arial, sans-serif;
      width: 100mm;
      height: 150mm;
      margin: 0 auto;
      padding: 6mm;
      box-sizing: border-box;
      background: white;
      color: black;
    }
    .label-box {
      border: 3px solid black;
      height: 100%;
      padding: 4mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      border-bottom: 2px solid black;
      padding-bottom: 2mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .carrier-title {
      font-weight: bold;
      font-size: 14pt;
    }
    .weight {
      font-size: 11pt;
      font-weight: bold;
    }
    .address-section {
      margin-top: 3mm;
      font-size: 10pt;
    }
    .sender {
      font-size: 8pt;
      color: #333;
      margin-bottom: 4mm;
    }
    .recipient {
      border: 2px solid black;
      padding: 3mm;
      background: #fafafa;
    }
    .recipient-title {
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 1mm;
    }
    .recipient-name {
      font-size: 13pt;
      font-weight: bold;
    }
    .recipient-street {
      font-size: 11pt;
    }
    .recipient-city {
      font-size: 12pt;
      font-weight: bold;
    }
    .barcode-container {
      border-top: 2px dashed black;
      padding-top: 3mm;
      text-align: center;
    }
    .barcode-visual {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      letter-spacing: 3px;
      font-size: 16pt;
      background: #000;
      color: #fff;
      padding: 6px;
      display: block;
      margin: 2mm 0;
    }
    .tracking-str {
      font-size: 10pt;
      font-weight: bold;
    }
  </style>
</head>
<body onload="window.print()">
  <div class="label-box">
    <div class="header">
      <div class="carrier-title">${carrierLogoName}</div>
      <div class="weight">${label.weightKg.toFixed(2)} KG</div>
    </div>

    <div class="address-section">
      <div class="sender">
        <strong>EXPÉDITEUR:</strong> ${label.senderAddress.companyName}, ${label.senderAddress.street}, ${label.senderAddress.postalCode} ${label.senderAddress.city} (${label.senderAddress.country})
      </div>

      <div class="recipient">
        <div class="recipient-title">DESTINATAIRE:</div>
        <div class="recipient-name">${label.recipientAddress.name}</div>
        <div class="recipient-street">${label.recipientAddress.street}</div>
        <div class="recipient-city">${label.recipientAddress.postalCode} ${label.recipientAddress.city}</div>
        <div style="font-weight: bold; margin-top: 1mm;">${label.recipientAddress.country}</div>
      </div>
    </div>

    <div class="barcode-container">
      <div>CMD #${label.orderId}</div>
      <div class="barcode-visual">|||| ||| ||||| |||| |||||</div>
      <div class="tracking-str">${label.trackingNumber}</div>
    </div>
  </div>
</body>
</html>`;
}
