// app/api/deleteProduct/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { db, authenticate } from "@/lib/database";

// DELETE /api/deleteProduct?id=<product id>
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  try {
    await authenticate();

    // Delete the product from PocketBase
    await db.collection("products").delete(id);

    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
