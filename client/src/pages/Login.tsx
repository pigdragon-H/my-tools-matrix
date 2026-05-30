import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const t = {
  loginTitle: { zh: "登入工具矩陣", en: "Sign in to Tool Matrix" },
  loginDesc: {
    zh: "使用您的帳號登入，後台管理者可以進入 /admin 管理面板。",
    en: "Sign in with your account. Admins can access the /admin panel.",
  },
  tabLogin: { zh: "登入", en: "Sign in" },
  tabRegister: { zh: "註冊", en: "Register" },
  email: { zh: "電子郵件", en: "Email" },
  password: { zh: "密碼", en: "Password" },
  confirmPassword: { zh: "確認密碼", en: "Confirm password" },
  fullName: { zh: "暱稱", en: "Display name" },
  submitLogin: { zh: "登入", en: "Sign in" },
  submitRegister: { zh: "建立帳號", en: "Create account" },
  loading: { zh: "處理中…", en: "Processing…" },
  errInvalid: {
    zh: "電子郵件或密碼錯誤，請重新確認。",
    en: "Invalid email or password.",
  },
  errUnconfirmed: {
    zh: "請先確認您的電子郵件，再嘗試登入。",
    en: "Please confirm your email before signing in.",
  },
  errPwMismatch: {
    zh: "兩次輸入的密碼不一致。",
    en: "Passwords do not match.",
  },
  errPwShort: {
    zh: "密碼至少需要 6 個字元。",
    en: "Password must be at least 6 characters.",
  },
  errAlready: {
    zh: "此電子郵件已被註冊，請直接登入。",
    en: "This email is already registered. Please sign in.",
  },
  errGeneric: {
    zh: "發生錯誤，請稍後再試。",
    en: "Something went wrong. Please try again.",
  },
  successRegister: {
    zh: "註冊成功！請查看您的電子郵件以確認帳號。",
    en: "Registered! Please check your email to verify your account.",
  },
  backHome: { zh: "← 回首頁", en: "← Back to home" },
} as const;

export default function Login() {
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError(t.errInvalid[lang]);
        } else if (error.message.includes("Email not confirmed")) {
          setError(t.errUnconfirmed[lang]);
        } else {
          setError(error.message);
        }
        return;
      }
      const returnTo = new URLSearchParams(window.location.search).get(
        "returnTo"
      );
      navigate(returnTo ?? "/admin");
    } catch {
      setError(t.errGeneric[lang]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (registerPassword !== confirmPassword) {
      setError(t.errPwMismatch[lang]);
      return;
    }
    if (registerPassword.length < 6) {
      setError(t.errPwShort[lang]);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: { data: { full_name: registerName } },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setError(t.errAlready[lang]);
        } else {
          setError(error.message);
        }
        return;
      }
      setSuccess(t.successRegister[lang]);
    } catch {
      setError(t.errGeneric[lang]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <Link href="/">
            <span className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors">
              {lang === "zh" ? "工具矩陣" : "Tool Matrix"}
            </span>
          </Link>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t.loginTitle[lang]}
            </CardTitle>
            <CardDescription className="text-center">
              {t.loginDesc[lang]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.tabLogin[lang]}</TabsTrigger>
                <TabsTrigger value="register">
                  {t.tabRegister[lang]}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email[lang]}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.password[lang]}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.loading[lang]}
                      </>
                    ) : (
                      t.submitLogin[lang]
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{t.fullName[lang]}</Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t.email[lang]}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      {t.password[lang]}
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">
                      {t.confirmPassword[lang]}
                    </Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.loading[lang]}
                      </>
                    ) : (
                      t.submitRegister[lang]
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              {t.backHome[lang]}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
