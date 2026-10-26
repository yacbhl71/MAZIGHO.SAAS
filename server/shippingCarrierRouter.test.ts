import { describe, it, expect } from "vitest";
import {
  generateTrackingNumber,
  getCarrierTrackingUrl,
  renderPrintableLabelHtml,
} from "./services/shippingCarrierService";
import {
  createShippingLabelForOrder,
  getStoreShippingLabels,
  getShippingLabelByTracking,
  updateLabelTrackingStatus,
} from "./db/shippingCarrierStorage";

describe("Shipping Carriers & Labels System", () => {
  const storeId = 555;

  it("should generate proper carrier-specific tracking numbers and URLs", () => {
    const swissPostTrack = generateTrackingNumber("SWISS_POST");
    expect(swissPostTrack).toMatch(/^99\.00\.\d{6}\.\d{8}$/);
    expect(getCarrierTrackingUrl("SWISS_POST", swissPostTrack)).toContain("swisspost-tracking");

    const dhlTrack = generateTrackingNumber("DHL_EXPRESS");
    expect(dhlTrack).toMatch(/^JJD0003/);
    expect(getCarrierTrackingUrl("DHL_EXPRESS", dhlTrack)).toContain("dhl.com");

    const yalidineTrack = generateTrackingNumber("YALIDINE");
    expect(yalidineTrack).toMatch(/^YAL-2026-/);
    expect(getCarrierTrackingUrl("YALIDINE", yalidineTrack)).toContain("yalidine.app");
  });

  it("should create shipping label for an order", async () => {
    const label = await createShippingLabelForOrder(storeId, {
      orderId: "CMD-2048",
      carrier: "SWISS_POST",
      recipientName: "Claire Morel",
      recipientStreet: "Rue Centrale 5",
      recipientPostalCode: "1003",
      recipientCity: "Lausanne",
      recipientCountry: "CH",
      weightKg: 1.2,
    });

    expect(label).toBeDefined();
    expect(label.trackingNumber).toBeDefined();
    expect(label.events.length).toBe(1);
    expect(label.events[0].status).toBe("LABEL_CREATED");
  });

  it("should retrieve created label and render HTML printable label", async () => {
    const labels = await getStoreShippingLabels(storeId);
    expect(labels.length).toBeGreaterThan(0);

    const firstLabel = labels[0];
    const html = renderPrintableLabelHtml(firstLabel);
    expect(html).toContain("SWISS POST");
    expect(html).toContain("Claire Morel");
    expect(html).toContain("1.20 KG");
  });

  it("should update tracking status event", async () => {
    const labels = await getStoreShippingLabels(storeId);
    const trackingNum = labels[0].trackingNumber;

    const updated = await updateLabelTrackingStatus({
      trackingNumber: trackingNum,
      status: "IN_TRANSIT",
      description: "Colis en cours de tri au hub de Berne",
      location: "Berne Hub",
    });

    expect(updated.events.length).toBe(2);
    expect(updated.events[0].status).toBe("IN_TRANSIT");
    expect(updated.events[0].description).toContain("Berne");
  });
});
