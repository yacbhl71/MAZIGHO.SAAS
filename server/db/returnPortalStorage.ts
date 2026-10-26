import {
  ReturnRequest,
  createReturnRequestSchema,
  updateReturnStatusSchema,
} from "../../shared/returnPortal";
import { z } from "zod";

// Store isolated return requests in memory with persistence structure
const storeReturnsMap = new Map<number, ReturnRequest[]>();

export async function createReturnRequest(
  storeId: number,
  userId: number,
  input: z.infer<typeof createReturnRequestSchema>
): Promise<ReturnRequest> {
  const storeReturns = storeReturnsMap.get(storeId) || [];

  const newReturn: ReturnRequest = {
    id: `RET-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId,
    userId,
    orderId: input.orderId,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    items: input.items,
    reason: input.reason,
    notes: input.notes,
    resolution: input.resolution,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeReturns.unshift(newReturn);
  storeReturnsMap.set(storeId, storeReturns);

  return newReturn;
}

export async function getCustomerReturnRequests(
  storeId: number,
  userId: number
): Promise<ReturnRequest[]> {
  const storeReturns = storeReturnsMap.get(storeId) || [];
  return storeReturns.filter((r) => r.userId === userId);
}

export async function getStoreReturnRequests(
  storeId: number
): Promise<ReturnRequest[]> {
  return storeReturnsMap.get(storeId) || [];
}

export async function updateReturnStatus(
  storeId: number,
  input: z.infer<typeof updateReturnStatusSchema>
): Promise<ReturnRequest> {
  const storeReturns = storeReturnsMap.get(storeId) || [];
  const returnIndex = storeReturns.findIndex((r) => r.id === input.returnId);

  if (returnIndex === -1) {
    throw new Error("Demande de retour introuvable.");
  }

  const existing = storeReturns[returnIndex];
  const updated: ReturnRequest = {
    ...existing,
    status: input.status,
    adminNote: input.adminNote ?? existing.adminNote,
    returnLabelUrl: input.returnLabelUrl ?? existing.returnLabelUrl,
    updatedAt: new Date().toISOString(),
  };

  storeReturns[returnIndex] = updated;
  storeReturnsMap.set(storeId, storeReturns);

  return updated;
}
