export type StorefrontStatus = "setup" | "active" | "limited" | "suspended" | "closed";

export function normalizeStoreHost(host?: string | null) {
  const raw = host?.trim().toLowerCase() || "";
  if (!raw) return "";
  return raw.replace(/^https?:\/\//, "").split("/")[0]?.replace(/:\d+$/, "") || "";
}

/** The operator console has a dedicated hostname, never a customer store. */
export function isStudioHost(host?: string | null) {
  const h = normalizeStoreHost(host);
  return h === "studio.mazigho.com" || h === "studio.mazigho.ch";
}

/**
 * Every client store keeps a stable MAZIGHO recovery address. It is derived
 * from the immutable store slug, is not a custom-domain assignment and lets an
 * operator recover access if a client breaks their own registrar settings.
 */
export function getStoreRecoveryHost(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug) || normalizedSlug === "studio" || normalizedSlug === "primary-store") return null;
  return `${normalizedSlug}.mazigho.com`;
}

export function getStoreSlugForRecoveryHost(host?: string | null) {
  const normalizedHost = normalizeStoreHost(host);
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.mazigho\.(?:com|ch)$/.exec(normalizedHost);
  if (!match) return null;
  const slug = match[1];
  if (!getStoreRecoveryHost(slug)) return null;
  return (normalizedHost === `${slug}.mazigho.com` || normalizedHost === `${slug}.mazigho.ch`) ? slug : null;
}

/** A limited store may still serve its configured public status page; suspended and closed stores must not serve a checkout. */
export function mayServeStorefront(status: StorefrontStatus) {
  return status === "active" || status === "limited";
}

/**
 * A limited store is a public catalogue / showcase only. It deliberately has
 * no cart, order or payment capability until Studio switches it to active.
 * The platform storefront keeps its historic availability independently from
 * a legacy status value.
 */
export function mayAcceptStorefrontCommerce(status: StorefrontStatus, isPlatformStore = false) {
  return isPlatformStore || status === "active";
}

/**
 * A custom hostname must resolve to an explicit store. The compatibility fallback
 * remains available only for the platform domain, the dedicated Studio host,
 * local development, and the project’s Vercel deployment aliases; any other
 * host fails closed.
 */
export function mayUsePlatformStoreFallback(host: string, primaryDomain: string) {
  const normalizedHost = normalizeStoreHost(host);
  const normalizedPrimary = normalizeStoreHost(primaryDomain);
  const rootPrimary = normalizedPrimary.replace(/^www\./, "");
  const isPrimaryAlias = normalizedHost === normalizedPrimary
    || normalizedHost === rootPrimary
    || normalizedHost === `www.${rootPrimary}`
    || normalizedHost === "pro.mazigho.com"
    || normalizedHost === "mazigho.ch"
    || normalizedHost === "www.mazigho.ch"
    || normalizedHost === "pro.mazigho.ch";
  const isLocalDevelopment = normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "0.0.0.0";
  const isProjectVercelAlias = normalizedHost === "mazigho-shop.vercel.app"
    || /^mazigho-shop-[a-z0-9-]+\.vercel\.app$/.test(normalizedHost);
  const isCloudRunPreviewAlias = normalizedHost.endsWith(".run.app")
    || normalizedHost.endsWith(".usercontent.goog");
  return !normalizedHost || isPrimaryAlias || isStudioHost(normalizedHost) || isLocalDevelopment || isProjectVercelAlias || isCloudRunPreviewAlias;
}
