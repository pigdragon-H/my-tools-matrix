import { Router, Route } from "wouter";
import { ToolPage } from "./pages/ToolPage";

export default function App() {
  return (
    <Router>
      <Route path="/tools/:category/:toolName" component={ToolPage} />
      <Route path="/">
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Formula Universe</h1>
            <p className="text-lg text-slate-600 mb-8">
              Welcome to Formula Universe. Select a tool to get started.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="/tools/health/bmi-calculator"
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">BMI Calculator</h2>
                <p className="text-slate-600">
                  Calculate your Body Mass Index and get personalized health insights.
                </p>
              </a>
              <a
                href="/tools/health/bmr-calculator"
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">BMR Calculator</h2>
                <p className="text-slate-600">
                  Calculate your Basal Metabolic Rate to understand your daily calorie needs.
                </p>
              </a>
            </div>
          </div>
        </div>
      </Route>
    </Router>
  );
}
