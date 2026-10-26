import { describe, expect, it } from "vitest";
import { computeStoreHealthAudit } from "./storeHealthAudit";

describe("storeHealthAudit service", () => {
  it("calculates health score, pillars and actionable recommendations for a store", async () => {
    // Calling with demo / test store ID 1
    const audit = await computeStoreHealthAudit(1, "Boutique Démo");

    expect(audit).toBeDefined();
    expect(audit.storeId).toBe(1);
    expect(typeof audit.overallScore).toBe("number");
    expect(audit.overallScore).toBeGreaterThanOrEqual(0);
    expect(audit.overallScore).toBeLessThanOrEqual(100);

    // Pillars check
    expect(audit.pillars).toHaveLength(5);
    const pillarIds = audit.pillars.map(p => p.id);
    expect(pillarIds).toEqual(["catalogue", "theme", "delivery", "payments", "conversion"]);

    // Total max scores sum to 100
    const totalMax = audit.pillars.reduce((sum, p) => sum + p.maxScore, 0);
    expect(totalMax).toBe(100);

    // Recommendations check
    expect(Array.isArray(audit.recommendations)).toBe(true);
    for (const rec of audit.recommendations) {
      expect(rec.title).toBeTruthy();
      expect(rec.actionModule).toBeTruthy();
      expect(rec.actionLabel).toBeTruthy();
      expect(rec.impact).toBeTruthy();
      expect(["critical", "high", "medium"]).toContain(rec.priority);
    }

    // Grade check
    expect(["A+", "A", "B", "C", "D"]).toContain(audit.grade);
    expect(audit.gradeLabel).toBeTruthy();
    expect(audit.summary).toContain(String(audit.overallScore));
  });

  it("assigns appropriate grades based on score range", async () => {
    const audit = await computeStoreHealthAudit(999999, "Boutique Inexistante");
    // With 0 products, missing theme, delivery and payments, score should be low
    expect(audit.overallScore).toBeLessThan(50);
    expect(audit.grade).toBe("D");
    expect(audit.recommendations.some(r => r.priority === "critical")).toBe(true);
  });
});
