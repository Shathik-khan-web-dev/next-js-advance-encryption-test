import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/userModal";
import Product from "../models/productModel";
import Review from "../models/reviewModel";
import mongoose from "mongoose";
import {
  decryptHandler,
  getDecryptHandler,
} from "@/server/utils/decryptHandler";
import { NextResponse } from "next/server";

// getUserReviews controller
export const getUserReviews = async (request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID not provided" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const reviews = await Review.find({ userId });
    return NextResponse.json(
      { message: "User reviews retrieved successfully", reviews },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error retrieving user reviews", error: error.message },
      { status: 500 }
    );
  }
};

// addReview
export const addReview = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const {
      orderId,
      userId,
      productId,
      reviewText,
      rating,
      userName,
      userImage,
    } = decryptedData;

    if (
      !orderId ||
      !reviewText ||
      !rating ||
      !productId ||
      !userId ||
      !userName ||
      !userImage
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // If productId is an array, create multiple reviews
    if (Array.isArray(productId)) {
      const reviews = productId.map((prodId) => ({
        productId: prodId,
        userId,
        orderId,
        reviewText,
        rating,
        userName,
        userImage,
      }));

      const result = await Review.insertMany(reviews, { ordered: false });
    } else {
      // If productId is a single value, create just one review
      const review = new Review({
        productId,
        userId,
        orderId,
        reviewText,
        rating,
        userName,
        userImage,
      });

      // Save the single review
      const result = await review.save();
    }

    // Return success message
    return NextResponse.json(
      { message: "Reviews added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding reviews", error: error.message },
      { status: 500 }
    );
  }
};

// Apply coupon code
export const applyCoupon = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { email, couponCode } = decryptedData;

    if (!couponCode || !email) {
      return NextResponse.json(
        { message: "Coupon code and email are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Ensure usedCoupons is initialized
    if (!user.usedCoupons) {
      user.usedCoupons = [];
    }

    // Check if the coupon was already used
    const couponUsed = user.usedCoupons.some(
      (coupon) => coupon.code === couponCode
    );

    if (couponUsed) {
      return NextResponse.json({ message: "Coupon already used." });
    }

    // Apply the coupon codes and their corresponding discounts
    let discountAmount = 0;
    if (couponCode === "FIRST-10") {
      discountAmount = 0.1; // 10% discount
    } else if (couponCode === "SECOND-05") {
      discountAmount = 0.05; // 5% discount
    }

    if (discountAmount > 0) {
      // Update the user's usedCoupons
      user.usedCoupons.push({ code: couponCode, usedAt: new Date() });
      await user.save();

      return NextResponse.json(
        {
          message: `Coupon code applied! You get ${discountAmount * 100}% off.`,
          discountAmount: discountAmount,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid coupon code." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error applying coupon", error: error.message },
      { status: 500 }
    );
  }
};

// Cart
export const addProductToCart = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const {
      email,
      productId,
      imageUrl,
      name,
      price,
      oldPrice,
      stock,
      description,
    } = decryptedData;

    if (!email || !productId) {
      return NextResponse.json(
        { message: "Missing email or productId" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.cartItem) {
      user.cartItem = [];
    }

    // Check if the cart already has 15 items
    if (user.cartItem.length >= 15) {
      return NextResponse.json(
        {
          message: "Add to cart is full. You cannot add more than 15 products.",
        },
        { status: 400 }
      );
    }

    const objectIdProductId = new mongoose.Types.ObjectId(productId);

    const existingCartItem = user.cartItem.find((item) =>
      item.productId.equals(objectIdProductId)
    );

    let alreadyAdded = false;

    if (existingCartItem) {
      alreadyAdded = true;
    } else {
      user.cartItem.push({
        productId: objectIdProductId,
        imageUrl,
        name,
        price,
        oldPrice,
        stock: stock || false,
        description,
        quantity: 1,
      });

      await user.save();
    }

    return NextResponse.json(
      { message: "Product added to cart successfully", alreadyAdded },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add product to cart", error: error.message },
      { status: 500 }
    );
  }
};

export const getCart = async (req) => {
  const decryptedData = await getDecryptHandler(req);
  console.log(decryptedData);

  try {
    const { email } = decryptedData;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email not provided" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user || user.cartItem.length === 0) {
      return NextResponse.json({ cart: [] });
    }

    return NextResponse.json({ cart: user.cartItem });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error.message },
      { status: 500 }
    );
  }
};

export const updateCartProductQuantity = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { email, productId, quantity } = decryptedData;

    if (!email || !productId || !quantity) {
      return NextResponse.json(
        { message: "Missing email, productId, or quantity" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const objectIdProductId = new mongoose.Types.ObjectId(productId);
    const cartItem = user.cartItem.find((item) =>
      item.productId.equals(objectIdProductId)
    );

    if (!cartItem) {
      return NextResponse.json(
        { message: "Product not found in cart" },
        { status: 404 }
      );
    }

    // Update only the quantity without modifying the price
    cartItem.quantity = quantity;

    await user.save();

    return NextResponse.json(
      { message: "Quantity updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update quantity", error: error.message },
      { status: 500 }
    );
  }
};

export const removeProductFromCart = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { email, productId } = decryptedData;

    if (!email || !productId) {
      return NextResponse.json(
        { message: "Missing email or productId" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Filter out the cart item with the matching productId
    user.cartItem = user.cartItem.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    return NextResponse.json(
      { message: "Product removed from cart successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to remove product from cart", error: error.message },
      { status: 500 }
    );
  }
};

// Favorite
export const addProductToFavorite = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { email, productId, imageUrl, name, price, oldPrice, description } =
      decryptedData;

    if (!email || !productId) {
      return NextResponse.json(
        { message: "Missing email or productId" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.favoriteItem) {
      user.favoriteItem = [];
    }

    // Check if the favoriteItem array already has 20 items
    if (user.favoriteItem.length >= 20) {
      return NextResponse.json(
        {
          message:
            "Favorite list is full. You cannot add more than 20 products.",
        },
        { status: 400 }
      );
    }

    const objectIdProductId = new mongoose.Types.ObjectId(productId);

    const existingFavoriteItem = user.favoriteItem.find((item) =>
      item.productId.equals(objectIdProductId)
    );
    let alreadyAdded = false;

    if (existingFavoriteItem) {
      alreadyAdded = true;
    } else {
      user.favoriteItem.push({
        productId: objectIdProductId,
        imageUrl,
        name,
        price,
        oldPrice,
        description,
      });

      await user.save();
    }

    return NextResponse.json(
      { message: "Product added to favorites successfully", alreadyAdded },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add product to favorites", error: error.message },
      { status: 500 }
    );
  }
};

export const getFavorite = async (req) => {
  const decryptedData = await getDecryptHandler(req);

  try {
    const { email } = decryptedData;

    if (!email) {
      return NextResponse.json(
        { message: "Email not provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Populate FavoriteItem.productId
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ favorite: user.favoriteItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch favorite", error: error.message },
      { status: 500 }
    );
  }
};

export const removeProductFromFavorite = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const { email, productId } = decryptedData;

    if (!email || !productId) {
      return NextResponse.json(
        { message: "Missing email or productId" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Filter out the cart item with the matching productId
    user.favoriteItem = user.favoriteItem.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    return NextResponse.json(
      { message: "Product removed from favorites successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to remove product from favorites",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Address
export const addAddress = async (req) => {
  const decryptedData = await decryptHandler(req);

  try {
    const {
      fullName,
      email,
      phone,
      secondaryPhone,
      apartmentNumber,
      city,
      state,
      country,
      streetAddress,
      giftWrap,
      giftMessage,
    } = decryptedData;

    if (
      !fullName ||
      !email ||
      !phone ||
      !apartmentNumber ||
      !city ||
      !state ||
      !streetAddress
    ) {
      return NextResponse.json(
        { message: "All required fields must be filled out." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Update the user's address fields
    user.delivery = {
      userName: fullName,
      phoneNumber: phone,
      secondaryNumber: secondaryPhone,
      apartmentNumber,
      city,
      state,
      country: country || "India",
      streetAddress,
      giftWrap: giftWrap || false,
      giftWrapMessage: giftMessage || "",
    };

    await user.save();

    return NextResponse.json(
      {
        message: "Address updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while updating the address",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const getAddress = async (req) => {
  const decryptedData = await getDecryptHandler(req);

  try {
    const { email } = decryptedData;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email not provided" },
        { status: 400 }
      );
    }

    const address = await User.findOne({ email: email });
    return NextResponse.json(
      { message: "GetAddress Data SuccessFully", address },
      { status: 200 }
    );
  } catch (error) {
    throw new Error("Error fetching address data");
  }
};
