export type SupplierProvider = "cjdropshipping" | "aliexpress" | "printful" | "printify";

export type SupplierConnectionStatus = "disconnected" | "connected" | "error" | "testing";

export type SupplierProviderMeta = {
  id: SupplierProvider;
  name: string;
  type: "dropshipping" | "print_on_demand";
  typeLabel: string;
  description: string;
  badge: string;
  accentColor: string;
  websiteUrl: string;
  docsUrl: string;
  features: string[];
  keyPlaceholder: string;
  keyLabel: string;
};

export const SUPPLIER_PROVIDERS_META: Record<SupplierProvider, SupplierProviderMeta> = {
  cjdropshipping: {
    id: "cjdropshipping",
    name: "CJdropshipping",
    type: "dropshipping",
    typeLabel: "Dropshipping global",
    description: "Sourcing direct usines, entrepôts Europe/USA/Asie et exécution automatisée.",
    badge: "Populaire",
    accentColor: "#f97316", // Orange
    websiteUrl: "https://cjdropshipping.com",
    docsUrl: "https://developers.cjdropshipping.com",
    features: [
      "Catalogue de plus de 500 000 références",
      "Entrepôts en Europe et en Asie",
      "Calcul des frais de port en temps réel",
      "Suivi de livraison traçable",
    ],
    keyLabel: "Clé API / Token CJ (Access Token)",
    keyPlaceholder: "ex: cj_token_9a8f27b...",
  },
  aliexpress: {
    id: "aliexpress",
    name: "AliExpress",
    type: "dropshipping",
    typeLabel: "Marketplace mondiale",
    description: "Importation universelle de produits par lien direct ou identifiant de fiche.",
    badge: "Catalogue géant",
    accentColor: "#ef4444", // Red
    websiteUrl: "https://aliexpress.com",
    docsUrl: "https://open.aliexpress.com",
    features: [
      "Import par URL ou recherche de références",
      "Extraction automatique des images haute résolution",
      "Importation des variantes (couleurs, tailles)",
      "Détection des devises et prix de base",
    ],
    keyLabel: "Clé Développeur AliExpress (ou Mode Import Direct)",
    keyPlaceholder: "ex: ali_app_key_3849102...",
  },
  printful: {
    id: "printful",
    name: "Printful",
    type: "print_on_demand",
    typeLabel: "Print-on-Demand Premium",
    description: "Impression et broderie à la demande sur vêtements, tasses, posters et accessoires.",
    badge: "Qualité premium",
    accentColor: "#0284c7", // Blue
    websiteUrl: "https://printful.com",
    docsUrl: "https://developers.printful.com",
    features: [
      "Vêtements brodés et imprimés de haute qualité",
      "Ateliers d'impression en Europe et aux États-Unis",
      "Création de maquettes produits automatiques",
      "Marquage en marque blanche sans mention Printful",
    ],
    keyLabel: "Jeton d’accès privé Printful (Bearer Token)",
    keyPlaceholder: "ex: prnt_tok_a8b9c0d1e2...",
  },
  printify: {
    id: "printify",
    name: "Printify",
    type: "print_on_demand",
    typeLabel: "Réseau mondial POD",
    description: "Réseau de plus de 90 imprimeurs partenaires pour maximiser les marges et la proximité.",
    badge: "Meilleurs coûts",
    accentColor: "#10b981", // Emerald
    websiteUrl: "https://printify.com",
    docsUrl: "https://developers.printify.com",
    features: [
      "Réseau mondial d'imprimeurs indépendants",
      "Catalogue étendu (textiles, déco, high-tech, papeterie)",
      "Choix de l'imprimeur selon le pays du client",
      "Marges très compétitives sur les textiles",
    ],
    keyLabel: "Jeton d’API Printify (Personal Access Token)",
    keyPlaceholder: "ex: pfy_pat_x1y2z3a4b5...",
  },
};

export type StoreSupplierConnection = {
  provider: SupplierProvider;
  status: SupplierConnectionStatus;
  accountLabel: string;
  apiKeyMasked: string | null;
  lastVerifiedAt: string | null;
  errorMessage: string | null;
};

export type SupplierVariant = {
  id: string;
  name: string;
  sku: string;
  sourcePriceCents: number;
  stock: number;
  options: Record<string, string>;
};

export type SupplierProductDraft = {
  id: string;
  storeId: number;
  provider: SupplierProvider;
  supplierProductId: string;
  supplierUrl: string;
  title: string;
  description: string;
  categoryName: string;
  sourcePriceCents: number;
  sourceCurrency: string;
  shippingCostCents: number;
  sellingPriceCents: number;
  marginPercent: number;
  profitCents: number;
  stock: number;
  images: string[];
  selectedImages: string[];
  variants: SupplierVariant[];
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  shippingCountry: string;
  status: "draft" | "ready" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  publishedProductId: number | null;
};

export type SupplierSearchResultItem = {
  id: string;
  provider: SupplierProvider;
  title: string;
  thumbnail: string;
  sourcePriceCents: number;
  sourceCurrency: string;
  supplierShippingEstimateCents: number;
  stock: number;
  rating: number;
  supplierName: string;
  originCountry: string;
  estimatedDeliveryDays: number;
  url: string;
};
