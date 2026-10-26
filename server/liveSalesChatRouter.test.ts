import { describe, it, expect } from "vitest";
import {
  getLiveSalesChatConfig,
  saveLiveSalesChatConfig,
} from "./db/liveSalesChatStorage";

describe("Live Sales Chat WhatsApp Engine", () => {
  const storeId = 88;

  it("should return default live sales chat config", async () => {
    const config = await getLiveSalesChatConfig(storeId);
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.whatsappNumber).toBeDefined();
  });

  it("should update live sales chat WhatsApp number and position", async () => {
    const updated = await saveLiveSalesChatConfig(storeId, {
      enabled: true,
      whatsappNumber: "+41789998877",
      welcomeMessage: "Besoin d'aide ?",
      position: "bottom-left",
      showMessenger: false,
    });

    expect(updated.whatsappNumber).toBe("+41789998877");
    expect(updated.position).toBe("bottom-left");

    const refetched = await getLiveSalesChatConfig(storeId);
    expect(refetched.whatsappNumber).toBe("+41789998877");
  });
});
