"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProduct, markProductsChanged } from "@/lib/api";
import ProductForm from "@/components/ProductForm";
import type { Product, ProductInput } from "@/lib/product";

export default function UpdateProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Send the updated product to the API
  const updateProduct = async (values: ProductInput) => {
    try {
      const res = await fetch(`/api/updateProduct?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: data.error ?? "Could not update the product.", errors: data.errors };
      }

      // Go back to the product's page
      markProductsChanged();
      router.push(`/product/${id}`);
    } catch {
      return { error: "Could not update the product. Is PocketBase running?" };
    }
  };

  // Get this product from the API when the page opens
  useEffect(() => {
    fetchProduct(id).then((result) => {
      if (result.product) setProduct(result.product);
      if (result.error) setError(result.error);
      setLoading(false);
    });
  }, [id]);

  return (
    <section className="page">
      <p className="eyebrow">PRODUCTS</p>
      <h1>Update product</h1>
      <p className="description">Change the product details and save.</p>

      <div className="card">
        {loading && <p>Loading product...</p>}
        {error && <p className="errorMessage">{error}</p>}

        {product && (
          <ProductForm
            initialValues={{
              brand: product.brand,
              model: product.model,
              price: product.price,
              description: product.description,
            }}
            submitLabel="Save changes"
            onSubmit={updateProduct}
          />
        )}
      </div>

      <div className="actions">
        <Link
          href={product ? `/product/${product.id}` : "/listAllProducts"}
          className="button buttonSecondary"
        >
          ← Cancel
        </Link>
      </div>
    </section>
  );
}
