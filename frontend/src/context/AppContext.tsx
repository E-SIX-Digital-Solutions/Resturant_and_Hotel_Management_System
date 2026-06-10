"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

type UserRole = "customer" | "admin";

interface AppContextType {
  cart: CartItem[];
  currentActiveOrderId: string | null;
  trackedTableNumber: string | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  addToCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  setCurrentActiveOrderId: (orderId: string | null) => void;
  setTrackedTableNumber: (tableNumber: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const savedCart = localStorage.getItem("hotel-order-cart");
  if (!savedCart) return [];
  try {
    return JSON.parse(savedCart) as CartItem[];
  } catch {
    return [];
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [currentActiveOrderId, setCurrentActiveOrderId] = useState<
    string | null
  >(null);
  const [trackedTableNumber, setTrackedTableNumber] = useState<string | null>(
    null,
  );
  const [userRole, setUserRole] = useState<UserRole>("customer");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedActiveOrder = localStorage.getItem("hotel-order-active-id");
    const savedTable = localStorage.getItem("hotel-order-table");
    const savedRole = localStorage.getItem("hotel-order-role") as UserRole;

    function updateCurrentActiveOrderId(savedActiveOrder: string | null) {
      setCurrentActiveOrderId(savedActiveOrder);
    }
    function updateTrackedTableNumber(savedTable: string | null) {
      setTrackedTableNumber(savedTable);
    }
    function updateUserRole(savedRole: UserRole) {
      setUserRole(savedRole);
    }

    if (savedActiveOrder) {
      updateCurrentActiveOrderId(savedActiveOrder);
    }
    if (savedTable) {
      updateTrackedTableNumber(savedTable);
    }
    if (savedRole) {
      updateUserRole(savedRole);
    }

    function updateMounted() {
      setMounted(true);
    }

    updateMounted();

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) =>
          console.error("PWA Service Worker registration failed:", err),
        );
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("hotel-order-cart", JSON.stringify(cart));
  }, [cart, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (currentActiveOrderId) {
      localStorage.setItem("hotel-order-active-id", currentActiveOrderId);
    } else {
      localStorage.removeItem("hotel-order-active-id");
    }
  }, [currentActiveOrderId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (trackedTableNumber) {
      localStorage.setItem("hotel-order-table", trackedTableNumber);
    } else {
      localStorage.removeItem("hotel-order-table");
    }
  }, [trackedTableNumber, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("hotel-order-role", userRole);
  }, [userRole, mounted]);

  const addToCart = (foodId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.foodId === foodId);
      if (existing) {
        return prev.map((item) =>
          item.foodId === foodId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { foodId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.foodId === foodId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.foodId !== foodId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        currentActiveOrderId,
        trackedTableNumber,
        userRole,
        setUserRole,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setCurrentActiveOrderId,
        setTrackedTableNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export type { CartItem } from "@/lib/types";
export type { FoodItem, Category, Order, OrderItem } from "@/lib/types";
