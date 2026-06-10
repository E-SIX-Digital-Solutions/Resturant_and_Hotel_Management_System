import type { FoodFilters, FoodItem } from "../types";
import { apiRequest, buildQueryString, getAuthHeaders } from "./client";

export const foodKeys = {
  all: ["foods"] as const,
  list: (filters?: FoodFilters) =>
    ["foods", filters?.category ?? "all", filters?.search ?? ""] as const,
};

export const fetchFoods = (filters?: FoodFilters) =>
  apiRequest<FoodItem[]>(
    `/foods${buildQueryString({
      category: filters?.category !== "all" ? filters?.category : undefined,
      search: filters?.search,
    })}`,
  );

export const createFood = (formData: FormData) =>
  apiRequest<FoodItem>("/foods", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

export const updateFood = (id: string, formData: FormData) =>
  apiRequest<FoodItem>(`/foods/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });

export const deleteFood = (id: string) =>
  apiRequest<void>(`/foods/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

export const toggleFoodAvailability = (id: string, isAvailable: boolean) =>
  apiRequest<FoodItem>(`/foods/${id}/availability`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isAvailable }),
  });

export const buildFoodFormData = (
  payload: {
    nameEn: string;
    nameAm: string;
    price: number;
    category: string;
    descEn: string;
    descAm: string;
    ingEn: string[];
    ingAm: string[];
    isAvailable: boolean;
    preparationTime: number;
    imageFile?: File | null;
    imageUrl?: string;
  },
) => {
  const formData = new FormData();
  formData.append("nameEn", payload.nameEn);
  formData.append("nameAm", payload.nameAm);
  formData.append("price", String(payload.price));
  formData.append("descEn", payload.descEn);
  formData.append("descAm", payload.descAm);
  formData.append("ingEn", JSON.stringify(payload.ingEn));
  formData.append("ingAm", JSON.stringify(payload.ingAm));
  formData.append("category", payload.category);
  formData.append("isAvailable", String(payload.isAvailable));
  formData.append("preparationTime", String(payload.preparationTime));

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  } else if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }

  return formData;
};
