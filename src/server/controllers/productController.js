import mongoose from "mongoose";
import Product from "../models/productModel";
import User from "../models/userModal";
import Review from "../models/reviewModel";
import Order from "../models/orderModel";
import {
  getDecryptHandler,
  decryptHandler,
} from "@/server/utils/decryptHandler";
import { NextResponse } from "next/server";

// getOrdersByUserId
export const getOrdersByUserId = async (req) => {
  const decryptedData = await getDecryptHandler(req);

  const { userId } = decryptedData;

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { error: "User ID not provided" },
      { status: 400 }
    );
  }

  try {
    // Fetch orders by userId
    const orders = await Order.find({ userId });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

// Get all reviews for a product
export const getReviewsByProduct = async (request) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { message: "Product ID is required." },
      { status: 400 }
    );
  }

  try {
    const reviews = await Review.find({ productId });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching reviews.", error: error.message },
      { status: 500 }
    );
  }
};

// search Products
export const searchProducts = async (request) => {
  try {
    const url = request.nextUrl;
    const searchTerm = url.searchParams.get("searchQuery");

    if (!searchTerm) {
      return NextResponse.json(
        { message: "Search term is missing" },
        { status: 400 }
      );
    }

    const products = await Product.find({
      name: { $regex: searchTerm, $options: "i" },
    });

    // Check if no products were found
    if (products.length === 0) {
      return NextResponse.json(
        { message: "🛒 No products found.", products: [] }, // Return an empty array
        { status: 404 }
      );
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to search products",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const products = await Product.find();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Get random products
export const getRandomProducts = async () => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 10 } }, // Randomly select 10 products
    ]);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch random products",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Get products by category and price range
export const getProductsByCategoryAndPriceRange = async (
  category,
  minPrice,
  maxPrice,
  page,
  pageSize = 20
) => {
  try {
    const query = { category };

    if (minPrice && maxPrice) {
      query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }

    const skip = (page - 1) * pageSize;

    // Fetch products with pagination
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalCount = await Product.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({ products, totalPages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};

// Get all products with optional price range filtering
export const getAllProductsFilter = async (
  minPrice,
  maxPrice,
  page,
  pageSize = 20
) => {
  try {
    const query = {};

    if (minPrice && maxPrice) {
      query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }

    const skip = (page - 1) * pageSize;

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageSize);

    return NextResponse.json({ products, totalPages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Get products by category - category page
export const getProductsByCategory = async (category) => {
  try {
    const products = await Product.find({ category });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};

// Add a new product
export const addProduct = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const formData = decryptedData.productData;
    const { category, name, price, oldPrice, description, image } = formData;

    if (!category || !name || !price || !description || !image) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const newProduct = new Product({
      category,
      name,
      price,
      oldPrice: oldPrice || null,
      description,
      imageUrl: image, // Store the Cloudinary image URL here
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Product added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error adding product.",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
