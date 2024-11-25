import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    ref: "Product", // Reference to Product model
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add compound index to ensure unique combination of orderId and productId
ReviewSchema.index({ orderId: 1, productId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
