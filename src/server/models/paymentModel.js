const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    paymentID: {
      type: String,
      required: true,
    },
    orderID: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
module.exports = PaymentModel;
