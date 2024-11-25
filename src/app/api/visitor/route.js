import dbConnect from "@/server/config/dbConnect";
import { NextResponse } from "next/server";
import {
  getFavorite,
  addProductToFavorite,
  removeProductFromFavorite,
  removeProductFromCart,
  getAddress,
  addAddress,
  applyCoupon,
  addReview,
  getUserReviews,
} from "@/server/controllers/visitorController";

export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  try {
    switch (action) {
      case "getFavorite":
        return await getFavorite(request);
      case "getAddress":
        return await getAddress(request);
      case "getUserReviews":
        return await getUserReviews(request);
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "addProductToFavorite":
      return await addProductToFavorite(request);
    case "addAddress":
      return await addAddress(request);
    case "applyCoupon":
      return await applyCoupon(request);
    case "addReview":
      return await addReview(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");
  console.log(action);

  switch (action) {
    case "removeProductFromCart":
      return await removeProductFromCart(request);
    case "removeProductFromFavorite":
      return await removeProductFromFavorite(request);

    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
