import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

// A fresh Cloud SQL database needs the whole schema history, whereas existing
// MAZIGHO databases may already contain the later manual migration ledger.
// This runner is deliberately idempotent and serialised with a MySQL named
// lock so Cloud Run cold starts cannot race to initialise the same database.
const migrations = [
  ["0000_great_forgotten_one", "drizzle/0000_great_forgotten_one.sql"],
  ["0001_rainy_naoko", "drizzle/0001_rainy_naoko.sql"],
  ["0002_unique_mystique", "drizzle/0002_unique_mystique.sql"],
  ["0003_fluffy_sentinels", "drizzle/0003_fluffy_sentinels.sql"],
  ["0004_aberrant_darkstar", "drizzle/0004_aberrant_darkstar.sql"],
  ["0005_demonic_smasher", "drizzle/0005_demonic_smasher.sql"],
  ["0006_red_siren", "drizzle/0006_red_siren.sql"],
  ["0007_user_account_status", "drizzle/0007_user_account_status.sql"],
  ["0008_account_tokens_and_invitations", "drizzle/0008_account_tokens_and_invitations.sql"],
  ["0009_accounting_entries", "drizzle/0009_accounting_entries.sql"],
  ["0010_order_decisions", "drizzle/0010_order_decisions.sql"],
  ["0011_product_delivery_profiles", "drizzle/0011_product_delivery_profiles.sql"],
  ["0012_catalog_sections", "drizzle/0012_catalog_sections.sql"],
  ["0013_product_translations", "drizzle/0013_product_translations.sql"],
  ["0014_public_content_translations", "drizzle/0014_public_content_translations.sql"],
  ["0015_staff_roles", "drizzle/0015_staff_roles.sql"],
  ["0016_stripe_checkout", "drizzle/0016_stripe_checkout.sql"],
  ["0017_product_categories", "drizzle/0017_product_categories.sql"],
  ["0018_checkout_shipping_policy", "drizzle/0018_checkout_shipping_policy.sql"],
  ["0019_store_currency", "drizzle/0019_store_currency.sql"],
  ["0020_multistore_foundation", "drizzle/0020_multistore_foundation.sql"],
  ["0021_store_identity_content_scope", "drizzle/0021_store_identity_content_scope.sql"],
  ["0022_store_catalog_scope", "drizzle/0022_store_catalog_scope.sql"],
  ["0023_store_relationship_scope", "drizzle/0023_store_relationship_scope.sql"],
  ["0024_store_operations_scope", "drizzle/0024_store_operations_scope.sql"],
  ["0025_storefront_public_settings_scope", "drizzle/0025_storefront_public_settings_scope.sql"],
  ["0026_store_provisioning_drafts", "drizzle/0026_store_provisioning_drafts.sql"],
  ["0027_store_gift_provisioning_link", "drizzle/0027_store_gift_provisioning_link.sql"],
  ["0028_stripe_connect_direct_charges", "drizzle/0028_stripe_connect_direct_charges.sql"],
  ["0029_lemon_squeezy_saas_billing", "drizzle/0029_lemon_squeezy_saas_billing.sql"],
  ["0030_controlled_return_requests", "drizzle/0030_controlled_return_requests.sql"],
  ["0031_stripe_connect_live_direct_charges", "drizzle/0031_stripe_connect_live_direct_charges.sql"],
  ["0032_checkout_legal_acceptance", "drizzle/0032_checkout_legal_acceptance.sql"],
  ["0033_algeria_cash_on_delivery", "drizzle/0033_algeria_cash_on_delivery.sql"],
  ["0034_return_case_tracking", "drizzle/0034_return_case_tracking.sql"],
  ["0035_algeria_standard_template", "drizzle/0035_algeria_standard_template.sql"],
  ["0036_category_public_messages", "drizzle/0036_category_public_messages.sql"],
  ["0037_owner_product_variants", "drizzle/0037_owner_product_variants.sql"],
  ["0038_store_relationship_indexes", "drizzle/0038_store_relationship_indexes.sql"],
  ["0039_catalog_section", "drizzle/0039_catalog_section.sql"],
  ["0040_categories_store_slug_index", "drizzle/0040_categories_store_slug_index.sql"],
  ["0041_owner_ai_conversations", "drizzle/0041_owner_ai_conversations.sql"],
  ["0042_owner_ai_workspace_documents", "drizzle/0042_owner_ai_workspace_documents.sql"],
  ["0043_owner_ai_workspace_team_sharing", "drizzle/0043_owner_ai_workspace_team_sharing.sql"],
  ["0044_store_acquisition_requested_plan", "drizzle/0044_store_acquisition_requested_plan.sql"],
  ["0045_controlled_store_copy", "drizzle/0045_controlled_store_copy.sql"],
  ["0046_studio_image_generation_usage", "drizzle/0046_studio_image_generation_usage.sql"],
  ["0047_product_new_badge", "drizzle/0047_product_new_badge.sql"],
  ["0048_owner_product_variant_image", "drizzle/0048_owner_product_variant_image.sql"],
  ["0049_store_provisioning_payment_route", "drizzle/0049_store_provisioning_payment_route.sql"],
  ["0050_store_provisioning_launch_market", "drizzle/0050_store_provisioning_launch_market.sql"],
];

const databaseUrl = process.env.DATABASE_URL?.trim();
if (process.env.DATABASE_SCHEMA_BOOTSTRAP !== "true") {
  console.log("[schema-bootstrap] Bootstrap désactivé : démarrage normal.");
  process.exit(0);
}

if (!databaseUrl) {
  console.log("[schema-bootstrap] DATABASE_URL absent : impossible d'initialiser la base demandée.");
  process.exit(1);
}

const usesCloudSqlSocket = databaseUrl.includes("socketPath=%2Fcloudsql%2F") || databaseUrl.includes("socketPath=/cloudsql/");
const connection = await mysql.createConnection({
  uri: databaseUrl,
  ...(usesCloudSqlSocket ? {} : { ssl: { rejectUnauthorized: false } }),
  multipleStatements: true,
});

const lockName = "mazigho-saas-schema-bootstrap";

try {
  const [lockRows] = await connection.query("SELECT GET_LOCK(?, 120) AS acquired", [lockName]);
  const acquired = Array.isArray(lockRows) && Number(lockRows[0]?.acquired) === 1;
  if (!acquired) throw new Error("[schema-bootstrap] Verrou d'initialisation indisponible.");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`mazighoSchemaMigrations\` (
      \`id\` varchar(120) NOT NULL PRIMARY KEY,
      \`appliedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const [id, relativePath] of migrations) {
    const [existing] = await connection.query("SELECT id FROM mazighoSchemaMigrations WHERE id = ? LIMIT 1", [id]);
    if (Array.isArray(existing) && existing.length > 0) continue;

    const migration = await readFile(resolve(process.cwd(), relativePath), "utf8");
    const sql = migration.replaceAll("--> statement-breakpoint", "");
    await connection.query(sql);
    await connection.query("INSERT INTO mazighoSchemaMigrations (id) VALUES (?)", [id]);
    console.log(`[schema-bootstrap] ${id} appliquée.`);
  }
} finally {
  try {
    await connection.query("SELECT RELEASE_LOCK(?)", [lockName]);
  } finally {
    await connection.end();
  }
}
