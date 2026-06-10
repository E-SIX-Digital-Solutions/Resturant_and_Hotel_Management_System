"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import { fetchOrdersByTable, orderKeys } from "@/lib/api/orders";
import { POLL_ORDERS_MS } from "@/lib/pollIntervals";
import Spinner from "@/components/common/spinner";
import {
  Clock,
  ChefHat,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

export default function TrackingPage() {
  const { t, language } = useLanguage();
  const { currentActiveOrderId, trackedTableNumber } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: orderKeys.byTable(trackedTableNumber || ""),
    queryFn: () => fetchOrdersByTable(trackedTableNumber!),
    enabled: Boolean(trackedTableNumber),
    refetchInterval: POLL_ORDERS_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    function updateSelectedOrder(currentActiveOrderId: string) {
      setSelectedOrderId(currentActiveOrderId);
    }

    if (currentActiveOrderId) {
      updateSelectedOrder(currentActiveOrderId);
    } else if (orders.length > 0) {
      updateSelectedOrder(orders[0]._id);
    }
  }, [currentActiveOrderId, orders]);

  const order = orders.find(
    (o) => o._id === selectedOrderId || o.id === selectedOrderId,
  );

  const getStepStatus = (
    status: "pending" | "preparing" | "ready",
    step: number,
  ) => {
    const statusMap = { pending: 1, preparing: 2, ready: 3 };
    const currentStep = statusMap[status];

    if (currentStep > step) return "completed";
    if (currentStep === step) return "active";
    return "upcoming";
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          {t("trackingTitle")}
        </h1>
        <div className="mt-2 h-1 w-16 bg-linear-to-r from-amber-500 to-orange-500 rounded-full mx-auto" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length > 0 && order ? (
        <div className="space-y-8">
          {orders.length > 1 && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                Select Order to Track:
              </label>
              <select
                value={selectedOrderId || ""}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {orders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.orderNumber || o.id} ({o.tableNumber}) -{" "}
                    {t(
                      `status${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`,
                    )}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800/40 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-8 dark:border-slate-800/40 gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                  {t("orderedAt")} {order.orderTime}
                </span>
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {t("orderNo")} {order.orderNumber || order.id}
                </h2>
              </div>
              <div className="rounded-full bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                {t("tableNumLabel")}:{" "}
                <span className="text-amber-600 dark:text-amber-500 font-extrabold">
                  {order.tableNumber}
                </span>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {[1, 2, 3].map((step) => {
                const stepStatus = getStepStatus(order.status, step);
                const icons = [Clock, ChefHat, CheckCircle];
                const titles = [
                  t("statusPending"),
                  t("statusPreparing"),
                  t("statusReady"),
                ];
                const descs = [
                  t("statusPendingDesc"),
                  t("statusPreparingDesc"),
                  t("statusReadyDesc"),
                ];
                const Icon = icons[step - 1];

                return (
                  <div key={step} className="relative">
                    <span
                      className={`absolute -left-9 sm:-left-11 flex h-6 w-6 items-center justify-center rounded-full border ring-4 ring-white dark:ring-slate-900 transition-all ${
                        stepStatus === "completed"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : stepStatus === "active"
                            ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                            : "bg-white border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-800"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div
                      className={stepStatus === "upcoming" ? "opacity-50" : ""}
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {titles[step - 1]}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                        {descs[step - 1]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-amber-500" />
              {t("itemsOrdered")}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {order.items.map((item, idx) => {
                const name =
                  language === "en" ? item.nameEn : item.nameAm || item.nameEn;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Image
                      src={item.image}
                      alt={name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      fill
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-950 dark:text-slate-100 truncate">
                        {name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {item.price} ETB x {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {item.subtotal ?? item.price * item.quantity} ETB
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800/40 mt-4 pt-3 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>{t("totalPrice")}</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                {order.totalPrice} ETB
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/menu"
              className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-6 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors"
            >
              <span>{t("viewMenuBtn")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 text-center dark:border-slate-800 max-w-xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
            {t("trackingTitle")}
          </h3>
          <p className="mt-2 text-xs text-slate-400 max-w-xs dark:text-slate-500">
            {t("noActiveOrders")}
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-bold text-white hover:scale-102 transition-all shadow-md"
          >
            {t("viewMenuBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}
