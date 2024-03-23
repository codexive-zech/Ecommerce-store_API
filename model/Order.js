const mongoose = require("mongoose");

const singleOrderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    }, // multiplication of price in the cart and the amount in the cart
    total: {
      type: Number,
      required: true,
    },
    orderItems: [singleOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "canceled", "delivered"],
      default: "pending",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIndentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
