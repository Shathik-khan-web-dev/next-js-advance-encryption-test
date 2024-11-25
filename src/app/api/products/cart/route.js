import dbConnect from "@/server/config/dbConnect";
import {
  addProductToCart,
  getCart,
  removeProductFromCart,
  updateCartProductQuantity,
} from "@/server/controllers/visitorController";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { NextResponse } from "next/server";

// API Route for fetching the cart
export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  try {
    switch (action) {
      case "getCart":
        return await getCart(request);
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error.message },
      { status: 500 }
    );
  }
}

// API Route to add a product to the cart
export async function POST(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  try {
    switch (action) {
      case "addProductToCart":
        return await addProductToCart(request);
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add product to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("controllerName");

  switch (action) {
    case "updateCartProductQuantity":
      return await updateCartProductQuantity(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
