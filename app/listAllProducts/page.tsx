"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/product";

export default function ListAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete one product, then remove it from the list
  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete ${product.brand} ${product.model}?`)) return;

    const res = await fetch(`/api/deleteProduct?id=${product.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Could not delete the product.");
      return;
    }
    setProducts(products.filter((p) => p.id !== product.id));
  };

  // Get all products from the API when the page opens
  useEffect(() => {
    fetchProducts().then((result) => {
      if (result.products) setProducts(result.products);
      if (result.error) setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <section className="page">
      <p className="eyebrow">PRODUCTS</p>
      <h1>Products</h1>
      <p className="description">All products stored in the database.</p>

      <div className="actions">
        <Link href="/addProduct" className="button">
          ＋ Add product
        </Link>
      </div>

      <div className="card">
        <h2>All products ({products.length})</h2>

        {loading && <p>Loading products...</p>}
        {error && <p className="errorMessage">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p>No products yet. Add your first product!</p>
        )}

        {products.length > 0 && (
          <table className="productTable">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Model</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td data-label="Brand">{product.brand}</td>
                  <td data-label="Model">{product.model}</td>
                  <td data-label="Price">€{product.price}</td>
                  <td className="rowActions">
                    <Link
                      href={`/product/${product.id}`}
                      className="button buttonSmall buttonSecondary"
                    >
                      View
                    </Link>
                    <Link
                      href={`/updateProduct/${product.id}`}
                      className="button buttonSmall buttonSecondary"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="button buttonSmall buttonSecondary"
                      onClick={() => deleteProduct(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
