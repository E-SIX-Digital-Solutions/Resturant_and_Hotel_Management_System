import Joi from "joi";

export const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin").default("admin"),
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
    nameEn: Joi.string().required().trim(),
    nameAm: Joi.string().trim().allow(""),
    price: Joi.number().positive().required(),
    descEn: Joi.string().required(),
    descAm: Joi.string().trim().allow(""),
    descriptionEn: Joi.string(),
    descriptionAm: Joi.string().trim().allow(""),
    ingEn: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    ingAm: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    ingredients: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    allergensEn: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    allergensAm: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    category: Joi.string().required(),
    isAvailable: Joi.boolean().default(true),
    available: Joi.boolean(),
    preparationTime: Joi.number().positive().default(15),
    imageUrl: Joi.string().allow(""),
  });

  return schema.validate(data, { convert: true });
};

export const updateFoodValidation = (data) => {
  const schema = Joi.object({
    nameEn: Joi.string().trim(),
    nameAm: Joi.string().trim().allow(""),
    price: Joi.number().positive(),
    descEn: Joi.string(),
    descAm: Joi.string().trim().allow(""),
    descriptionEn: Joi.string(),
    descriptionAm: Joi.string().trim().allow(""),
    ingEn: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    ingAm: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    ingredients: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    allergensEn: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    allergensAm: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string(),
    ),
    category: Joi.string(),
    isAvailable: Joi.boolean(),
    available: Joi.boolean(),
    preparationTime: Joi.number().positive(),
    imageUrl: Joi.string().allow(""),
  });

  return schema.validate(data, { convert: true });
};

export const normalizeFoodPayload = (value) => {
  const parseList = (primary, fallback) => {
    if (primary === undefined && fallback === undefined) return undefined;
    const source = primary ?? fallback;
    if (Array.isArray(source)) return source;
    if (typeof source === "string" && source.trim() !== "") {
      try {
        const parsed = JSON.parse(source);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return source
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  return {
    ...(value.nameEn !== undefined ? { nameEn: value.nameEn } : {}),
    ...(value.nameAm !== undefined ? { nameAm: value.nameAm || "" } : {}),
    ...(value.price !== undefined ? { price: value.price } : {}),
    ...(value.descEn !== undefined || value.descriptionEn !== undefined
      ? { descEn: value.descEn || value.descriptionEn }
      : {}),
    ...(value.descAm !== undefined || value.descriptionAm !== undefined
      ? { descAm: value.descAm || value.descriptionAm || "" }
      : {}),
    ...(value.ingEn !== undefined || value.ingredients !== undefined
      ? { ingEn: parseList(value.ingEn, value.ingredients) }
      : {}),
    ...(value.ingAm !== undefined ? { ingAm: parseList(value.ingAm) } : {}),
    ...(value.allergensEn !== undefined
      ? { allergensEn: parseList(value.allergensEn) }
      : {}),
    ...(value.allergensAm !== undefined
      ? { allergensAm: parseList(value.allergensAm) }
      : {}),
    ...(value.category !== undefined ? { category: value.category } : {}),
    ...(value.isAvailable !== undefined || value.available !== undefined
      ? {
          isAvailable:
            value.isAvailable !== undefined
              ? value.isAvailable
              : value.available,
        }
      : {}),
    ...(value.preparationTime !== undefined
      ? { preparationTime: value.preparationTime }
      : {}),
  };
};

export const createCategoryValidation = (data) => {
  const schema = Joi.object({
    nameEn: Joi.string().required().trim(),
    nameAm: Joi.string().trim().allow(""),
    slug: Joi.string().trim(),
  });

  return schema.validate(data);
};

export const updateCategoryValidation = (data) => {
  const schema = Joi.object({
    nameEn: Joi.string().trim(),
    nameAm: Joi.string().trim().allow(""),
    slug: Joi.string().trim(),
  });

  return schema.validate(data);
};

export const createOrderValidation = (data) => {
  const schema = Joi.object({
    tableNumber: Joi.alternatives()
      .try(Joi.string().trim().min(1), Joi.number().positive())
      .required(),
    items: Joi.array()
      .items(
        Joi.object({
          food: Joi.string(),
          foodId: Joi.string(),
          quantity: Joi.number().integer().min(1).required(),
          note: Joi.string().allow("").default(""),
        }).or("food", "foodId"),
      )
      .min(1)
      .required(),
    notes: Joi.string().allow("").default(""),
  });

  return schema.validate(data, { convert: true });
};

export const updateOrderStatusValidation = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid("Pending", "Preparing", "Ready", "pending", "preparing", "ready")
      .required(),
  });

  return schema.validate(data);
};
