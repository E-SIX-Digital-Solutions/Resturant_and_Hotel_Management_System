"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "../common/spinner";
import ErrorMessage from "../common/error";
import {
  PlusCircle,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { Category, FoodItem } from "@/lib/types";
import { fetchCategories, categoryKeys } from "@/lib/api/categories";
import {
  fetchFoods,
  foodKeys,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
  buildFoodFormData,
} from "@/lib/api/foods";
import { useLanguage } from "@/context/LanguageContext";

export function FoodManagementSection() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const {
    data: foods = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: foodKeys.all,
    queryFn: () => fetchFoods(),
  });

  const invalidateFoods = () => {
    queryClient.invalidateQueries({ queryKey: foodKeys.all });
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  };

  const createFoodMutation = useMutation({
    mutationFn: createFood,
    onSuccess: invalidateFoods,
  });

  const updateFoodMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateFood(id, formData),
    onSuccess: invalidateFoods,
  });

  const deleteFoodMutation = useMutation({
    mutationFn: deleteFood,
    onSuccess: invalidateFoods,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      toggleFoodAvailability(id, isAvailable),
    onSuccess: invalidateFoods,
  });

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [food, setFood] = useState({
    nameEn: "",
    nameAm: "",
    price: 100,
    prepTime: 15,
    category: "",
    image: "",
    descEn: "",
    descAm: "",
    ingEnStr: "",
    ingAmStr: "",
    isAvailable: true,
  });

  const resetFoodForm = () => {
    setEditingFoodId(null);
    setImageFile(null);
    setFood({
      nameEn: "",
      nameAm: "",
      price: 100,
      category: fetchedCategories.length > 0 ? fetchedCategories[0]._id : "",
      image: "",
      descEn: "",
      descAm: "",
      ingEnStr: "",
      ingAmStr: "",
      isAvailable: true,
      prepTime: 15,
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert(
        "File is too large! Please upload an image under 1.5MB to optimize database storage.",
      );
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFood((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    resetFoodForm();
    setShowFoodModal(true);
  };

  const handleOpenEditModal = (foodItem: FoodItem) => {
    setEditingFoodId(foodItem._id);
    setImageFile(null);
    setFood({
      nameEn: foodItem.nameEn,
      nameAm: foodItem.nameAm,
      price: foodItem.price,
      category: foodItem.categoryId || foodItem.category,
      image: foodItem.image,
      descEn: foodItem.descEn,
      descAm: foodItem.descAm,
      ingEnStr: foodItem.ingEn.join(", "),
      ingAmStr: foodItem.ingAm.join(", "),
      isAvailable: foodItem.isAvailable,
      prepTime: foodItem.preparationTime,
    });
    setShowFoodModal(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();

    const ingEn = food.ingEnStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const ingAm = food.ingAmStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = buildFoodFormData({
      nameEn: food.nameEn,
      nameAm: food.nameAm,
      price: Number(food.price),
      category: food.category,
      descEn: food.descEn,
      descAm: food.descAm,
      ingEn,
      ingAm,
      isAvailable: food.isAvailable,
      preparationTime: Number(food.prepTime),
      imageFile,
      imageUrl: !imageFile ? food.image : undefined,
    });

    try {
      if (editingFoodId) {
        await updateFoodMutation.mutateAsync({
          id: editingFoodId,
          formData,
        });
      } else {
        await createFoodMutation.mutateAsync(formData);
      }
      setShowFoodModal(false);
      resetFoodForm();
    } catch (mutationError) {
      alert(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save food",
      );
    }
  };

  const getCategoryLabel = (foodItem: FoodItem) => {
    if (language === "am" && foodItem.categoryNameAm) {
      return foodItem.categoryNameAm;
    }
    if (foodItem.categoryNameEn) {
      return foodItem.categoryNameEn;
    }

    const matched = fetchedCategories.find(
      (cat: Category) =>
        cat._id === foodItem.categoryId || cat.slug === foodItem.category,
    );

    if (!matched) return foodItem.category;
    return language === "en"
      ? matched.nameEn
      : matched.nameAm || matched.nameEn;
  };

  const isSaving = createFoodMutation.isPending || updateFoodMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
          {t("foodManagement")}
        </h2>
        <button
          onClick={handleOpenAddModal}
          disabled={fetchedCategories.length === 0}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all ${
            fetchedCategories.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-amber-600 hover:to-orange-600"
          }`}
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>{t("addNewFoodBtn")}</span>
        </button>
      </div>

      {fetchedCategories.length === 0 && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-amber-800 text-xs font-semibold dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Please add at least one Food Category first inside the Category tab
            before creating new dishes!
          </span>
        </div>
      )}

      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-xs dark:border-slate-800/40 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/40 dark:bg-slate-950">
                <th className="py-4 px-6">Food Info</th>
                <th className="py-4 px-6">{t("foodPrice")}</th>
                <th className="py-4 px-6">{t("foodCategory")}</th>
                <th className="py-4 px-6">{t("preparationTime")}</th>
                <th className="py-4 px-6">{t("availabilityLabel")}</th>
                <th className="py-4 px-6 text-right">{t("actionsLabel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold dark:divide-slate-800/40">
              {isLoading && (
                <tr>
                  <td colSpan={6}>
                    <Spinner size="lg" className="mx-auto py-8" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6}>
                    <ErrorMessage message={(error as Error).message} />
                  </td>
                </tr>
              )}

              {!isLoading && !isError && foods.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No foods found. Start by adding a new food item!
                  </td>
                </tr>
              )}

              {foods.map((foodItem: FoodItem) => {
                const name =
                  language === "en"
                    ? foodItem.nameEn
                    : foodItem.nameAm || foodItem.nameEn;

                return (
                  <tr
                    key={foodItem._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Image
                        src={foodItem.image}
                        alt={name}
                        height={40}
                        width={40}
                        unoptimized={foodItem.image.startsWith(
                          "http://localhost",
                        )}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-45">
                          {name}
                        </h4>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-amber-600 dark:text-amber-400">
                      {foodItem.price} ETB
                    </td>
                    <td className="py-4 px-6 uppercase text-[10px] font-black tracking-wider text-slate-500">
                      {getCategoryLabel(foodItem)}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-550 dark:text-slate-350">
                      {foodItem.preparationTime} {t("minutes")}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          toggleAvailabilityMutation.mutate({
                            id: foodItem._id,
                            isAvailable: !foodItem.isAvailable,
                          })
                        }
                        disabled={toggleAvailabilityMutation.isPending}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          foodItem.isAvailable
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}
                      >
                        {foodItem.isAvailable ? (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            <span>{t("availableStatus")}</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            <span>{t("unavailableStatus")}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(foodItem)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 transition-colors"
                        title={t("editFoodBtn")}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t("confirmDelete"))) {
                            deleteFoodMutation.mutate(foodItem._id);
                          }
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-500 hover:text-rose-500 dark:border-slate-800 transition-colors"
                        title={t("deleteFoodBtn")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl animate-in fade-in duration-200 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/40">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {editingFoodId ? t("editFoodBtn") : t("addNewFoodBtn")}
              </h3>
              <button
                onClick={() => setShowFoodModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveFood}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodNameEn")}
                  </label>
                  <input
                    type="text"
                    required
                    value={food.nameEn}
                    onChange={(e) =>
                      setFood({ ...food, nameEn: e.target.value })
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
                    value={food.nameAm}
                    onChange={(e) =>
                      setFood({ ...food, nameAm: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodPrice")}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={food.price || ""}
                    onChange={(e) =>
                      setFood({ ...food, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("preparationTime")}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={food.prepTime || ""}
                    onChange={(e) =>
                      setFood({ ...food, prepTime: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodCategory")}
                  </label>
                  <select
                    required
                    value={food.category}
                    onChange={(e) =>
                      setFood({ ...food, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {fetchedCategories.map((cat: Category) => (
                      <option key={cat._id} value={cat._id}>
                        {language === "en"
                          ? cat.nameEn
                          : cat.nameAm || cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodImage")}
                  </label>
                  <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-4 hover:border-amber-500 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-950/50 dark:hover:bg-slate-950 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center gap-1.5 text-center pointer-events-none">
                      <Upload className="h-5 w-5 text-slate-400 group-hover:text-amber-500 group-hover:scale-105 transition-all" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                        Choose local image file
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <div className="relative h-28 w-full border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center">
                    {food.image ? (
                      <>
                        <Image
                          src={food.image}
                          alt="Upload Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFood({ ...food, image: "" });
                            setImageFile(null);
                          }}
                          className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-colors z-20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center p-3 text-slate-400">
                        <ImageIcon className="h-6 w-6 mb-1 text-slate-300" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodDescEn")}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={food.descEn}
                    onChange={(e) =>
                      setFood({ ...food, descEn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodDescAm")}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={food.descAm}
                    onChange={(e) =>
                      setFood({ ...food, descAm: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodIngEn")}
                  </label>
                  <input
                    type="text"
                    required
                    value={food.ingEnStr}
                    onChange={(e) =>
                      setFood({ ...food, ingEnStr: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    {t("foodIngAm")}
                  </label>
                  <input
                    type="text"
                    required
                    value={food.ingAmStr}
                    onChange={(e) =>
                      setFood({ ...food, ingAmStr: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={food.isAvailable}
                  onChange={(e) =>
                    setFood({ ...food, isAvailable: e.target.checked })
                  }
                  className="h-4 w-4 rounded-sm border-slate-200 text-amber-500 focus:ring-amber-500 dark:border-slate-800"
                />
                <label
                  htmlFor="availCheck"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  {t("availabilityLabel")}: {t("availableStatus")}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="flex h-10 items-center justify-center rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-6 text-xs font-bold text-white hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSaving ? t("placingOrder") : t("saveBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
