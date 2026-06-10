import type { DashboardStats, LoginResponse } from "../types";
import { apiRequest, getAuthHeaders } from "./client";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
};

export const loginAdmin = (email: string, password: string) =>
  apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logoutAdmin = () =>
  apiRequest<void>("/auth/logout", {
    method: "POST",
    headers: getAuthHeaders(),
  });

export const fetchDashboardStats = () =>
  apiRequest<DashboardStats>("/admin/stats", {
    headers: getAuthHeaders(),
  });
