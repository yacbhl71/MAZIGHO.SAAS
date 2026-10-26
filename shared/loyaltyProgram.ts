export interface LoyaltyProgramConfig {
  storeId: number;
  pointsPerSpentCents: number; // e.g., 1 point per 100 cents (1 CHF = 1 point)
  centsPerRedeemedPoint: number; // e.g., 5 cents per point (100 points = 5.00 CHF)
  minRedeemPoints: number; // e.g., 50 points minimum
  referralRewardCents: number; // e.g., 1000 cents (10.00 CHF) for both referrer & referee
  enabled: boolean;
}

export interface CustomerLoyaltyAccount {
  userId: number;
  storeId: number;
  pointsBalance: number;
  totalEarnedPoints: number;
  referralCode: string;
  referralCount: number;
  totalReferralEarningsCents: number;
}

export interface LoyaltyRedemptionResult {
  success: boolean;
  promoCode: string;
  discountCents: number;
  remainingPoints: number;
}

export function generateReferralCode(userEmail: string): string {
  const prefix = userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix || "CLUB"}-${random}`;
}
