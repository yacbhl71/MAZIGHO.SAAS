export interface ShopifyParsedProduct {
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  categoryName: string;
  tags: string[];
  priceCents: number;
  originalPriceCents?: number | null;
  stock: number;
  images: string[];
  variants: Array<{
    name: string;
    sku: string;
    priceCents: number;
    stock: number;
  }>;
}

export interface ShopifyImportReport {
  totalProducts: number;
  totalVariants: number;
  categoriesFound: string[];
  sampleProducts: ShopifyParsedProduct[];
  rawRowsCount: number;
}

export function parseShopifyCsv(csvText: string): ShopifyImportReport {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { totalProducts: 0, totalVariants: 0, categoriesFound: [], sampleProducts: [], rawRowsCount: 0 };
  }

  // Parse CSV header
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  
  const getColIndex = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const handleIdx = getColIndex(["handle"]);
  const titleIdx = getColIndex(["title"]);
  const bodyIdx = getColIndex(["bodyhtml", "body"]);
  const vendorIdx = getColIndex(["vendor"]);
  const categoryIdx = getColIndex(["customproducttype", "type", "category"]);
  const tagsIdx = getColIndex(["tags"]);
  const priceIdx = getColIndex(["variantprice", "price"]);
  const comparePriceIdx = getColIndex(["variantcompareatprice", "compareatprice"]);
  const stockIdx = getColIndex(["variantinventoryqty", "stock", "quantity"]);
  const skuIdx = getColIndex(["variantsku", "sku"]);
  const imageIdx = getColIndex(["imagesrc", "image"]);
  const opt1NameIdx = getColIndex(["option1name"]);
  const opt1ValIdx = getColIndex(["option1value"]);

  const productsMap = new Map<string, ShopifyParsedProduct>();
  const categoriesSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const handle = cols[handleIdx] || `product-${i}`;
    const title = cols[titleIdx] || "";
    const bodyHtml = cols[bodyIdx] || "";
    const vendor = cols[vendorIdx] || "Shopify Import";
    const categoryName = cols[categoryIdx] || "Catalogue Général";
    const tags = (cols[tagsIdx] || "").split(",").map(t => t.trim()).filter(Boolean);
    const rawPrice = parseFloat(cols[priceIdx] || "0");
    const priceCents = !isNaN(rawPrice) && rawPrice > 0 ? Math.round(rawPrice * 100) : 1990;
    const rawComparePrice = parseFloat(cols[comparePriceIdx] || "0");
    const comparePriceCents = !isNaN(rawComparePrice) && rawComparePrice > 0 ? Math.round(rawComparePrice * 100) : null;
    const rawStock = parseInt(cols[stockIdx] || "10", 10);
    const stock = !isNaN(rawStock) && rawStock >= 0 ? rawStock : 10;
    const imageUrl = cols[imageIdx] || "";
    const sku = cols[skuIdx] || "";
    const opt1Val = cols[opt1ValIdx] || "";

    if (categoryName) categoriesSet.add(categoryName);

    let product = productsMap.get(handle);
    if (!product) {
      product = {
        handle,
        title: title || handle,
        bodyHtml,
        vendor,
        categoryName,
        tags,
        priceCents,
        originalPriceCents: comparePriceCents,
        stock,
        images: [],
        variants: [],
      };
      productsMap.set(handle, product);
    }

    if (imageUrl && !product.images.includes(imageUrl)) {
      product.images.push(imageUrl);
    }

    if (opt1Val && opt1Val !== "Default Title") {
      product.variants.push({
        name: opt1Val,
        sku: sku || `${handle}-${product.variants.length + 1}`,
        priceCents,
        stock,
      });
    }
  }

  const products = Array.from(productsMap.values());
  let totalVariants = 0;
  for (const p of products) {
    totalVariants += p.variants.length;
  }

  return {
    totalProducts: products.length,
    totalVariants,
    categoriesFound: Array.from(categoriesSet),
    sampleProducts: products.slice(0, 10),
    rawRowsCount: lines.length - 1,
  };
}
