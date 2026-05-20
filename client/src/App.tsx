import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import BlogList from "./pages/BlogList";
import BlogCategoryPage from "./pages/BlogCategoryPage";
import BlogArticle from "./pages/BlogArticle";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          {/* 首頁：顯示 12 個分類卡片 */}
          <Route path="/" component={Home} />

          {/* 三層工具架構 */}
          {/* 層一：所有工具總覽（重定向至首頁） */}
          <Route path="/tools" component={Home} />
          {/* 層二：分類工具列表頁 /tools/:category */}
          <Route path="/tools/:category" component={CategoryPage} />
          {/* 層三：具體工具頁面 /tools/:category/:toolName */}
          <Route path="/tools/:category/:toolName" component={ToolPage} />

          {/* 知識庫三層架構 */}
          {/* 層一：知識庫首頁 - 12 個分類卡片 */}
          <Route path="/blog" component={BlogList} />
          {/* 層二：分類文章列表 /blog/:category */}
          <Route path="/blog/:category" component={BlogCategoryPage} />
          {/* 層三：文章頁面 /blog/:category/:articleId */}
          <Route path="/blog/:category/:articleId" component={BlogArticle} />

          {/* 法律頁面 */}
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />

          {/* 後台管理 */}
          <Route path="/admin" component={AdminDashboard} />

          {/* 登入頁面 */}
          <Route path="/login" component={Login} />

          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
