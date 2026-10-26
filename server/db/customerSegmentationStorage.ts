import {
  CustomerSegmentsConfig,
  SegmentedCustomer,
  SegmentTag,
  customerSegmentationConfigSchema,
} from "../../shared/customerSegmentation";
import { z } from "zod";

const storeSegmentationConfigs = new Map<number, CustomerSegmentsConfig>();
const storeCustomersMap = new Map<number, SegmentedCustomer[]>();

export async function getSegmentationConfig(storeId: number): Promise<CustomerSegmentsConfig> {
  const existing = storeSegmentationConfigs.get(storeId);
  if (existing) return existing;

  const defaultConfig: CustomerSegmentsConfig = {
    storeId,
    enabled: true,
    vipThresholdCents: 50000, // 500 CHF
    highAovThresholdCents: 15000, // 150 CHF
  };

  storeSegmentationConfigs.set(storeId, defaultConfig);
  return defaultConfig;
}

export async function saveSegmentationConfig(
  storeId: number,
  input: z.infer<typeof customerSegmentationConfigSchema>
): Promise<CustomerSegmentsConfig> {
  const current = await getSegmentationConfig(storeId);
  const updated: CustomerSegmentsConfig = {
    ...current,
    ...input,
    storeId,
  };

  storeSegmentationConfigs.set(storeId, updated);
  return updated;
}

export async function getStoreCustomerSegments(storeId: number): Promise<{
  config: CustomerSegmentsConfig;
  customers: SegmentedCustomer[];
}> {
  const config = await getSegmentationConfig(storeId);

  let customers = storeCustomersMap.get(storeId);
  if (!customers) {
    // Generate sample/initial data for demonstration and testing
    const now = new Date();
    const d30 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const d90 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90).toISOString();

    customers = [
      {
        userId: 101,
        email: "sophie.martin@example.ch",
        name: "Sophie Martin",
        totalSpentCents: 75000, // 750 CHF -> VIP
        ordersCount: 4,
        lastOrderDate: d30,
        tags: ["VIP", "RECURRING", "HIGH_AOV"],
      },
      {
        userId: 102,
        email: "marc.berger@example.ch",
        name: "Marc Berger",
        totalSpentCents: 22000, // 220 CHF
        ordersCount: 2,
        lastOrderDate: d90,
        tags: ["RECURRING", "INACTIVE_60D"],
      },
      {
        userId: 103,
        email: "elena.rossi@example.ch",
        name: "Elena Rossi",
        totalSpentCents: 18000, // 180 CHF
        ordersCount: 1,
        lastOrderDate: d30,
        tags: ["NEW_CUSTOMER", "HIGH_AOV"],
      },
    ];

    storeCustomersMap.set(storeId, customers);
  }

  // Dynamically evaluate tags based on current thresholds
  const evaluated = customers.map((c) => {
    const tags: SegmentTag[] = [];

    if (c.totalSpentCents >= config.vipThresholdCents) {
      tags.push("VIP");
    }
    if (c.ordersCount >= 2) {
      tags.push("RECURRING");
    }
    if (c.totalSpentCents / Math.max(1, c.ordersCount) >= config.highAovThresholdCents) {
      tags.push("HIGH_AOV");
    }

    const lastOrderTime = new Date(c.lastOrderDate).getTime();
    const daysSinceLast = (Date.now() - lastOrderTime) / (1000 * 60 * 60 * 24);
    if (daysSinceLast > 60) {
      tags.push("INACTIVE_60D");
    } else if (c.ordersCount === 1) {
      tags.push("NEW_CUSTOMER");
    }

    return { ...c, tags };
  });

  return { config, customers: evaluated };
}
