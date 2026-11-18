"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { markProductsChanged } from "@/lib/api";
import type { ProductInput } from "@/lib/product";

export default function AddProduct() {
  const router = useRouter();

  // Send the new product to the API
  const addProduct = async (product: ProductInput) => {
    try {
      const res = await fetch("/api/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: data.error ?? "Could not add the product.", errors: data.errors };
      }

      // Go to the new product's page
      markProductsChanged();
      router.push(`/product/${data.id}`);
    } catch {
      return { error: "Could not add the product. Is PocketBase running?" };
    }
  };

  return (
    <section className="page">
      <p className="eyebrow">PRODUCTS</p>
      <h1>Add product</h1>
      <p className="description">Fill in the form to add a new product.</p>

      <div className="card">
        <ProductForm submitLabel="Add product" onSubmit={addProduct} />
      </div>

      <div className="actions">
        <Link href="/listAllProducts" className="button buttonSecondary">
          ← Back to products
        </Link>
      </div>
    </section>
  );
}
