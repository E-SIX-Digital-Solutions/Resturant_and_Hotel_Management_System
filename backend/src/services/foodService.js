import mongoose from "mongoose";
import Food from "../models/Food.js";
import { getCategoryBySlugOrId } from "./categoryService.js";

export const createFood = async (foodData, imageUrl) => {
  const food = new Food({
    ...foodData,
    image: imageUrl,
  });

  await food.save();
  return food.populate("category");
};

export const updateFood = async (id, foodData, imageUrl = null) => {
  const food = await Food.findById(id);

  if (!food) {
    throw new Error("Food not found");
  }

  Object.assign(food, foodData);
  if (imageUrl) {
    food.image = imageUrl;
  }

  await food.save();
  return food.populate("category");
};

export const deleteFood = async (id) => {
  const food = await Food.findByIdAndDelete(id);

  if (!food) {
    throw new Error("Food not found");
  }

  return food;
};

export const getFoodById = async (id) => {
  const food = await Food.findById(id).populate("category");

  if (!food) {
    throw new Error("Food not found");
  }

  return food;
};

export const getAllFoods = async ({ category, search } = {}) => {
  const query = {};

  if (category && category !== "all") {
    const matchedCategory = await getCategoryBySlugOrId(category);

    if (matchedCategory) {
      query.category = matchedCategory._id;
    } else if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }
  }

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { nameEn: regex },
      { nameAm: regex },
      { descEn: regex },
      { descAm: regex },
      { ingEn: regex },
      { ingAm: regex },
    ];
  }

  return Food.find(query).populate("category").sort({ createdAt: -1 });
};

export const getFoodsByCategory = async (categoryId) => {
  const matchedCategory = await getCategoryBySlugOrId(categoryId);
  const categoryFilter = matchedCategory?._id || categoryId;

  return Food.find({ category: categoryFilter })
    .populate("category")
    .sort({ createdAt: -1 });
};

export const updateFoodAvailability = async (id, isAvailable) => {
  const food = await Food.findByIdAndUpdate(
    id,
    { isAvailable },
    { new: true },
  ).populate("category");

  if (!food) {
    throw new Error("Food not found");
  }

  return food;
};
