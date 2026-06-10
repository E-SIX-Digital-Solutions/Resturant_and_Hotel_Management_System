import Category from "../models/Category.js";
import Food from "../models/Food.js";
import { slugify } from "../utils/slug.js";

const buildUniqueSlug = async (nameEn, excludeId = null) => {
  const baseSlug = slugify(nameEn);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Category.findOne(query);
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const createCategory = async (categoryData) => {
  const normalizedData = {
    nameEn: categoryData.nameEn?.trim(),
    nameAm: categoryData.nameAm?.trim() || "",
    slug: slugify(categoryData.slug || categoryData.nameEn),
  };

  normalizedData.slug = await buildUniqueSlug(normalizedData.nameEn);

  const existing = await Category.findOne({
    nameEn: { $regex: new RegExp(`^${normalizedData.nameEn}$`, "i") },
  });

  if (existing) {
    throw new Error("Category with this English name already exists");
  }

  const category = new Category(normalizedData);
  await category.save();
  return category;
};

export const getAllCategories = async () => {
  return Category.aggregate([
    { $sort: { nameEn: 1 } },
    {
      $lookup: {
        from: Food.collection.name,
        localField: "_id",
        foreignField: "category",
        as: "foods",
      },
    },
    {
      $addFields: {
        count: { $size: "$foods" },
      },
    },
    {
      $project: {
        foods: 0,
      },
    },
  ]);
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const getCategoryBySlugOrId = async (value) => {
  if (!value || value === "all") {
    return null;
  }

  let category = await Category.findOne({ slug: value });

  if (!category && value.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(value);
  }

  return category;
};

export const updateCategory = async (id, categoryData) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  if (categoryData.nameEn) {
    category.nameEn = categoryData.nameEn.trim();
    category.slug = await buildUniqueSlug(category.nameEn, id);
  }

  if (categoryData.nameAm !== undefined) {
    category.nameAm = categoryData.nameAm.trim();
  }

  if (categoryData.slug) {
    category.slug = await buildUniqueSlug(categoryData.slug, id);
  }

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  const foods = await Food.find({ category: id });

  if (foods.length > 0) {
    throw new Error("Cannot delete category with associated foods");
  }

  await category.deleteOne();
  return category;
};
