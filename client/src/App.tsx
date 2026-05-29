import { Router, Route } from "wouter";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import About from "./pages/About";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">
              <Route path="/" component={Home} />
              <Route path="/blog" component={BlogList} />
              <Route path="/about" component={About} />
              <Route path="/category/:category" component={CategoryPage} />
              <Route path="/tools/:category/:toolName" component={ToolPage} />
            </main>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
