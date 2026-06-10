export interface ApiValidationError {
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiValidationError[] | null;
}

export interface Category {
  _id: string;
  id: string;
  nameEn: string;
  nameAm: string;
  slug: string;
  count?: number;
}

export interface FoodItem {
  _id: string;
  id: string;
  nameEn: string;
  nameAm: string;
  price: number;
  category: string;
  categoryId?: string;
  categoryNameEn?: string;
  categoryNameAm?: string;
  image: string;
  descEn: string;
  descAm: string;
  ingEn: string[];
  ingAm: string[];
  isAvailable: boolean;
  preparationTime: number;
  allergensEn: string[];
  allergensAm: string[];
}

export interface CartItem {
  foodId: string;
  quantity: number;
}

export interface OrderItem {
  foodId: string;
  nameEn: string;
  nameAm: string;
  price: number;
  quantity: number;
  image: string;
  note?: string;
  subtotal?: number;
}

export type OrderStatus = "pending" | "preparing" | "ready";

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  totalPrice: number;
  tableNumber: string;
  orderTime: string;
  createdAt?: string;
  status: OrderStatus;
  notes?: string;
}

export interface DashboardStats {
  totalOrdersToday: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export interface FoodFilters {
  category?: string;
  search?: string;
}

export interface CreateOrderPayload {
  tableNumber: string;
  items: Array<{ foodId: string; quantity: number; note?: string }>;
  notes?: string;
}

export interface CategoryInput {
  nameEn: string;
  nameAm: string;
}
