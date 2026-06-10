import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  note: {
    type: String,
    default: "",
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    tableNumber: {
      type: String,
      required: [true, "Please provide a table number"],
      trim: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
