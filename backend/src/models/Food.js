import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: [true, "Please provide a food name"],
      trim: true,
    },
    nameAm: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    descEn: {
      type: String,
      required: [true, "Please provide a description"],
    },
    descAm: {
      type: String,
      default: "",
    },
    ingEn: {
      type: [String],
      default: [],
    },
    ingAm: {
      type: [String],
      default: [],
    },
    allergensEn: {
      type: [String],
      default: [],
    },
    allergensAm: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Food", foodSchema);
