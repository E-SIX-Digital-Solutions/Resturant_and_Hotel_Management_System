"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import type { FoodItem } from "@/lib/types";
import { X, Clock, AlertTriangle, Plus, Minus, Trash2 } from "lucide-react";

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export default function FoodDetailModal({
  food,
  onClose,
}: FoodDetailModalProps) {
  const { language, t } = useLanguage();
  const { cart, addToCart, updateCartQuantity } = useApp();

  if (!food) return null;

  const foodId = food.id || food._id;
  const name = language === "en" ? food.nameEn : food.nameAm || food.nameEn;
  const description =
    language === "en" ? food.descEn : food.descAm || food.descEn;
  const ingredients =
    language === "en" ? food.ingEn : food.ingAm.length ? food.ingAm : food.ingEn;
  const allergens =
    language === "en" ? food.allergensEn : food.allergensAm;
  const categoryLabel =
    language === "en"
      ? food.categoryNameEn || food.category
      : food.categoryNameAm || food.categoryNameEn || food.category;

  const cartItem = cart.find((item) => item.foodId === foodId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-250 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors backdrop-blur-xs"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-video md:aspect-auto md:h-full bg-slate-100 dark:bg-slate-800">
            <Image
              src={food.image}
              alt={name}
              fill
              unoptimized={food.image.startsWith("http://localhost")}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent md:hidden" />
            <div className="absolute bottom-4 left-4 md:hidden">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <div className="hidden md:block">
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>

            <h2 className="mt-3 font-serif text-xl font-extrabold text-slate-900 dark:text-white md:text-2xl leading-snug">
              {name}
            </h2>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {food.price} <span className="text-sm font-semibold">ETB</span>
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>
                  {food.preparationTime} {t("minutes")}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>

            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("ingredientsTitle")}
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {allergens && allergens.length > 0 && (
              <div className="mt-4">
                <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-500/80">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t("allergens")}
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allergens.map((alg, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                    >
                      {alg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/40">
              {food.isAvailable ? (
                quantityInCart > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                      <button
                        onClick={() =>
                          updateCartQuantity(foodId, quantityInCart - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:text-rose-500 dark:hover:bg-slate-800 transition-colors"
                      >
                        {quantityInCart === 1 ? (
                          <Trash2 className="h-4.5 w-4.5" />
                        ) : (
                          <Minus className="h-4.5 w-4.5" />
                        )}
                      </button>
                      <span className="w-12 text-center text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {quantityInCart}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(foodId, quantityInCart + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:text-amber-600 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-2xl bg-slate-900 py-3 text-center text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                    >
                      {t("closeBtn")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(foodId)}
                    className="w-full rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/10 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                  >
                    {t("addToCartBtn")}
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 py-3.5 text-center text-sm font-extrabold text-slate-400 dark:text-slate-600 cursor-not-allowed"
                >
                  {t("unavailable")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
