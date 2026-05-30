// Navbar - 全局導航列（三層架構版本 + i18n）
// 導覽列絕對不平鋪工具名稱，採用「分類下拉選單」設計
// ============================================================

import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Menu, X, Sun, Moon, ChevronDown, Layers, BookOpen, LogIn, LogOut, Search, Info, Globe, ShieldCheck } from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { categories } from "@shared/categoriesConfig";
import { tools } from "@shared/toolsConfig";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

type Lang = "zh" | "en";

const navbarI18n = {
  zh: {
    toolsCategory: "工具分類",
    toolCount: "個工具分類",
    viewAllTools: "查看所有工具",
    knowledge: "知識庫",
    about: "關於我們",
    search: "搜尋工具...",
    searchAria: "搜尋工具",
    theme: "切換主題",
    signIn: "登入",
    signOut: "登出",
    menuOpen: "開啟選單",
    homeAria: "回到首頁",
  },
  en: {
    toolsCategory: "Tools",
    toolCount: "Tool Categories",
    viewAllTools: "View all tools",
    knowledge: "Knowledge",
    about: "About",
    search: "Search tools...",
    searchAria: "Search",
    theme: "Toggle theme",
    signIn: "Sign in",
    signOut: "Sign out",
    menuOpen: "Open menu",
    homeAria: "Back to home",
  },
}

// 預先計算每個分類的工具數量（動態，新增工具自動更新）
const toolCountByCategory: Record<string, number> = {};
for (const tool of tools) {
  toolCountByCategory[tool.category] = (toolCountByCategory[tool.category] ?? 0) + 1;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const t = navbarI18n[lang];
  const openSearch = useCallback(() => setSearchOpen(true), []);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href="/" aria-label={t.homeAria} className="flex items-center gap-2 cursor-pointer select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">{lang === "zh" ? "Formula Universe" : "Formula Universe"}</span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {/* 工具分類下拉選單 - 核心導航 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-sm font-medium",
                  location.startsWith("/tools") && "bg-accent text-accent-foreground"
                )}
              >
                {t.toolsCategory}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-2" sideOffset={4}>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                12 {t.toolCount}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-2 gap-0.5">
                {categories.map((cat, idx) => {
                  const count = toolCountByCategory[cat.key] ?? 0;
                  const seq = String(idx + 1).padStart(2, "0");
                  const catName = lang === "zh" ? cat.name : cat.nameEn;
                  return (
                    <DropdownMenuItem key={cat.key} asChild>
                      <Link href={`/category/${cat.key}`}>
                        <div className={cn(
                          "flex items-center gap-2 px-2 py-1.5 cursor-pointer w-full",
                          count === 0 && "opacity-50"
                        )}>
                          <div className={cn("rounded p-1 shrink-0", cat.bgColor)}>
                            <CategoryIcon iconName={cat.icon} className={cn("h-3.5 w-3.5", cat.color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium">
                              <span className="text-muted-foreground mr-1">{seq}.</span>
                              {catName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lang === "zh" ? cat.nameEn : cat.name}
                              <span className={cn(
                                "ml-1 font-medium",
                                count > 0 ? "text-primary" : "text-muted-foreground"
                              )}>({count})</span></p>
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/tools">
                  <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer w-full text-primary">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{t.viewAllTools}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 text-sm font-medium",
                location.startsWith("/blog") && "bg-accent text-accent-foreground"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t.knowledge}
            </Button>
          </Link>

          <Link href="/about">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 text-sm font-medium",
                location === "/about" && "bg-accent text-accent-foreground"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              {t.about}
            </Button>
          </Link>
        </nav>

        {/* ── Right Actions ─────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Search button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground h-8 px-3 border border-border/50 hover:border-border rounded-md"
            onClick={openSearch}
            aria-label={t.searchAria}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">{t.search}</span>
            <kbd className="ml-1 px-1 py-0.5 rounded border border-border bg-muted text-xs leading-none">⌘K</kbd>
          </Button>
          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={openSearch}
            aria-label={t.searchAria}
          >
            <Search className="h-4 w-4" />
          </Button>
          {/* Language toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("zh")} className={lang === "zh" ? "bg-accent" : ""}>
                <span>繁中 (Traditional Chinese)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "bg-accent" : ""}>
                <span>EN (English)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            aria-label={t.theme}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-sm hidden md:flex">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  {user?.name ?? (lang === "zh" ? "用戶" : "User")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {lang === "zh" ? "後台管理" : "Admin"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout()} className="text-destructive gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  {t.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="hidden md:flex gap-1.5 text-sm h-8"
              onClick={() => setLocation("/login")}
            >
              <LogIn className="h-3.5 w-3.5" />
              {t.signIn}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.menuOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wide">
              {t.toolsCategory}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat, idx) => {
                const count = toolCountByCategory[cat.key] ?? 0;
                const seq = String(idx + 1).padStart(2, "0");
                const catName = lang === "zh" ? cat.name : cat.nameEn;
                return (
                  <Link
                    key={cat.key}
                    href={`/category/${cat.key}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-2 hover:bg-accent cursor-pointer",
                      count === 0 && "opacity-50"
                    )}>
                      <div className={cn("rounded p-1 shrink-0", cat.bgColor)}>
                        <CategoryIcon iconName={cat.icon} className={cn("h-3.5 w-3.5", cat.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-tight">
                          <span className="text-muted-foreground mr-0.5">{seq}.</span>
                          {catName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lang === "zh" ? cat.nameEn : cat.name}
                          {" "}
                          <span className={cn(
                            "font-medium",
                            count > 0 ? "text-primary" : ""
                          )}>({count})</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border pt-3 mt-3 space-y-1">
              <Link href="/blog" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{t.knowledge}</span>
                </div>
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer">
                  <Info className="h-4 w-4" />
                  <span className="text-sm">{t.about}</span>
                </div>
              </Link>
              {!isAuthenticated && (
                <Button
                  size="sm"
                  className="w-full mt-2 gap-2"
                  onClick={() => setLocation("/login")}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t.signIn}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Search Dialog */}
    <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
