import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import User from "@/server/models/userModal";
import Product from "../models/productModel";
import Order from "../models/orderModel";
import mongoose from "mongoose";
import crypto from "crypto";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

const sendOrderEmail = (email, name, products, totalAmount) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="text-align: center; color: #333333;">Thank you for your purchase, ${name}!</h2>
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
        We hope you enjoy your purchase! If you have any questions, feel free to contact our support team.
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

const receiptId = () => {
  return `order_rcptid_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Initialize variables to track the last timestamp and order counter
let lastOrderTime = null;
let orderCounter = 0;

// Function to generate unique order ID
const genOrderId = () => {
  const currentTime = Date.now();

  // If the current time is the same as the last order time, increment the counter
  if (currentTime === lastOrderTime) {
    orderCounter++;
  } else {
    // If it's a new time, reset the counter
    lastOrderTime = currentTime;
    orderCounter = `${Math.floor(Math.random() * 100)}`;
  }

  // Return the order ID with the current time and the counter to ensure uniqueness
  return `${currentTime}${orderCounter}`;
};

export const genOrder = async (req) => {
  try {
    const { amount, products } = await req.json();

    const unavailableProducts = [];
    const removedProductIds = [];

    // Use for...of loop to handle async operations properly
    for (const product of products) {
      const productId = product.productId;
      const existingProduct = await Product.findOne({ productId: productId });

      if (!existingProduct) {
        unavailableProducts.push(product.name);
      } else {
        removedProductIds.push(product.productId);
      }
    }

    // If any products were unavailable, return an error message and prevent order creation
    if (unavailableProducts.length > 0) {
      return NextResponse.json({
        status: false,
        message: `The following products are not available: ${unavailableProducts.join(
          ", "
        )}`,
      });
    }

    // Proceed to create Razorpay order only if all products are available
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Number(amount) * 100, // Amount in the smallest currency unit
      currency: "INR",
      receipt: receiptId(),
    };

    // Create Razorpay order
    const order = await instance.orders.create(options);

    return NextResponse.json(
      { status: true, order, removedProductIds },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: false, message: "Error creating order", error: error.message },
      { status: 500 }
    );
  }
};

export const verifyPayment = async (req) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      name,
      products,
      amount,
      address,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // console.log("sig received ", razorpay_signature);
    // console.log("sig generated ", expectedSignature);

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        status: false,
        message: "User not found",
      });
    }

    const unavailableProducts = [];
    const removedProductIds = [];

    // Use for...of loop to handle async operations properly
    for (const product of products) {
      const productId = product.productId;

      const existingProduct = await Product.findOne({ productId: productId });

      if (!existingProduct) {
        unavailableProducts.push(product.name);
      } else {
        // Filter out the cart item with the matching productId
        user.cartItem = user.cartItem.filter(
          (item) => !item.productId.equals(productId)
        );

        await user.save();
        // If product is available, push its productId to removedProductIds
        removedProductIds.push(product.productId);
      }
    }

    // If any products were unavailable, return an error message and prevent order creation
    if (unavailableProducts.length > 0) {
      return NextResponse.json({
        status: false,
        message: `🚨 The following products are not available: ${unavailableProducts.join(
          ", "
        )}`,
      });
    }

    // Payment signature verification
    if (expectedSignature === razorpay_signature) {
      // 1. Create Order after successful payment
      const newOrder = new Order({
        orderId: genOrderId(),
        userId: user._id,
        email: email,
        products: products.map((product) => ({
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          description: product.description,
          imageUrl: product.imageUrl,
          // category: product.category, // Additional fields if necessary
        })),
        totalAmount: amount,
        paymentStatus: "Paid", // Payment completed
        orderStatus: "placed", // You can update this later (e.g., Shipped, Delivered)
        delivery: address,
      });

      await newOrder.save();

      // 2. Send confirmation email (only in production)
      if (process.env.NODE_ENV === "production") {
        const mailOptionsForUser = {
          from: process.env.MAIL_USER,
          to: email,
          subject: "Your Order Confirmation",
          html: sendOrderEmail(email, name, products, amount),
        };

        await transporter.sendMail(mailOptionsForUser);
      }

      return NextResponse.json({
        status: true,
        message: "Payment verified and order created successfully",
        removedProductIds,
        orderId: newOrder._id, // Return the order ID for tracking purposes
      });
    } else {
      return NextResponse.json({
        status: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: "Error verifying payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
