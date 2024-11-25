import dbConnect from "@/server/config/dbConnect";
import { NextResponse } from "next/server";
import {
  addCategory,
  updateStock,
  updateCategory,
  deleteCategory,
  getCategories,
  getProducts,
  updateProduct,
  updateReview,
  deleteProduct,
  getUsers,
  deleteUser,
  getOrders,
  updateOrderStatus,
  addReviewAdmin,
  getFilteredReviews,
  getSingleUser,
  getSingleProduct,
  deleteReview,
} from "@/server/controllers/adminController";

export async function GET(req) {
  await dbConnect();

  const url = new URL(req.url);
  const action = url.searchParams.get("controllerName");
  const filter = url.searchParams.get("filter");
  const searchTerm = url.searchParams.get("searchTerm");

  switch (action) {
    case "getSingleUser":
      return await getSingleUser(req);
    case "getSingleProduct":
      return await getSingleProduct(req);
    case "getCategories":
      return await getCategories();
    case "getProducts":
      return await getProducts(req);
    case "getUsers":
      return await getUsers(req);
    case "getOrders":
      return await getOrders(req);
    case "getFilteredReviews":
      return await getFilteredReviews(filter, searchTerm);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  const url = new URL(req.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "addCategory":
      return await addCategory(req);
    case "addReviewAdmin":
      return await addReviewAdmin(req);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

/* // Add the PATCH function
export async function PATCH(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const orderId = url.searchParams.get("orderId");

  if (action === "updateOrderStatus" && orderId) {
    const body = await request.json();
    return updateOrderStatus(orderId, body.orderStatus);
  } else {
    return new Response("Invalid request", { status: 400 });
  }
} */

export async function PUT(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("controllerName");
  const reviewId = searchParams.get("id");

  switch (action) {
    case "updateStock":
      return await updateStock(req);
    case "updateCategory":
      return await updateCategory(req);
    case "updateProduct":
      return await updateProduct(req);
    case "updateReview":
      return await updateReview(req, reviewId);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  const url = new URL(req.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "deleteCategory":
      return await deleteCategory(req);
    case "deleteProduct":
      return await deleteProduct(req);
    case "deleteUser":
      return await deleteUser(req);
    case "deleteReview":
      return await deleteReview(req);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
