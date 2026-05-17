// ============================================================
// PaywallGuard - 付費牆攔截組件
// 支援兩種情境：未登入用戶 & 非 Pro 用戶
// ============================================================

import { Lock, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface PaywallGuardProps {
  children: React.ReactNode;
  isPremium: boolean;
  toolName?: string;
}

export function PaywallGuard({ children, isPremium, toolName }: PaywallGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // If tool is not premium, render children directly
  if (!isPremium) {
    return <>{children}</>;
  }

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">登入後即可使用</CardTitle>
            <CardDescription>
              {toolName ? `「${toolName}」` : "此工具"}是進階功能，請先登入您的帳號
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="mr-2 h-4 w-4" />
              立即登入
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              登入即可免費使用所有基礎工具
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated but not Pro
  // TODO: Check user.role or subscription status for Pro tier
  const isPro = user?.role === "admin"; // Temporary: admin = pro for demo

  if (!isPro) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl">Pro 專屬功能</CardTitle>
            <CardDescription>
              {toolName ? `「${toolName}」` : "此工具"}需要 Pro 訂閱才能使用
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 space-y-2">
              <p className="text-sm font-medium">Pro 訂閱包含：</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  無限制使用所有進階工具
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  計算歷史記錄與趨勢分析
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  無廣告純淨使用體驗
                </li>
              </ul>
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              升級 Pro 方案
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              每月 NT$99 · 隨時取消
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
