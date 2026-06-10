"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import type { FoodItem } from "@/lib/types";
import { Plus, Eye, Clock, AlertCircle } from "lucide-react";

interface FoodCardProps {
  food: FoodItem;
  onViewDetails: (food: FoodItem) => void;
}

export default function FoodCard({ food, onViewDetails }: FoodCardProps) {
  const { language, t } = useLanguage();
  const { addToCart, cart } = useApp();

  const foodId = food.id || food._id;
  const name = language === "en" ? food.nameEn : food.nameAm || food.nameEn;
  const description =
    language === "en" ? food.descEn : food.descAm || food.descEn;
  const categoryLabel =
    language === "en"
      ? food.categoryNameEn || food.category
      : food.categoryNameAm || food.categoryNameEn || food.category;
  const cartItem = cart.find((item) => item.foodId === foodId);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 dark:border-slate-800/40 dark:bg-slate-900 ${
        !food.isAvailable ? "opacity-75" : ""
      }`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={food.image}
          alt={name}
          fill
          unoptimized={food.image.startsWith("http://localhost")}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs dark:bg-slate-950/80">
            {categoryLabel}
          </span>
          {!food.isAvailable && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              <AlertCircle className="h-3 w-3" />
              {t("unavailable")}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-xs dark:bg-slate-900/90 dark:text-slate-200">
          <Clock className="h-3 w-3 text-amber-500" />
          {food.preparationTime} {t("minutes")}
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button
            onClick={() => onViewDetails(food)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("viewDetails")}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {name}
          </h3>
          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            {food.price} <span className="text-xs font-medium">ETB</span>
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/40">
          {food.isAvailable ? (
            cartItem ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {cartItem.quantity} in cart
              </span>
            ) : (
              <button
                onClick={() => addToCart(foodId)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addToCartBtn")}
              </button>
            )
          ) : (
            <span className="text-xs font-bold text-rose-500">{t("unavailable")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
