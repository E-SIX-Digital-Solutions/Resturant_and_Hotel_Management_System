import { slugify } from "./slug.js";

const getApiBaseUrl = () =>
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

export const resolveImageUrl = (image) => {
  if (!image) {
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${base}${path}`;
};

export const formatCategory = (category) => {
  const doc = category?.toObject ? category.toObject() : category;
  if (!doc) return null;

  const id = doc._id?.toString();
  const count =
    typeof category?.count === "number"
      ? category.count
      : typeof doc.count === "number"
        ? doc.count
        : 0;

  return {
    _id: id,
    id,
    nameEn: doc.nameEn,
    nameAm: doc.nameAm || "",
    slug: doc.slug || slugify(doc.nameEn),
    count,
  };
};

export const formatFood = (food) => {
  const doc = food?.toObject ? food.toObject() : food;
  if (!doc) return null;

  const id = doc._id?.toString();
  const category = doc.category;
  const categoryObj =
    category && typeof category === "object" && category._id ? category : null;

  const categoryId = categoryObj
    ? categoryObj._id.toString()
    : category?.toString?.() || "";

  const categorySlug = categoryObj?.slug || slugify(categoryObj?.nameEn || "");

  return {
    _id: id,
    id,
    nameEn: doc.nameEn,
    nameAm: doc.nameAm || "",
    price: doc.price,
    category: categorySlug || categoryId,
    categoryId,
    categoryNameEn: categoryObj?.nameEn || "",
    categoryNameAm: categoryObj?.nameAm || "",
    image: resolveImageUrl(doc.image),
    descEn: doc.descEn || doc.descriptionEn || "",
    descAm: doc.descAm || doc.descriptionAm || "",
    ingEn: doc.ingEn?.length ? doc.ingEn : doc.ingredients || [],
    ingAm: doc.ingAm || [],
    allergensEn: doc.allergensEn || [],
    allergensAm: doc.allergensAm || [],
    isAvailable:
      doc.isAvailable !== undefined
        ? doc.isAvailable
        : doc.available !== undefined
          ? doc.available
          : true,
    preparationTime: doc.preparationTime ?? 15,
  };
};

const toClientStatus = (status) => {
  if (!status) return "pending";
  return status.toLowerCase();
};

export const formatOrderItem = (item) => {
  const doc = item?.toObject ? item.toObject() : item;
  const food = doc.food;
  const foodObj = food && typeof food === "object" && food._id ? food : null;

  return {
    foodId: foodObj?._id?.toString() || doc.food?.toString() || "",
    nameEn: foodObj?.nameEn || doc.nameEn || "",
    nameAm: foodObj?.nameAm || doc.nameAm || "",
    price: foodObj?.price ?? doc.price ?? 0,
    quantity: doc.quantity,
    image: resolveImageUrl(foodObj?.image || doc.image),
    note: doc.note || "",
    subtotal: doc.subtotal,
  };
};

export const formatOrder = (order) => {
  const doc = order?.toObject ? order.toObject() : order;
  if (!doc) return null;

  const id = doc._id?.toString();
  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();

  return {
    _id: id,
    id: doc.orderNumber || id,
    orderNumber: doc.orderNumber || id,
    items: (doc.items || []).map(formatOrderItem),
    subtotal: doc.subtotal ?? doc.totalPrice,
    serviceCharge: doc.serviceCharge ?? 0,
    totalPrice: doc.totalPrice,
    tableNumber: String(doc.tableNumber),
    orderTime: createdAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: doc.createdAt,
    status: toClientStatus(doc.status),
    notes: doc.notes || "",
  };
};

export const formatDashboardStats = (stats) => ({
  totalOrdersToday: stats.totalOrdersToday ?? 0,
  pendingOrders: stats.pendingOrders ?? 0,
  preparingOrders: stats.preparingOrders ?? 0,
  completedOrders: stats.completedOrders ?? 0,
  totalRevenue: stats.totalRevenue ?? 0,
});
