import { Router, Route, Switch } from "wouter";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Editorial from "./pages/Editorial";
import CategoryPage from "./pages/CategoryPage";
import AllToolsPage from "./pages/AllToolsPage";
import ToolPage from "./pages/ToolPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleEditor from "./pages/admin/AdminArticleEditor";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHealth from "./pages/admin/AdminHealth";
import BlogPost from "./pages/BlogPost";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import { TrpcProvider } from "./_core/TrpcProvider";
import { ProtectedAdminRoute } from "./_core/ProtectedAdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import type { ReactNode } from "react";

function AdminPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedAdminRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable>
      <LanguageProvider>
        <TrpcProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navbar />
              <main className="flex-1">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/blog" component={BlogList} />
                  <Route path="/blog/:slug" component={BlogPost} />
                  <Route path="/about" component={About} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/terms" component={Terms} />
                  <Route path="/editorial" component={Editorial} />
                  <Route path="/category/:category" component={CategoryPage} />
                  <Route path="/tools" component={AllToolsPage} />
                  <Route path="/tools/:category/:toolName" component={ToolPage} />
                  <Route path="/tools/:category" component={CategoryPage} />
                  <Route path="/login" component={Login} />
                  <Route path="/admin">
                    <AdminPage>
                      <AdminDashboard />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/articles">
                    <AdminPage>
                      <AdminArticles />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/articles/new">
                    <AdminPage>
                      <AdminArticleEditor />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/articles/:id">
                    <AdminPage>
                      <AdminArticleEditor />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/settings">
                    <AdminPage>
                      <AdminSettings />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/users">
                    <AdminPage>
                      <AdminUsers />
                    </AdminPage>
                  </Route>
                  <Route path="/admin/health">
                    <AdminPage>
                      <AdminHealth />
                    </AdminPage>
                  </Route>
                </Switch>
              </main>
            </div>
          </Router>
        </TrpcProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
