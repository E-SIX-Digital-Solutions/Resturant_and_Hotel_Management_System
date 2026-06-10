import type { Category, CategoryInput } from "../types";
import { apiRequest, buildQueryString, getAuthHeaders } from "./client";

export const categoryKeys = {
  all: ["categories"] as const,
};

export const fetchCategories = () =>
  apiRequest<Category[]>("/categories");

export const createCategory = (payload: CategoryInput) =>
  apiRequest<Category>("/categories", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const updateCategory = (id: string, payload: CategoryInput) =>
  apiRequest<Category>(`/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const deleteCategory = (id: string) =>
  apiRequest<void>(`/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

export const categoryQueryKey = categoryKeys.all;
