"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import { loginAdmin, logoutAdmin } from "@/lib/api/admin";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboardSection from "@/components/admin/AdminDashboardSection";
import AdminOrdersQueue from "@/components/admin/AdminOrdersQueue";
import CategoryManager from "@/components/admin/CategoryManager";
import { FoodManagementSection } from "@/components/admin/FoodManagementSection";
import { authTranslations } from "@/components/admin/authTranslations";
import type { AdminTab } from "@/components/admin/types";

export default function AdminPage() {
  const { language } = useLanguage();
  const { setUserRole } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  useEffect(() => {
    const savedAuth =
      localStorage.getItem("hotel-admin-authenticated") === "true";
    const syncTimer = window.setTimeout(() => {
      if (savedAuth) {
        setIsAuthenticated(true);
        setUserRole("admin");
      } else {
        setUserRole("customer");
      }
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [setUserRole]);

  const authT = authTranslations[language] || authTranslations.en;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError("");

    try {
      const result = await loginAdmin(emailInput, passwordInput);

      if (result.user.role !== "admin") {
        throw new Error("Only admin users can access this dashboard.");
      }

      localStorage.setItem("hotel-admin-authenticated", "true");
      localStorage.setItem("hotel-admin-token", result.token);
      localStorage.setItem("hotel-admin-user", JSON.stringify(result.user));
      setIsAuthenticated(true);
      setUserRole("admin");
      setPasswordInput("");
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : authT.loginError);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutAdmin();
    } catch {}

    setIsAuthenticated(false);
    setUserRole("customer");
    localStorage.removeItem("hotel-admin-authenticated");
    localStorage.removeItem("hotel-admin-token");
    localStorage.removeItem("hotel-admin-user");
    setEmailInput("");
    setPasswordInput("");
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        authT={authT}
        emailInput={emailInput}
        passwordInput={passwordInput}
        authError={authError}
        isSigningIn={isSigningIn}
        onEmailChange={setEmailInput}
        onPasswordChange={setPasswordInput}
        onSubmit={handleSignIn}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        authT={authT}
      />

      {activeTab === "dashboard" && (
        <AdminDashboardSection onNavigate={setActiveTab} />
      )}
      {activeTab === "orders" && <AdminOrdersQueue />}
      {activeTab === "menu" && <FoodManagementSection />}
      {activeTab === "categories" && <CategoryManager />}
    </div>
  );
}
