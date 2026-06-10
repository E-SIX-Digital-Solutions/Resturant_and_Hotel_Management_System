"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import type { FoodItem, Category } from "@/lib/types";
import { fetchCategories, categoryKeys } from "@/lib/api/categories";
import { fetchFoods, foodKeys } from "@/lib/api/foods";
import { POLL_MENU_MS } from "@/lib/pollIntervals";
import FoodCard from "@/components/FoodCard";
import FoodDetailModal from "@/components/FoodDetailModal";
import {
  Search,
  EyeOff,
  Coffee,
  Flame,
  Utensils,
  GlassWater,
  IceCream,
  Pizza,
  Loader2,
} from "lucide-react";

function buildMenuQueryString(category: string, search: string) {
  const params = new URLSearchParams();

  if (category && category !== "all") {
    params.set("category", category);
  }

  if (search.trim() !== "") {
    params.set("search", search.trim());
  }

  return params.toString();
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function MenuContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitializedFromUrl = useRef(false);

  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || "",
  );
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const nextQuery = buildMenuQueryString(
      activeCategory,
      debouncedSearchQuery,
    );
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [activeCategory, debouncedSearchQuery, pathname, router, searchParams]);

  useEffect(() => {
    if (!hasInitializedFromUrl.current) {
      hasInitializedFromUrl.current = true;
      return;
    }

    const catParam = searchParams.get("category") || "all";
    const searchParam = searchParams.get("search") || "";

    setActiveCategory((prev) => (prev === catParam ? prev : catParam));
    setSearchQuery((prev) => (prev === searchParam ? prev : searchParam));
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const { data: foods = [], isLoading: isFoodsLoading } = useQuery({
    queryKey: foodKeys.list({
      category: activeCategory,
      search: debouncedSearchQuery,
    }),
    queryFn: () =>
      fetchFoods({
        category: activeCategory,
        search: debouncedSearchQuery,
      }),
    refetchInterval: POLL_MENU_MS,
    placeholderData: keepPreviousData,
  });

  const showLoadingIndicator = isFoodsLoading;

  const categoriesList = [
    {
      slug: "all",
      nameEn: t("allCategories"),
      nameAm: t("allCategories"),
      icon: Pizza,
    },
    ...categories.map((cat: Category) => {
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          {t("navMenu")}
        </h1>
        <div className="mt-2 h-1 w-16 bg-linear-to-r from-amber-500 to-orange-500 rounded-full mx-auto" />
      </div>

      <div className="space-y-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm shadow-xs focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:focus:border-amber-500"
          />
          <Search className="absolute top-4 left-4 h-4.5 w-4.5 text-slate-400" />
          {showLoadingIndicator && (
            <Loader2 className="absolute top-4 right-4 h-4.5 w-4.5 text-amber-500 animate-spin" />
          )}
        </div>

        <div className="flex w-full items-center justify-start md:justify-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.slug;
            const label = language === "en" ? cat.nameEn : cat.nameAm;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        {foods.length > 0 ? (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${showLoadingIndicator ? "opacity-60 transition-opacity" : ""}`}
          >
            {foods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onViewDetails={(selectedItem) => setSelectedFood(selectedItem)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 text-center dark:border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400">
              <EyeOff className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
              {t("noFoodFound")}
            </h3>
            <p className="mt-2 text-xs text-slate-400 max-w-xs dark:text-slate-500">
              {t("noFoodFoundDesc")}
            </p>
          </div>
        )}
      </div>

      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-slate-500">
          Loading digital menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
