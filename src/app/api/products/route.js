import dbConnect from "@/server/config/dbConnect";
import {
  addProduct,
  getAllProducts,
  getProductsByCategoryAndPriceRange,
  getAllProductsFilter,
  searchProducts,
  getRandomProducts,
  getReviewsByProduct,
  getOrdersByUserId,
} from "@/server/controllers/productController";
import { NextResponse } from "next/server";

// GET request handler
export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);

  const action = url.searchParams.get("controllerName");
  const category = url.searchParams.get("category");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const page = url.searchParams.get("page");

  switch (action) {
    case "searchProducts":
      return await searchProducts(request);
    case "getReviewsByProduct":
      return await getReviewsByProduct(request);
    case "getAllProducts":
      return await getAllProducts();
    case "getRandomProducts":
      return await getRandomProducts();
    case "getAllProductsFilter":
      return await getAllProductsFilter(minPrice, maxPrice, page);
    case "getOrdersByUserId":
      return await getOrdersByUserId(request);
    case "getProductsByCategoryAndPriceRange":
      return await getProductsByCategoryAndPriceRange(
        category,
        minPrice,
        maxPrice,
        page
      );

    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

// POST request handler
export async function POST(request) {
  await dbConnect();
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "addProduct":
      return await addProduct(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
