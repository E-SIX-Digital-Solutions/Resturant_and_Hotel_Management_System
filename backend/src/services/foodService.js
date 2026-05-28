import Food from '../models/Food.js';

export const createFood = async (foodData, imageUrl) => {
  const food = new Food({
    ...foodData,
    image: imageUrl,
  });

  await food.save();
  return food.populate('category');
};

export const updateFood = async (id, foodData, imageUrl = null) => {
  const food = await Food.findById(id);

  if (!food) {
    throw new Error('Food not found');
  }

  Object.assign(food, foodData);
  if (imageUrl) {
    food.image = imageUrl;
  }

  await food.save();
  return food.populate('category');
};

export const deleteFood = async (id) => {
  const food = await Food.findByIdAndDelete(id);

  if (!food) {
    throw new Error('Food not found');
  }

  return food;
};

export const getFoodById = async (id) => {
  const food = await Food.findById(id).populate('category');

  if (!food) {
    throw new Error('Food not found');
  }

  return food;
};

export const getAllFoods = async () => {
  const foods = await Food.find().populate('category');
  return foods;
};

export const getFoodsByCategory = async (categoryId) => {
  const foods = await Food.find({ category: categoryId }).populate('category');
  return foods;
};

export const updateFoodAvailability = async (id, available) => {
  const food = await Food.findByIdAndUpdate(
    id,
    { available },
    { new: true }
  ).populate('category');

  if (!food) {
    throw new Error('Food not found');
  }

  return food;
};
