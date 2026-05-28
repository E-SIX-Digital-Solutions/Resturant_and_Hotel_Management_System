import Category from '../models/Category.js';

export const createCategory = async (name) => {
  let category = await Category.findOne({ name });

  if (category) {
    throw new Error('Category already exists');
  }

  category = new Category({ name });
  await category.save();
  return category;
};

export const getAllCategories = async () => {
  const categories = await Category.find();
  return categories;
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

export const updateCategory = async (id, name) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};
