"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { fetchOrders, updateOrderStatus, orderKeys } from "@/lib/api/orders";
import { adminKeys } from "@/lib/api/admin";
import { POLL_ORDERS_MS } from "@/lib/pollIntervals";
import Spinner from "@/components/common/spinner";
import { CheckCircle2, ClipboardList } from "lucide-react";

export default function AdminOrdersQueue() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: orderKeys.all,
    queryFn: fetchOrders,
    refetchInterval: POLL_ORDERS_MS,
    refetchIntervalInBackground: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "preparing" | "ready";
    }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
        {t("recentOrdersQueue")}
      </h2>

      {ordersLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`flex flex-col rounded-3xl border bg-white p-6 shadow-xs dark:bg-slate-900 transition-all ${
                order.status === "pending"
                  ? "border-orange-200 dark:border-orange-950/40"
                  : order.status === "preparing"
                    ? "border-amber-200 dark:border-amber-950/40"
                    : "border-slate-100 dark:border-slate-800/40 opacity-75"
              }`}
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/40">
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    {order.orderNumber || order.id}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {t("tableNumLabel")}:{" "}
                    <span className="text-amber-600 dark:text-amber-500">
                      {order.tableNumber}
                    </span>
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                    order.status === "pending"
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
                      : order.status === "preparing"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                  }`}
                >
                  {t(
                    `status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
                  )}
                </span>
              </div>

              <div className="flex-1 space-y-2 mb-6">
                {order.items.map((item, idx) => {
                  const name =
                    language === "en"
                      ? item.nameEn
                      : item.nameAm || item.nameEn;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs font-semibold"
                    >
                      <span className="text-slate-650 dark:text-slate-350 truncate max-w-50">
                        {name}{" "}
                        <span className="text-[10px] text-slate-400 font-medium">
                          x {item.quantity}
                        </span>
                      </span>
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        {item.subtotal ?? item.price * item.quantity} ETB
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800/40 flex justify-between items-center gap-3">
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">
                    {t("totalPrice")}:
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    {order.totalPrice} ETB
                  </span>
                </div>

                {order.status === "pending" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        orderId: order._id,
                        status: "preparing",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="flex h-9 items-center justify-center rounded-xl bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md"
                  >
                    {t("startPrepBtn")}
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        orderId: order._id,
                        status: "ready",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="flex h-9 items-center justify-center rounded-xl bg-emerald-500 px-4 text-xs font-bold text-white hover:bg-emerald-600 active:scale-95 transition-all shadow-md"
                  >
                    {t("finishPrepBtn")}
                  </button>
                )}

                {order.status === "ready" && (
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Served</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 text-center dark:border-slate-800 max-w-xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
            {t("noIncomingOrders")}
          </h3>
        </div>
      )}
    </div>
  );
}
