import { Router, Route } from "wouter";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/category/:category" component={CategoryPage} />
        <Route path="/tools/:category/:toolName" component={ToolPage} />
      </Router>
    </LanguageProvider>
  );
}
