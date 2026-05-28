import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense } from "react";

const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
};

export function ToolPage() {
  const { category, toolName } = useParams<{ category: string; toolName: string }>();

  if (!category || !toolName) {
    return <div>Invalid tool path</div>;
  }

  const toolKey = `${category}/${toolName}`;
  const Component = toolComponentMap[toolKey];

  if (!Component) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <button className="mb-4 flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
          <div className="rounded-lg bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-slate-900">Tool not found</h1>
            <p className="mt-2 text-slate-600">The requested tool could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-slate-600">Loading tool...</p>
          </div>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}
