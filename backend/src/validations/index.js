import Joi from 'joi';

export const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin').default('admin'),
  });

  return schema.validate(data);
};

export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const createFoodValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    price: Joi.number().positive().required(),
    description: Joi.string().required(),
    ingredients: Joi.array().items(Joi.string()),
    category: Joi.string().required(),
    available: Joi.boolean().default(true),
  });

  return schema.validate(data);
};

export const updateFoodValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim(),
    price: Joi.number().positive(),
    description: Joi.string(),
    ingredients: Joi.array().items(Joi.string()),
    category: Joi.string(),
    available: Joi.boolean(),
  });

  return schema.validate(data);
};

export const createCategoryValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
  });

  return schema.validate(data);
};

export const createOrderValidation = (data) => {
  const schema = Joi.object({
    tableNumber: Joi.number().positive().required(),
    items: Joi.array()
      .items(
        Joi.object({
          food: Joi.string().required(),
          quantity: Joi.number().positive().required(),
          note: Joi.string().default(''),
          // `subtotal` is calculated server-side from food price × quantity
        })
      )
      .required(),
    // `totalPrice` is calculated server-side as the sum of item subtotals
    notes: Joi.string().default(''),
  });

  return schema.validate(data);
};

export const updateOrderStatusValidation = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('Pending', 'Preparing', 'Ready').required(),
  });

  return schema.validate(data);
};
