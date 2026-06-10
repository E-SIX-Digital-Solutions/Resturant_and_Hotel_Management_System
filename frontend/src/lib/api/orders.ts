import type { CreateOrderPayload, Order, OrderStatus } from "../types";
import { apiRequest, getAuthHeaders } from "./client";

export const orderKeys = {
  all: ["orders"] as const,
  byTable: (tableNumber: string) => ["orders", "table", tableNumber] as const,
  byId: (id: string) => ["orders", id] as const,
};

export const fetchOrders = () =>
  apiRequest<Order[]>("/orders", {
    headers: getAuthHeaders(),
  });

export const fetchOrdersByTable = (tableNumber: string) =>
  apiRequest<Order[]>(
    `/orders/table/${encodeURIComponent(tableNumber.trim())}`,
  );

export const fetchOrderById = (id: string) =>
  apiRequest<Order>(`/orders/${id}`);

export const createOrder = (payload: CreateOrderPayload) =>
  apiRequest<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({
      tableNumber: payload.tableNumber,
      items: payload.items.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        note: item.note || "",
      })),
      notes: payload.notes || "",
    }),
  });

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  apiRequest<Order>(`/orders/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

export const deleteOrder = (id: string) =>
  apiRequest<void>(`/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
