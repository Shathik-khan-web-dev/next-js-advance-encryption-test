import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/productModel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    // Fetch the product by productId
    const product = await Product.findOne({ productId: id });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
