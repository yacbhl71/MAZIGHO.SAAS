import { describe, it, expect } from "vitest";
import {
  createReturnRequest,
  getCustomerReturnRequests,
  getStoreReturnRequests,
  updateReturnStatus,
} from "./db/returnPortalStorage";

describe("Return Portal System", () => {
  const storeId = 777;
  const userId = 666;

  it("should create a return request successfully", async () => {
    const req = await createReturnRequest(storeId, userId, {
      orderId: "CMD-99001",
      customerName: "Jean Dupont",
      customerEmail: "jean@example.com",
      items: [
        {
          productId: 12,
          productTitle: "Chaussures Sport Pro",
          quantity: 1,
          priceCents: 12900,
        },
      ],
      reason: "WRONG_SIZE",
      resolution: "EXCHANGE",
      notes: "Besoin de la taille 43 au lieu de 42",
    });

    expect(req).toBeDefined();
    expect(req.id).toMatch(/^RET-/);
    expect(req.status).toBe("PENDING");
    expect(req.reason).toBe("WRONG_SIZE");
  });

  it("should fetch return requests for a specific customer", async () => {
    const list = await getCustomerReturnRequests(storeId, userId);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].userId).toBe(userId);
  });

  it("should update return status and admin notes", async () => {
    const list = await getStoreReturnRequests(storeId);
    expect(list.length).toBeGreaterThan(0);
    const firstReq = list[0];

    const updated = await updateReturnStatus(storeId, {
      returnId: firstReq.id,
      status: "APPROVED",
      adminNote: "Etiquette de retour envoyée par email.",
      returnLabelUrl: "https://example.com/labels/label_123.pdf",
    });

    expect(updated.status).toBe("APPROVED");
    expect(updated.adminNote).toContain("Etiquette");
    expect(updated.returnLabelUrl).toBe("https://example.com/labels/label_123.pdf");
  });
});
