// lib/api.tsx
// Small helpers used by the pages (in the browser) to read products from our API routes.
import type { Product } from "@/lib/product";

const NOT_RUNNING = "Is PocketBase running?";

// GET /api/getAll
export async function fetchProducts(): Promise<{ products?: Product[]; error?: string }> {
  try {
    const res = await fetch("/api/getAll");
    if (!res.ok) return { error: `Could not load the products. ${NOT_RUNNING}` };
    return { products: await res.json() };
  } catch {
    return { error: `Could not load the products. ${NOT_RUNNING}` };
  }
}

// GET /api/getProduct?id=...
export async function fetchProduct(id: string): Promise<{ product?: Product; error?: string }> {
  try {
    const res = await fetch(`/api/getProduct?id=${encodeURIComponent(id)}`);
    if (res.status === 404) return { error: "Product not found." };
    if (!res.ok) return { error: `Could not load the product. ${NOT_RUNNING}` };
    return { product: await res.json() };
  } catch {
    return { error: `Could not load the product. ${NOT_RUNNING}` };
  }
}
