"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { PlusCircle, Edit3, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "../common/spinner";
import ErrorMessage from "../common/error";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryKeys,
} from "@/lib/api/categories";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoryManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidateCategories,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      categoryData,
    }: {
      id: string;
      categoryData: { nameEn: string; nameAm: string };
    }) => updateCategory(id, categoryData),
    onSuccess: invalidateCategories,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidateCategories,
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const [category, setCategory] = useState({
    nameEn: "",
    nameAm: "",
  });

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategoryId) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          categoryData: { nameEn: category.nameEn, nameAm: category.nameAm },
        });
      } else {
        await createCategoryMutation.mutateAsync({
          nameEn: category.nameEn,
          nameAm: category.nameAm,
        });
      }

      setShowCategoryModal(false);
      setEditingCategoryId(null);
      setCategory({ nameEn: "", nameAm: "" });
    } catch (mutationError) {
      alert(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save category",
      );
    }
  };

  const handleOpenEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat._id);
    setCategory({ nameEn: cat.nameEn, nameAm: cat.nameAm });
    setShowCategoryModal(true);
  };

  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategory({ nameEn: "", nameAm: "" });
    setShowCategoryModal(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteCategoryMutation.mutate(categoryToDelete._id, {
      onSuccess: () => setCategoryToDelete(null),
      onError: (mutationError) => {
        alert(
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to delete category",
        );
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
          {t("categories")}
        </h2>
        <button
          onClick={handleOpenAddCategoryModal}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-4 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>{t("addNewFoodBtn")}</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/40 dark:bg-slate-950">
                <th className="py-4 px-6">{t("foodCategory")}</th>
                <th className="py-4 px-6">{t("foodNameEn")}</th>
                <th className="py-4 px-6">{t("foodNameAm")}</th>
                <th className="py-4 px-6">Dishes</th>
                <th className="py-4 px-6 text-right">{t("actionsLabel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold dark:divide-slate-800/40">
              {isLoading && (
                <tr>
                  <td colSpan={5}>
                    <Spinner size="lg" className="mx-auto py-8" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={5}>
                    <ErrorMessage message={(error as Error).message} />
                  </td>
                </tr>
              )}

              {!isLoading && !isError && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No categories found. Start by adding a new category!
                  </td>
                </tr>
              )}

              {categories.map((cat: Category) => (
                <tr
                  key={cat._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                    {cat.slug}
                  </td>
                  <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">
                    {cat.nameEn}
                  </td>
                  <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">
                    {cat.nameAm}
                  </td>
                  <td className="py-4 px-6">
                    <span className="rounded-full bg-slate-50 border px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-400">
                      {cat.count ?? 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEditCategoryModal(cat)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-500 hover:text-rose-500 dark:border-slate-800 transition-colors"
                      disabled={
                        categories.length <= 1 ||
                        deleteCategoryMutation.isPending
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-rose-200/60 bg-white shadow-2xl p-6 sm:p-7 text-center dark:border-rose-950/40 dark:bg-slate-900">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {t("confirmDelete")}
            </h3>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {t("cancelBtn")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={deleteCategoryMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-rose-600 to-orange-500 px-5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {t("deleteFoodBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/40">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                {editingCategoryId ? t("editFoodBtn") : t("categories")}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t("foodNameEn")}
                </label>
                <input
                  type="text"
                  required
                  value={category.nameEn}
                  onChange={(e) =>
                    setCategory({ ...category, nameEn: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  {t("foodNameAm")}
                </label>
                <input
                  type="text"
                  required
                  value={category.nameAm}
                  onChange={(e) =>
                    setCategory({ ...category, nameAm: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                  className="flex h-9 items-center justify-center rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-5 text-xs font-bold text-white disabled:opacity-70"
                >
                  {t("saveBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
