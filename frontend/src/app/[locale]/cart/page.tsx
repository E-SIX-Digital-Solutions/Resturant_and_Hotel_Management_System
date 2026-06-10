"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import type { Order } from "@/lib/types";
import { fetchFoods, foodKeys } from "@/lib/api/foods";
import { createOrder, orderKeys } from "@/lib/api/orders";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCurrentActiveOrderId,
    setTrackedTableNumber,
  } = useApp();

  const [tableNumber, setTableNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const { data: foods = [], isLoading: isFoodsLoading } = useQuery({
    queryKey: foodKeys.all,
    queryFn: () => fetchFoods(),
    enabled: cart.length > 0,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setCurrentActiveOrderId(order._id);
      setTrackedTableNumber(order.tableNumber);
      clearCart();
      setPlacedOrder(order);
      queryClient.invalidateQueries({
        queryKey: orderKeys.byTable(order.tableNumber),
      });
    },
  });

  const cartDetails = cart
    .map((item) => {
      const food = foods.find(
        (f) => f.id === item.foodId || f._id === item.foodId,
      );
      if (!food) return null;
      return {
        ...food,
        quantity: item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const taxAndService = Math.round(subtotal * 0.15);
  const total = subtotal + taxAndService;

  const handlePlaceOrder = async () => {
    if (tableNumber.trim() === "") {
      setErrorMsg(t("tableRequiredError"));
      return;
    }

    if (cartDetails.length === 0) {
      return;
    }

    setErrorMsg("");

    try {
      await createOrderMutation.mutateAsync({
        tableNumber: tableNumber.trim(),
        items: cartDetails.map((item) => ({
          foodId: item.id || item._id,
          quantity: item.quantity,
        })),
      });
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : t("tableRequiredError"),
      );
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center">
        <div className="text-center rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800/40 dark:bg-slate-900 w-full animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle className="h-10 w-10 animate-bounce" />
          </div>

          <h1 className="mt-6 font-serif text-2xl font-black text-slate-900 dark:text-white">
            {t("orderSuccessTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("orderSuccessMsg")}
          </p>

          <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-left border border-slate-100 dark:border-slate-800/40 space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider">
                {t("orderNo")}
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {placedOrder.orderNumber || placedOrder.id}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider">
                {t("tableNumLabel")}
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {placedOrder.tableNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider">
                {t("orderedAt")}
              </span>
              <span className="text-slate-850 dark:text-slate-250 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {placedOrder.orderTime}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold">
              <span className="text-slate-800 dark:text-slate-200">
                {t("totalPrice")}
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {placedOrder.totalPrice} ETB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/tracking"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 active:scale-98 transition-all"
            >
              <span>{t("trackOrderBtn")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/menu"
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          {t("cartTitle")}
        </h1>
        <div className="mt-2 h-1 w-16 bg-linear-to-r from-amber-500 to-orange-500 rounded-full mx-auto" />
      </div>

      {cart.length > 0 && isFoodsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
          <p className="text-sm font-medium">{t("loadingOrders")}</p>
        </div>
      ) : cartDetails.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {cartDetails.map((item) => {
              const foodId = item.id || item._id;
              const name =
                language === "en" ? item.nameEn : item.nameAm || item.nameEn;
              return (
                <div
                  key={foodId}
                  className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800/40 dark:bg-slate-900"
                >
                  <Image
                    src={item.image}
                    alt={name}
                    className="h-16 w-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800"
                    width={100}
                    height={100}
                    unoptimized={item.image.startsWith("http://localhost")}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {name}
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold mt-0.5">
                      {item.price} ETB
                    </p>
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      onClick={() =>
                        updateCartQuantity(foodId, item.quantity - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-rose-500 dark:hover:bg-slate-800 transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(foodId, item.quantity + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-amber-600 dark:hover:bg-slate-800 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(foodId)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/40 dark:bg-slate-900">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800/40">
                {t("orderSummary")}
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{t("subtotal")}</span>
                  <span>{subtotal} ETB</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{t("taxFee")}</span>
                  <span>{taxAndService} ETB</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>{t("totalPrice")}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {total} ETB
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/40 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t("tableSelectionTitle")}
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    if (e.target.value.trim() !== "") setErrorMsg("");
                  }}
                  placeholder={t("tablePlaceholder")}
                  className={`w-full rounded-2xl border bg-slate-50 py-3.5 px-4 text-xs font-semibold focus:outline-hidden dark:bg-slate-950 transition-colors ${
                    errorMsg
                      ? "border-rose-300 focus:border-rose-500 dark:border-rose-900/60 dark:focus:border-rose-500"
                      : "border-slate-200 focus:border-amber-500 dark:border-slate-800 dark:focus:border-amber-500"
                  }`}
                />
                {errorMsg && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending}
                className="mt-6 w-full flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/10 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-70"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("placingOrder")}
                  </>
                ) : (
                  t("placeOrderBtn")
                )}
              </button>
            </div>
          </div>
        </div>
      ) : cart.length > 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-amber-200 text-center dark:border-amber-900/40 max-w-xl mx-auto">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Some cart items could not be loaded. Try clearing your cart and
            adding items again from the menu.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            {t("viewMenuBtn")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 text-center dark:border-slate-800 max-w-xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
            {t("cartTitle")} {t("unavailable")}
          </h3>
          <p className="mt-2 text-xs text-slate-400 max-w-xs dark:text-slate-500">
            {t("emptyCartMsg")}
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors"
          >
            {t("viewMenuBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}
