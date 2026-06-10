"use client";

import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { fetchDashboardStats, adminKeys } from "@/lib/api/admin";
import { fetchOrders, orderKeys } from "@/lib/api/orders";
import { POLL_ORDERS_MS, POLL_STATS_MS } from "@/lib/pollIntervals";
import { FileSpreadsheet } from "lucide-react";
import type { AdminTab } from "./types";

interface AdminDashboardSectionProps {
  onNavigate: (tab: AdminTab) => void;
}

export default function AdminDashboardSection({
  onNavigate,
}: AdminDashboardSectionProps) {
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: adminKeys.stats,
    queryFn: fetchDashboardStats,
    refetchInterval: POLL_STATS_MS,
    refetchIntervalInBackground: true,
  });

  const { data: orders = [] } = useQuery({
    queryKey: orderKeys.all,
    queryFn: fetchOrders,
    refetchInterval: POLL_ORDERS_MS,
    refetchIntervalInBackground: true,
  });

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const completedOrders = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("totalOrdersToday")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalOrdersToday ?? 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("pendingOrdersCount")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-orange-500">
            {stats?.pendingOrders ?? pendingOrders}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("preparingOrdersCount")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-amber-500">
            {stats?.preparingOrders ?? preparingOrders}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("completedOrdersCount")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-emerald-500">
            {stats?.completedOrders ?? completedOrders}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/40 dark:bg-slate-900">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
            {t("simulatedRevenue")}
          </h3>
          <div className="flex items-center justify-between p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                {t("totalPrice")}
              </span>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.totalRevenue ?? 0}{" "}
                <span className="text-lg font-semibold">ETB</span>
              </h4>
            </div>
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/40 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-3">
              Quick Actions
            </h3>
          </div>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => onNavigate("orders")}
              className="w-full flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors"
            >
              Go to Kitchen Queue
            </button>
            <button
              onClick={() => onNavigate("menu")}
              className="w-full flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {t("addNewFoodBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
