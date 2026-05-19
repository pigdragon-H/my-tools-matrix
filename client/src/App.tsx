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
import About from "./pages/About";
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
          {/* 擐?嚗＊蝷?12 ??憿??*/}
          <Route path="/" component={Home} />

          {/* 銝惜撌亙?嗆? */}
          {/* 撅支?嚗??極?瑞蜇閬踝????擐?嚗?*/}
          <Route path="/tools" component={Home} />
          {/* 撅支?嚗?憿極?瑕?銵券? /tools/:category */}
          <Route path="/tools/:category" component={CategoryPage} />
          {/* 撅支?嚗擃極?琿???/tools/:category/:toolName */}
          <Route path="/tools/:category/:toolName" component={ToolPage} />

          {/* ?亥?摨思?撅斗瑽?*/}
          {/* 撅支?嚗霅澈擐? - 12 ??憿??*/}
          <Route path="/blog" component={BlogList} />
          {/* 撅支?嚗?憿?蝡?銵?/blog/:category */}
          <Route path="/blog/:category" component={BlogCategoryPage} />
          {/* 撅支?嚗?蝡???/blog/:category/:articleId */}
          <Route path="/blog/:category/:articleId" component={BlogArticle} />

          {/* 瘜?? */}
          <Route path="/about" component={About} />`r`n          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />

          {/* 敺蝞∠? */}
          <Route path="/admin" component={AdminDashboard} />

          {/* ?餃? */}
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


