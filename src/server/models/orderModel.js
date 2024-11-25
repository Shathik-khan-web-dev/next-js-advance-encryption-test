const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: {
    type: String,
    unique: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: {
    type: String,
    required: true,
  },
  products: [{ type: Object, required: true }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  orderStatus: { type: String, default: "Pending" },
  delivery: {
    fullName: {
      type: String,
      default: "Empty",
    },
    phone: { type: Number, default: null },
    secondaryPhone: { type: Number, default: null },
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
    giftMessage: {
      type: String,
      default: "Empty",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite error by checking if the model already exists
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
