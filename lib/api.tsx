import type { Product, ProductSummary } from "@/lib/product";

const NOT_RUNNING = "Is PocketBase running?";

// Optimisation 2 (browser cache): GET answers are cached for 30 seconds.
// After an add / update / delete we change this version number, so the next
// requests use a new URL (?v=...) and get fresh data instead of the cached copy.
const VERSION_KEY = "productsVersion";

function dataVersion(): string {
  try {
    return sessionStorage.getItem(VERSION_KEY) ?? "0";
  } catch {
    return "0";
  }
}

export function markProductsChanged() {
  try {
    sessionStorage.setItem(VERSION_KEY, String(Date.now()));
  } catch {
    // sessionStorage not available: the cache simply expires after 30 seconds
  }
}

// GET /api/getAll
export async function fetchProducts(): Promise<{ products?: ProductSummary[]; error?: string }> {
  try {
    const res = await fetch(`/api/getAll?v=${dataVersion()}`);
    if (!res.ok) return { error: `Could not load the products. ${NOT_RUNNING}` };
    return { products: await res.json() };
  } catch {
    return { error: `Could not load the products. ${NOT_RUNNING}` };
  }
}

// GET /api/getProduct?id=...
export async function fetchProduct(id: string): Promise<{ product?: Product; error?: string }> {
  try {
    const res = await fetch(`/api/getProduct?id=${encodeURIComponent(id)}&v=${dataVersion()}`);
    if (res.status === 404) return { error: "Product not found." };
    if (!res.ok) return { error: `Could not load the product. ${NOT_RUNNING}` };
    return { product: await res.json() };
  } catch {
    return { error: `Could not load the product. ${NOT_RUNNING}` };
  }
}
