"use client";

import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { fetchOrders, orderKeys } from "@/lib/api/orders";
import { POLL_ORDERS_MS } from "@/lib/pollIntervals";
import {
  ClipboardList,
  FolderTree,
  LogOut,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import type { AdminTab } from "./types";
import type { AuthCopy } from "./authTranslations";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  authT: AuthCopy;
}

export default function AdminHeader({
  activeTab,
  onTabChange,
  onSignOut,
  authT,
}: AdminHeaderProps) {
  const { t } = useLanguage();

  const { data: orders = [] } = useQuery({
    queryKey: orderKeys.all,
    queryFn: fetchOrders,
    refetchInterval: POLL_ORDERS_MS,
    refetchIntervalInBackground: true,
  });

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing",
  ).length;

  const tabs = [
    ["dashboard", t("dashboardStats"), TrendingUp],
    ["orders", t("recentOrdersQueue"), ClipboardList],
    ["menu", t("foodManagement"), UtensilsCrossed],
    ["categories", t("categories"), FolderTree],
  ] as const;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/50 pb-6 mb-8 dark:border-slate-800/40 gap-4">
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <span>{authT.welcomeStaff}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </span>
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white mt-0.5">
          {t("brand")} {t("adminDashboard")}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {tabs.map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="inline-block h-3.5 w-3.5 mr-1" />
              {label}
              {tab === "orders" && activeOrders > 0 && (
                <span className="absolute -top-1.5 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {activeOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onSignOut}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-250 bg-rose-50/20 text-rose-500 px-4 text-xs font-bold hover:bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{authT.logoutBtn}</span>
        </button>
      </div>
    </div>
  );
}
