import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // Auto-generate a unique productId
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: { type: Number, default: 1 },
  stock: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }, // Average rating
  ratingsCount: { type: Number, default: 0 }, // Number of ratings
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
