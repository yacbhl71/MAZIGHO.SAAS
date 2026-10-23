# MAZIGHO Project TODO & Completed Improvements

## Architecture & Multi-Tenant Platform
- [x] Fix Express + Vite development server bootstrap (`server/_core/index.ts`) so `npm run dev` starts Express and attaches Vite middleware on port 3000
- [x] Fix per-request HTML cache-busting (`?v=nanoid()`) in `server/_core/vite.ts` and respect `DISABLE_HMR`
- [x] Add safe development fallback for `JWT_SECRET` in `server/_core/sdk.ts` when `DATABASE_URL` and `JWT_SECRET` are unset
- [x] Allow preview hostnames (`.run.app`, `0.0.0.0`, `localhost`) in `mayUsePlatformStoreFallback` (`server/services/storeScope.ts`)
- [x] Provide rich in-memory multi-tenant catalog, categories, products, delivery profiles, reviews, banners, carts, auth, and owner/studio inventory fallback (`server/db/demoFallback.ts` & `server/db.ts`) when `DATABASE_URL` is not configured

## Storefront & E-Commerce Experience
- [x] Feature 1: Homepage Hero Section with Featured Product Carousel & Cultural Heritage Storytelling
- [x] Feature 2: Product Catalog with Category Filtering (Bijoux, Poterie, Tapis, Cuir, Vêtements, Épices, Cosmétiques, Décoration, Paniers, Ustensiles, Cadeaux) & Search
- [x] Feature 3: Product Detail Page with Image Gallery, Delivery Country Profiles, and Customer Reviews
- [x] Feature 4: Shopping Cart System (Add, Remove, Update Quantity, Country-Aware Shipping Calculation)
- [x] Feature 5: Checkout & Payment Flow (Stripe / TWINT / PostFinance / Apple Pay readiness)
- [x] Feature 6: User Authentication & Account Management (Login, Registration, Demo Admin / Client / Studio access)
- [x] Feature 7: Cultural Heritage Pages (History, Artisans, Traditions, Blog)
- [x] Feature 8: Responsive Design (Mobile, Tablet, Desktop)
- [x] Feature 9: Multi-Currency & International Shipping Support (CHF, EUR, USD, GBP, CAD, MAD, DZD)

## Admin, Owner & Studio Consoles
- [x] Feature 10: Admin Dashboard with KPIs, Products, Orders, Banners, Reviews, Promotions & Newsletter
- [x] Feature 11: Multi-Store Studio Inventory (`/studio`) & Store Setup Recovery (`/setup`)
- [x] Feature 12: Automated Unit & Integration Tests (`vitest`)
