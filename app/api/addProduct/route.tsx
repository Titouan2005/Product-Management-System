// app/api/addProduct/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { db, authenticate } from "@/lib/database";
import { validateProduct } from "@/lib/product";

// POST /api/addProduct   body: { brand, model, price, description }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Check the data before saving it
  const result = validateProduct(body);
  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid product data", errors: result.errors },
      { status: 400 }
    );
  }

  try {
    await authenticate();

    // Create the product in PocketBase
    const product = await db.collection("products").create(result.product);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to add product:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
