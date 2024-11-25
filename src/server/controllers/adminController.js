import mongoose from "mongoose";
import dbConnect from "@/server/config/dbConnect";
import Product from "../models/productModel";
import User from "../models/userModal";
import Order from "../models/orderModel";
import Review from "../models/reviewModel";
import Category from "../models/categoryModel";
import nodemailer from "nodemailer";
import { decryptHandler } from "@/server/utils/decryptHandler";
import { NextResponse } from "next/server";
// import { sendEmail } from "../utils/sendEmail";

/*---------------------------------------
  category's             
-----------------------------------------*/

// Add a new category
export const addCategory = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { name } = decryptedData;

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 400 }
      );
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    return NextResponse.json(
      { message: "Category added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding category", error: error.message },
      { status: 500 }
    );
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const categories = await Category.find();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch categories", error: error.message },
      { status: 500 }
    );
  }
};

// Update an existing category
export const updateCategory = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { name, newName } = decryptedData;

    if (!name || !newName) {
      return NextResponse.json(
        { message: "Both current and new category names are required" },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndUpdate(
      { name },
      { name: newName },
      { new: true }
    );
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Category updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating category", error: error.message },
      { status: 500 }
    );
  }
};

//  deleteCategory controller
export const deleteCategory = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { name } = decryptedData;

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndDelete({ name });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Category deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting category", error: error.message },
      { status: 500 }
    );
  }
};

/*---------------------------------------
  Review's             
-----------------------------------------*/

// Add a new review
export const addReviewAdmin = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const formData = decryptedData.reviewData;
    const { productId, userId, rating, reviewText } = formData;

    // Validate required fields
    if (!productId || !userId || !rating || !reviewText) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Create new review
    const newReview = new Review({
      productId,
      userId,
      rating,
      reviewText,
    });

    // Save the review
    await newReview.save();

    // Update product's rating and rating count
    const product = await Product.findOne({ productId });
    const newRatingsCount = product.ratingsCount + 1;
    const newRating =
      (product.rating * product.ratingsCount + rating) / newRatingsCount;

    await Product.updateOne(
      { productId },
      { rating: newRating, ratingsCount: newRatingsCount }
    );

    return NextResponse.json(
      { message: "Review added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding review.", error: error.message },
      { status: 500 }
    );
  }
};

// Function to get filtered reviews
export const getFilteredReviews = async (filter, search) => {
  try {
    let dateFilter = {};
    let searchQuery = search
      ? { reviewer: { $regex: search, $options: "i" } } // Case-insensitive search by reviewer
      : {};

    // Handle different filter options
    if (filter === "1day") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      };
    } else if (filter === "7days") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };
    } else if (filter === "1month") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };
    }

    // If "all" is selected, return all reviews without filtering
    const reviews =
      filter === "all"
        ? await Review.find(searchQuery)
        : await Review.find({ ...searchQuery, ...dateFilter });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching filtered reviews" },
      { status: 500 }
    );
  }
};

// Update review
export const updateReview = async (request, id) => {
  const updatedData = await request.json();

  try {
    // Use findOneAndUpdate to find by review ID
    const updatedReview = await Review.findOneAndUpdate(
      { _id: id }, // Adjusted to match the `id` field
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReview) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Review updated successfully", review: updatedReview },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update review", error: error.message },
      { status: 500 }
    );
  }
};

// Function to delete a review
export const deleteReview = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { reviewId } = decryptedData;
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    // Optionally, update the product's rating and ratingsCount
    const product = await Product.findOne({
      productId: deletedReview.productId,
    });

    if (product) {
      const newRatingsCount = product.ratingsCount - 1;

      // Calculate new rating if there are still reviews
      const newRating =
        newRatingsCount > 0
          ? (product.rating * product.ratingsCount - deletedReview.rating) /
            newRatingsCount
          : 0;

      await Product.updateOne(
        { productId: deletedReview.productId },
        { rating: newRating, ratingsCount: newRatingsCount }
      );
    }

    return NextResponse.json(
      { message: "Review deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting review", error: error.message },
      { status: 500 }
    );
  }
};

/*---------------------------------------
 Order's            
-----------------------------------------*/

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

// Email template function
const sendOrderEmail = (
  userEmail,
  userName,
  products,
  totalAmount,
  orderId
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="text-align: center; color: #333333;">Your Order Has Been Delivered!</h2>
      <p style="color: #555555; text-align: center;">Dear ${userName}, your order with ID <strong>${orderId}</strong> has been delivered. Thank you for shopping with us!</p>

      <p style="color: #555555; text-align: center;">We appreciate your business. Below are the details of your order:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; text-align: center;">Quantity</th>
            <th style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product) => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
                    <img src="${product.imageUrl}" alt="${product.name}" style="width: 80px; height: auto; margin-right: 10px; vertical-align: middle;"/>  
                    <span style="vertical-align: middle;"><strong>${product.name}</strong></span>
                  </td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: center;">${product.quantity}</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: right;">₹${product.price}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top: 20px; text-align: right; font-size: 18px; color: #333333;"><strong>Total Amount:</strong></td>
            <td style="padding-top: 20px; text-align: right; font-size: 18px; color: #333333;"><strong>₹${totalAmount}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 30px; color: #555555; text-align: center;">
        We hope you enjoy your purchase! If you have any questions or need assistance, feel free to contact our support team.
      </p>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://yourstore.com" style="text-decoration: none; color: white; background-color: #007bff; padding: 10px 20px; border-radius: 5px;">Visit Our Store</a>
      </div>

      <footer style="margin-top: 40px; text-align: center; color: #aaaaaa; font-size: 12px;">
        <p>Your Store, 123 Street, City, Country</p>
        <p>© 2024 Your Store. All Rights Reserved.</p>
      </footer>
    </div>
  `;
};

// Function to get orders for a user
export async function getOrders(request) {
  await dbConnect();
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  try {
    // Check if the request includes an orderId
    if (orderId) {
      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ order }, { status: 200 });
    }

    // Fetch all orders if no orderId is provided
    const orders = await Order.find();
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}

// Update order status function
export const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId }, // Search for the order using the orderId field
      { orderStatus }, // Update the order status
      { new: true } // Return the updated document
    );

    // Check if the order was found
    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Send email notification if the order status is 'delivered'
    if (orderStatus === "delivered") {
      const userEmail = updatedOrder.email; // Assuming you have the user's email in the order
      const userName = updatedOrder.delivery.fullName; // Assuming you have the user's name in the order
      const products = updatedOrder.products; // Assuming you have an array of products in the order
      const totalAmount = updatedOrder.totalAmount; // Assuming you have the total amount in the order

      // 2. Send confirmation email (only in production)
      if (process.env.NODE_ENV === "production") {
        const mailOptionsForUser = {
          from: process.env.MAIL_USER,
          to: userEmail,
          subject: `Your Order has been Delivered! (Order ID: ${orderId})`,
          html: sendOrderEmail(
            userEmail,
            userName,
            products,
            totalAmount,
            orderId
          ),
        };

        await transporter.sendMail(mailOptionsForUser);
      }
    }

    // Return the updated order response
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

/*---------------------------------------
 User's            
-----------------------------------------*/

// Get single user
export const getSingleUser = async (request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { error: "User ID not provided" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "User data successfully retrieved", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user: ${error.message}` },
      { status: 500 }
    );
  }
};

// Get users with search, role filter, and pagination
export const getUsers = async (request) => {
  console.log(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";
  const pageRange = url.searchParams.get("pageRange") || "0-25";
  const page = parseInt(url.searchParams.get("page") || "1");

  const [rangeStart, rangeEnd] = pageRange.split("-").map(Number);
  const pageSize = rangeEnd - rangeStart + 1;

  const query = {};

  if (search) query.name = { $regex: search, $options: "i" };
  if (role && role !== "all") query.role = role;

  const skip = (page - 1) * pageSize;

  try {
    const users = await User.find(query).skip(skip).limit(pageSize);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
};

// Function to delete a user
export const deleteUser = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const userId = decryptedData.userId;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "User deleted successfully", deletedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
};

/*---------------------------------------
 Product's            
-----------------------------------------*/

// Get single product
export const getSingleProduct = async (request) => {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  // Validate productId
  if (!productId) {
    return NextResponse.json(
      { error: "Product ID not provided" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const product = await Product.findOne({ productId: productId });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "product data successfully retrieved", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching product: ${error.message}` },
      { status: 500 }
    );
  }
};

// Get products by category and search query with pagination
export const getProducts = async (request) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const searchQuery = url.searchParams.get("searchQuery");
  const page = parseInt(url.searchParams.get("page") || "1"); // Default to page 1
  const pageSize = 20;

  const query = {};

  if (category) query.category = category;
  if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };

  const skip = (page - 1) * pageSize;

  try {
    // Fetch products with pagination
    const products = await Product.find(query).skip(skip).limit(pageSize);
    // Total product count for pagination
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json(
      { products, totalPages, currentPage: page },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
};

// Update product
export const updateProduct = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { productId, productData } = decryptedData;

    // Use findOneAndUpdate to find by productId
    const updatedProduct = await Product.findOneAndUpdate(
      { productId: productId },
      productData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update product", error: error.message },
      { status: 500 }
    );
  }
};

// Delete product
export const deleteProduct = async (req) => {
  const decryptedData = await decryptHandler(req);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productId = decryptedData.productId;
    const deletedProduct = await Product.findOneAndDelete(
      { productId: productId },
      { session }
    );

    if (!deletedProduct) {
      await session.abortTransaction(); // Abort if product not found
      session.endSession();
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Remove the product from all user carts and favorites by productId
    const result = await User.updateMany(
      {
        $or: [
          // { "cartItem.productId": productId },
          { "favoriteItem.productId": productId },
        ],
      },
      {
        $pull: {
          cartItem: { productId },
          favoriteItem: { productId },
        },
      },
      { session }
    );

    if (result.modifiedCount > 0) {
      console.log(
        "Product removed from user carts and favorites successfully."
      );
    } else {
      console.log("No users had this product in their cart or favorites.");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message:
          "Product and user's cart and favorite items deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      {
        message: "Failed to delete product or cart/favorite items",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Update stock
export const updateStock = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { productId, stock } = decryptedData;

    // Start a MongoDB session for the operation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedProduct = await Product.findOneAndUpdate(
        { productId },
        { stock },
        { new: true, session }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

      // Update stock in users' cart items
      const result = await User.updateMany(
        { "cartItem.productId": productId },
        { $set: { "cartItem.$[elem].stock": stock } }, // Update stock field
        {
          arrayFilters: [{ "elem.productId": productId }], // Match specific product in array
          session,
        }
      );

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        {
          message: `${result.modifiedCount} user(s) updated with new stock status for product ${productId}.`,
          updatedProduct,
        },
        { status: 200 }
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating stock", error: error.message },
      { status: 500 }
    );
  }
};
