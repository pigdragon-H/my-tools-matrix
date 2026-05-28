import { Router, Route } from "wouter";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import { ToolPage } from "./pages/ToolPage";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/tools/:category/:toolName" component={ToolPage} />
    </Router>
  );
}
