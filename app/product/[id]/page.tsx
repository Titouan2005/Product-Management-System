// app/product/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProduct } from "@/lib/api";
import type { Product } from "@/lib/product";

export default function SingleProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete this product, then go back to the list
  const deleteProduct = async () => {
    if (!product || !confirm(`Delete ${product.brand} ${product.model}?`)) return;

    const res = await fetch(`/api/deleteProduct?id=${product.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Could not delete the product.");
      return;
    }
    router.push("/listAllProducts");
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
      <p className="eyebrow">PRODUCT</p>
      <h1>{product ? `${product.brand} ${product.model}` : "Product"}</h1>
      <p className="description">Information about the selected product.</p>

      <div className="card">
        {loading && <p>Loading product...</p>}
        {error && <p className="errorMessage">{error}</p>}

        {product && (
          <dl className="details">
            <dt>Brand</dt>
            <dd>{product.brand}</dd>

            <dt>Model</dt>
            <dd>{product.model}</dd>

            <dt>Price</dt>
            <dd>€{product.price}</dd>

            <dt>Description</dt>
            <dd>{product.description}</dd>
          </dl>
        )}
      </div>

      <div className="actions">
        <Link href="/listAllProducts" className="button buttonSecondary">
          ← Back to products
        </Link>
        {product && (
          <>
            <Link href={`/updateProduct/${product.id}`} className="button buttonSecondary">
              Edit
            </Link>
            <button
              type="button"
              className="button buttonSecondary"
              onClick={deleteProduct}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </section>
  );
}
