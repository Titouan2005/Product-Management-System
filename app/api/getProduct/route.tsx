import { NextRequest, NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { db, authenticate } from "@/lib/database";
import { API_CACHE_CONTROL } from "@/lib/product";

// GET /api/getProduct?id=<product id>
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  try {
    await authenticate();

    // Fetch one product from PocketBase
    // Optimisation 4: only ask for the fields the page shows
    const product = await db.collection("products").getOne(id, {
      fields: "id,brand,model,price,description",
    });

    // Optimisation 2: cacheable by the browser
    return NextResponse.json(product, {
      status: 200,
      headers: { "Cache-Control": API_CACHE_CONTROL },
    });
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
