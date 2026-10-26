# Security Specification — MAZIGHO Google Cloud & Firebase Platform

## 1. Data Invariants
1. **Master Gate (Relational Sync)**: A product in `/stores/{storeId}/products/{productId}` cannot be created, updated, or deleted unless `/stores/{storeId}` exists and `get(/databases/$(database)/documents/stores/$(storeId)).data.ownerId == request.auth.uid` (or `isAdmin()`).
2. **Validation Blueprints (Anti-Update-Gap)**: Every `create` and `update` rule begins with `isValid[Entity](incoming())`, enforcing strict `keys().hasAll(...)`, `keys().hasOnly(...)`, string `.size()` bounds, regex patterns, and server timestamps (`request.time`).
3. **Path Variable Hardening (ID Poisoning Guard)**: Every single-document target operation (`get`, `create`, `update`, `delete`) validates path variables via `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Tiered Identity Logic & Terminal State Locking**: Store owners can update allowed store/product fields (`affectedKeys().hasOnly(...)`). Orders reaching terminal states (`completed` or `cancelled`) are locked against further non-admin updates.
5. **PII Split Collection Isolation**: Public profiles in `/users/{userId}` contain zero PII (`displayName` only). Sensitive PII (`email`, `phone`, `shippingAddress`) lives exclusively in `/users/{userId}/private/{docId}` and is readable only by `isOwner(userId) || isAdmin()`.
6. **Verified Email & Bootstrapped Admin**: All writes require `request.auth.token.email_verified == true`. Admin status checks both `request.auth.token.email_verified == true && request.auth.token.email == 'yacbhl71@gmail.com'` or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
7. **Secure List Queries (Query Enforcer)**: Every `allow list` rule evaluates `resource.data` directly (e.g., `resource.data.status == 'active'` or `resource.data.ownerId == request.auth.uid`) with zero `get()`/`exists()` calls inside `list`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on Store Creation**: `{ "slug": "atlas", "displayName": "Atlas", "primaryDomain": "atlas.mazigho.ch", "status": "setup", "ownerId": "uid_1", "isVerified": true, "createdAt": "<SERVER_TIME>", "updatedAt": "<SERVER_TIME>" }` -> `PERMISSION_DENIED`
2. **Identity Spoofing on Store Creation**: User `uid_1` attempts to create `/stores/store_1` with `ownerId: "uid_2"` -> `PERMISSION_DENIED`
3. **Unverified Email Write**: User `uid_1` with `email_verified: false` attempts to create `/stores/store_1` -> `PERMISSION_DENIED`
4. **Admin Email Spoofing**: User with `email: "yacbhl71@gmail.com"` and `email_verified: false` attempts admin override -> `PERMISSION_DENIED`
5. **Orphaned Product Creation**: User `uid_1` attempts to create `/stores/non_existent_store/products/prod_1` -> `PERMISSION_DENIED`
6. **Cross-Tenant Product Mutation**: User `uid_2` attempts to update `/stores/store_1/products/prod_1` owned by `uid_1` -> `PERMISSION_DENIED`
7. **PII Leak via Cross-User Read**: Authenticated user `uid_2` attempts `get` on `/users/uid_1/private/info` -> `PERMISSION_DENIED`
8. **Immortal Field Mutation**: User `uid_1` attempts to change `ownerId` or `createdAt` during an `update` on `/stores/store_1` -> `PERMISSION_DENIED`
9. **Client Timestamp Forgery**: User `uid_1` sends a past/future `createdAt` instead of `request.time` -> `PERMISSION_DENIED`
10. **Value Poisoning on Update**: User `uid_1` updates `displayName` on `/stores/store_1` with a 5,000-character string -> `PERMISSION_DENIED`
11. **Terminal State Bypass on Order**: User `uid_1` attempts to update `/orders/order_1` after `existing().status == 'completed'` -> `PERMISSION_DENIED`
12. **Blanket Order List Scraping**: User `uid_1` attempts an unfiltered `list` on `/orders` where `resource.data.ownerId != request.auth.uid` -> `PERMISSION_DENIED`
