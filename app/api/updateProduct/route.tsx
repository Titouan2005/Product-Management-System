// app/api/updateProduct/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { db, authenticate } from "@/lib/database";
import { validateProduct } from "@/lib/product";

// PUT /api/updateProduct?id=<product id>   body: { brand, model, price, description }
export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

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

    // Update the product in PocketBase
    const product = await db.collection("products").update(id, result.product);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
