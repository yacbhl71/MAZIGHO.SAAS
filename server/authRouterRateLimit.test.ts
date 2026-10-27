import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  activateAccountFromInvitation: vi.fn(),
  createPasswordUser: vi.fn(),
  getFirstActiveOwnerStoreForUser: vi.fn(),
  getUserByEmail: vi.fn(async () => null),
  markUserSignedIn: vi.fn(),
  requestPasswordResetToken: vi.fn(),
  resetPasswordFromToken: vi.fn(),
  updatePasswordUser: vi.fn(),
}));

vi.mock("./localAuth", () => ({
  hashPassword: vi.fn(async () => "scrypt-v1$test"),
  verifyPassword: vi.fn(async () => false),
}));

vi.mock("./transactionalEmail", () => ({
  isTransactionalEmailConfigured: vi.fn(() => false),
  sendPasswordResetEmail: vi.fn(),
}));

import { authRouter } from "./authRouter";
import { resetAuthRateLimitForTests } from "./authRateLimit";
import * as db from "./db";

function caller() {
  return authRouter.createCaller({
    user: null,
    store: null,
    req: { ip: "203.0.113.55", headers: {}, socket: { remoteAddress: "203.0.113.55" } },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as any);
}

describe("auth router rate-limit integration", () => {
  beforeEach(() => {
    resetAuthRateLimitForTests();
    vi.clearAllMocks();
  });

  it("returns a uniform 429 only after the configured failed-login allowance", async () => {
    const client = caller();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(client.login({ email: "owner@example.test", password: "incorrect-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }

    await expect(client.login({ email: "owner@example.test", password: "incorrect-password" })).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: expect.stringContaining("Trop de tentatives"),
    });
  });

  it("ne retourne jamais un jeton de récupération au navigateur", async () => {
    vi.mocked(db.requestPasswordResetToken).mockResolvedValue({
      userId: 12,
      name: "Compte test",
      email: "owner@example.test",
      reset: { id: 4, token: "one-time-token-that-must-stay-server-side" },
    } as any);

    const result = await caller().requestPasswordReset({ email: "owner@example.test" });

    expect(result).toEqual({ accepted: true, emailAvailable: false });
    expect(result).not.toHaveProperty("resetUrl");
    expect(result).not.toHaveProperty("token");
  });

  it("refuse une connexion Google sans jeton Firebase vérifiable", async () => {
    await expect(caller().firebaseLogin({
      uid: "operator-yacbhl71",
      email: "yacbhl71@gmail.com",
      displayName: "Identité fournie par le navigateur",
    } as any)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
