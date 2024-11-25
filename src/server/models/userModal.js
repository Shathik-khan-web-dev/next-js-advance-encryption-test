import mongoose from "mongoose";
import moment from "moment";
import ProductModal from "../models/productModel";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  image: String,
  role: {
    type: String,
    enum: ["admin", "employee", "visitor"],
    default: "visitor",
    required: true,
  },
  delivery: {
    userName: {
      type: String,
      default: "Empty",
    },
    phoneNumber: { type: Number, default: null },
    secondaryNumber: { type: Number, default: null },
    apartmentNumber: { type: Number, default: null },
    city: {
      type: String,
      default: "Empty",
    },
    state: {
      type: String,
      default: "Empty",
    },
    country: {
      type: String,
      default: "India",
    },
    streetAddress: {
      type: String,
      default: "Empty",
    },
    giftWrap: { type: Boolean, default: false },
    giftWrapMessage: {
      type: String,
      default: "Empty",
    },
  },
  cartItem: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      imageUrl: String,
      name: String,
      price: Number,
      oldPrice: Number,
      description: String,
      stock: Boolean,
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  favoriteItem: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      imageUrl: String,
      name: String,
      price: Number,
      oldPrice: Number,
      description: String,
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  usedCoupons: [
    {
      code: String,
      usedAt: {
        type: String,
        default: () => moment().format("dddd, YYYY-MM-DD hh:mm A"),
      },
    },
  ],
  ip: { type: String, required: true },
  city: { type: String },
  region: { type: String },
  country: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  createdAt: {
    type: String,
    default: () => moment().format("dddd, YYYY-MM-DD hh:mm A"),
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
