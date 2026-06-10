"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Sun,
  Moon,
  Utensils,
  Clock,
  CheckSquare,
} from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { cart, currentActiveOrderId } = useApp();
  const pathname = usePathname();

  const isAdminRoute = pathname?.includes("/admin");
  const showCustomerNav = !isAdminRoute;

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const isLinkActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navLinks = [
    { href: "/", label: t("navHome"), icon: Utensils },
    { href: "/menu", label: t("navMenu"), icon: CheckSquare },
    {
      href: "/cart",
      label: t("navCart"),
      icon: ShoppingBag,
      badge: totalCartItems > 0 ? totalCartItems : undefined,
    },
    {
      href: "/tracking",
      label: t("navTracking"),
      icon: Clock,
      badge: currentActiveOrderId ? "•" : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/50 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <Utensils className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              {t("brand")}
            </span>
            <span className="text-[10px] font-medium tracking-widest text-amber-600 dark:text-amber-500 uppercase -mt-1 hidden sm:inline">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {showCustomerNav && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {link.badge !== undefined && (
                    <span
                      className={`ml-0.5 flex items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 ${
                        link.badge === "•"
                          ? "h-2 w-2 min-w-2 animate-pulse p-0"
                          : "h-5 min-w-5 px-1 animate-pulse"
                      }`}
                    >
                      {link.badge === "•" ? "" : link.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-linear-to-r from-amber-500 to-orange-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                language === "en"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("am")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                language === "am"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              አማ
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-amber-500 transition-colors"
            title={
              theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            }
          >
            {theme === "light" ? (
              <Moon className="h-4.5 w-4.5 transition-transform hover:rotate-12 duration-300" />
            ) : (
              <Sun className="h-4.5 w-4.5 transition-transform hover:rotate-45 duration-300" />
            )}
          </button>

          {showCustomerNav && (
            <Link
              href="/cart"
              className="relative flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-colors"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {totalCartItems}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {showCustomerNav && (
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 bg-white/95 px-2 py-1 dark:border-slate-800/30 dark:bg-slate-950/95">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <span className="relative">
                  <Icon className="h-4.5 w-4.5 mb-0.5" />
                  {link.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -right-2 flex items-center justify-center rounded-full bg-orange-500 text-white ring-1 ring-white dark:ring-slate-950 ${
                        link.badge === "•"
                          ? "h-2 w-2 min-w-2 animate-pulse"
                          : "h-4 min-w-4 px-0.5 text-[8px] font-bold"
                      }`}
                    >
                      {link.badge === "•" ? "" : link.badge}
                    </span>
                  )}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
