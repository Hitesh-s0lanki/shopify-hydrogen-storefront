import { NextRequest, NextResponse } from "next/server";
import { getCart, addToCart, updateCartLine, removeCartLine } from "@/modules/cart/actions";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Get cart API error:", error);
    return NextResponse.json(
      { error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, variantId, quantity, lineId, attributes } = body;

    switch (action) {
      case "add":
        if (!variantId) {
          return NextResponse.json(
            { error: "variantId is required" },
            { status: 400 }
          );
        }
        const cart = await addToCart(variantId, quantity || 1, attributes || []);
        return NextResponse.json({ cart });

      case "update":
        if (!lineId || quantity === undefined) {
          return NextResponse.json(
            { error: "lineId and quantity are required" },
            { status: 400 }
          );
        }
        const updatedCart = await updateCartLine(lineId, quantity);
        return NextResponse.json({ cart: updatedCart });

      case "remove":
        if (!lineId) {
          return NextResponse.json(
            { error: "lineId is required" },
            { status: 400 }
          );
        }
        const removedCart = await removeCartLine(lineId);
        return NextResponse.json({ cart: removedCart });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      { error: "Cart operation failed" },
      { status: 500 }
    );
  }
}

