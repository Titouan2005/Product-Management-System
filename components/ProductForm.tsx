// components/ProductForm.tsx
// Form shared by the Add Product page and the Update Product page.
"use client";

import { useState } from "react";
import {
  emptyProduct,
  validateProduct,
  type ProductErrors,
  type ProductInput,
} from "@/lib/product";

type SubmitResult = { error?: string; errors?: ProductErrors } | void;

export default function ProductForm({
  initialValues = emptyProduct,
  submitLabel,
  onSubmit,
}: {
  initialValues?: ProductInput;
  submitLabel: string;
  onSubmit: (product: ProductInput) => Promise<SubmitResult>;
}) {
  const [values, setValues] = useState<ProductInput>(initialValues);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    // Check the form in the browser first
    const result = validateProduct(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    setSaving(true);
    const response = await onSubmit(result.product);
    setSaving(false);

    // Errors sent back by the API
    if (response?.errors) setErrors(response.errors);
    if (response?.error) setMessage(response.error);
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="brand">Brand</label>
      <input
        id="brand"
        name="brand"
        className="input"
        placeholder="e.g. Dell"
        value={values.brand}
        onChange={handleChange}
      />
      {errors.brand && <p className="fieldError">{errors.brand}</p>}

      <label htmlFor="model">Model</label>
      <input
        id="model"
        name="model"
        className="input"
        placeholder="e.g. XPS 13"
        value={values.model}
        onChange={handleChange}
      />
      {errors.model && <p className="fieldError">{errors.model}</p>}

      <label htmlFor="price">Price (€)</label>
      <input
        id="price"
        name="price"
        className="input"
        inputMode="decimal"
        placeholder="e.g. 999.99"
        value={values.price}
        onChange={handleChange}
      />
      {errors.price && <p className="fieldError">{errors.price}</p>}

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        className="input"
        rows={4}
        placeholder="e.g. 13.4&quot; display, Intel Core Ultra 7, 16GB RAM"
        value={values.description}
        onChange={handleChange}
      />
      {errors.description && (
        <p className="fieldError">{errors.description}</p>
      )}

      {message && <p className="errorMessage">{message}</p>}

      <button type="submit" className="button" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
