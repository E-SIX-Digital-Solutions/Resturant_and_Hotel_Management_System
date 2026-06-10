"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import { fetchCategories, categoryKeys } from "@/lib/api/categories";
import { fetchFoods, foodKeys } from "@/lib/api/foods";
import { POLL_MENU_MS } from "@/lib/pollIntervals";
import type { FoodItem } from "@/lib/types";
import FoodCard from "@/components/FoodCard";
import FoodDetailModal from "@/components/FoodDetailModal";
import {
  Coffee,
  Flame,
  Utensils,
  GlassWater,
  IceCream,
  Pizza,
  ArrowRight,
  ChevronRight,
  ChefHat,
} from "lucide-react";

export default function HomePage() {
  const { t, language } = useLanguage();
  const { setUserRole } = useApp();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    setUserRole("customer");
  }, [setUserRole]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const { data: foods = [], isLoading: foodsLoading } = useQuery({
    queryKey: foodKeys.all,
    queryFn: () => fetchFoods(),
    refetchInterval: POLL_MENU_MS,
  });

  const chefPicks = foods.filter((food) => food.isAvailable).slice(0, 4);

  const categoriesList = [
    {
      slug: "all",
      nameEn: t("allCategories"),
      nameAm: t("allCategories"),
      icon: Pizza,
    },
    ...categories.map((cat) => {
      let icon = Utensils;
      const slug =
        cat.slug || cat.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      if (slug.includes("breakfast") || slug.includes("coffee")) icon = Coffee;
      else if (slug.includes("lunch")) icon = Utensils;
      else if (slug.includes("dinner") || slug.includes("grill")) icon = Flame;
      else if (slug.includes("drink") || slug.includes("juice"))
        icon = GlassWater;
      else if (slug.includes("dessert") || slug.includes("sweet"))
        icon = IceCream;

      return {
        slug,
        nameEn: cat.nameEn,
        nameAm: cat.nameAm,
        icon,
      };
    }),
  ];

  return (
    <div className="relative flex-1 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="absolute top-1/4 left-10 -z-10 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-950/10" />
      <div className="absolute top-1/2 right-10 -z-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-950/10" />

      <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        <div className="text-center">
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight dark:text-white">
            {t("welcome")}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            {t("homeSubtitle")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 px-8 text-sm font-bold text-white shadow-xl shadow-orange-500/10 hover:from-amber-600 hover:to-orange-600 hover:scale-102 transition-all duration-200"
            >
              <span>{t("viewMenuBtn")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/30">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categoriesList.slice(0, 4).map((cat) => {
            const Icon = cat.icon;
            const displayName =
              language === "en" ? cat.nameEn : cat.nameAm || cat.nameEn;

            const isAll = cat.slug === "all";
            const href = isAll ? "/menu" : `/menu?category=${cat.slug}`;

            return (
              <Link
                key={cat.slug}
                href={href}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 dark:border-slate-800/40 dark:bg-slate-900"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 font-serif text-lg font-bold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400 transition-colors">
                  {displayName}
                </h3>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {t("viewMenuBtn")}
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            );
          })}
        </div>

        {categoriesLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/30">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
              <ChefHat className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("specialsEyebrow")}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {t("specialsTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              {t("specialsSubtitle")}
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors shrink-0"
          >
            {t("viewMenuBtn")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {foodsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : chefPicks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chefPicks.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onViewDetails={setSelectedFood}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("noFoodFoundDesc")}
            </p>
            <Link
              href="/menu"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {t("viewMenuBtn")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}
