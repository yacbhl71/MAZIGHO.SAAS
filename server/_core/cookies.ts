import type { CookieOptions, Request } from "express";

function getMazighoSessionDomain(hostname: string | undefined) {
  const normalized = hostname?.trim().toLowerCase().replace(/:\d+$/, "") || "";
  // IMPORTANT:
  // - mazigho.com is an independent website not part of this platform.
  // - Subdomains like studio.mazigho.com and pro.mazigho.com must remain host-only cookies
  //   (domain: undefined) so that they are strictly retained on the subdomain without
  //   cross-domain restrictions in private/incognito tabs and without leaking to mazigho.com.
  // - Subdomain stores on mazigho.ch (*.mazigho.ch) share the session across .mazigho.ch.
  if (normalized === "mazigho.ch" || (normalized.endsWith(".mazigho.ch") && normalized !== "studio.mazigho.ch")) {
    return ".mazigho.ch";
  }
  return undefined;
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // A normal account may own several MAZIGHO subdomain boutiques. Sharing the
  // signed session only across the MAZIGHO parent domain keeps sign-in stable
  // while every server operation remains checked against the current store's
  // active membership. Custom client domains stay host-only.
  const secure = isSecureRequest(req);
  const domain = getMazighoSessionDomain(req.hostname || req.headers.host);
  return {
    ...(domain ? { domain } : {}),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
  };
}

/**
 * The support session must move only between the operator console and the
 * selected managed recovery address. It is never shared with arbitrary client
 * domains, and local development keeps a host-only cookie.
 */
export function getSupportImpersonationCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const base = getSessionCookieOptions(req);
  const hostname = req.hostname?.toLowerCase() || "";
  const domain = getMazighoSessionDomain(hostname);
  return domain ? { ...base, domain } : base;
}
