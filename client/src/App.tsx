import { Router, Route } from "wouter";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Editorial from "./pages/Editorial";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import { TrpcProvider } from "./_core/TrpcProvider";
import { ProtectedAdminRoute } from "./_core/ProtectedAdminRoute";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable>
      <LanguageProvider>
        <TrpcProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navbar />
              <main className="flex-1">
                <Route path="/" component={Home} />
                <Route path="/blog" component={BlogList} />
                <Route path="/about" component={About} />
                <Route path="/privacy" component={Privacy} />
                <Route path="/terms" component={Terms} />
                <Route path="/editorial" component={Editorial} />
                <Route path="/category/:category" component={CategoryPage} />
                <Route path="/tools/:category/:toolName" component={ToolPage} />
                <Route path="/login" component={Login} />
                <Route path="/admin">
                  <ProtectedAdminRoute>
                    <AdminHome />
                  </ProtectedAdminRoute>
                </Route>
              </main>
            </div>
          </Router>
        </TrpcProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
