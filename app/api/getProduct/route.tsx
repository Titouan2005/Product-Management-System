// app/api/getProduct/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { db, authenticate } from "@/lib/database";

// GET /api/getProduct?id=<product id>
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  try {
    await authenticate();

    // Fetch one product from PocketBase
    const product = await db.collection("products").getOne(id);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
