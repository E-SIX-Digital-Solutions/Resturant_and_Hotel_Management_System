import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: [true, "Please provide a category name in English"],
      unique: true,
      trim: true,
    },
    nameAm: {
      type: String,
      trim: true,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
