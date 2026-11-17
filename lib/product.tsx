export type ProductInput = {
  brand: string;
  model: string;
  price: string;
  description: string;
};

export type Product = ProductInput & {
  id: string;
  created: string;
  updated: string;
};

export type ProductErrors = Partial<Record<keyof ProductInput, string>>;

export const emptyProduct: ProductInput = {
  brand: "",
  model: "",
  price: "",
  description: "",
};

const MAX_LENGTH: Record<keyof ProductInput, number> = {
  brand: 50,
  model: 100,
  price: 12,
  description: 1000,
};

// Checks the data sent by a form / API request.
// Returns the cleaned product (trimmed, price with 2 decimals) or the errors.
export function validateProduct(
  data: unknown
):
  | { valid: true; product: ProductInput }
  | { valid: false; errors: ProductErrors } {
  const errors: ProductErrors = {};
  const input = (typeof data === "object" && data !== null ? data : {}) as Record<
    string,
    unknown
  >;

  const clean = {} as ProductInput;

  for (const field of Object.keys(emptyProduct) as (keyof ProductInput)[]) {
    const value = input[field];

    if (typeof value !== "string" || value.trim() === "") {
      errors[field] = `${label(field)} is required.`;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_LENGTH[field]) {
      errors[field] = `${label(field)} must be ${MAX_LENGTH[field]} characters or less.`;
      continue;
    }

    clean[field] = trimmed;
  }

  if (clean.price !== undefined) {
    if (!/^\d+(\.\d{1,2})?$/.test(clean.price)) {
      errors.price = "Price must be a number with up to 2 decimals (e.g. 999.99).";
    } else if (Number(clean.price) <= 0) {
      errors.price = "Price must be greater than 0.";
    } else {
      clean.price = Number(clean.price).toFixed(2);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, product: clean };
}

function label(field: keyof ProductInput) {
  return field.charAt(0).toUpperCase() + field.slice(1);
}
