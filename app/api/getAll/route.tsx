import { NextResponse } from "next/server";
import { db, authenticate } from "@/lib/database";
import { API_CACHE_CONTROL } from "@/lib/product";

export async function GET() {
  try {
    await authenticate();

    // Fetch all products from PocketBase
    // Optimisation 4: only ask for the fields the list shows
    const products = await db.collection("products").getFullList({
      sort: "-created",
      fields: "id,brand,model,price",
    });

    // Return products as JSON (optimisation 2: cacheable by the browser)
    return NextResponse.json(products, {
      status: 200,
      headers: { "Cache-Control": API_CACHE_CONTROL },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
