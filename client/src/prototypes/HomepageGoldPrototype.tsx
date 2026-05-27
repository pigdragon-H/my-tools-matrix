const quickSearchModes = [
  {
    label: "Search tools",
    helper: "Find calculators by name, category, or problem.",
  },
  {
    label: "Search knowledge",
    helper: "Find guides, examples, formulas, and limitations.",
  },
  {
    label: "Search topics",
    helper: "Find semantic hubs such as health, finance, API, or FIRE.",
  },
];

const trendingTools = ["BMI", "CAGR", "JSON Formatter", "Mortgage", "TDEE"];

const trendingTopics = ["Retirement", "Weight Loss", "API", "JSON", "FIRE"];

const discoveryFlow = ["Search", "Topic", "Tool", "Knowledge", "Journey"];

const journeyCards = [
  {
    title: "Retirement Journey",
    intent: "Plan long-term independence with growth and withdrawal context.",
    steps: ["FIRE", "CAGR", "Retirement", "Withdrawal"],
  },
  {
    title: "Weight Loss Journey",
    intent: "Move from screening to energy planning and progress context.",
    steps: ["BMI", "BMR", "Calories", "Progress"],
  },
  {
    title: "Developer Journey",
    intent: "Clean data, connect API workflows, validate patterns, and ship.",
    steps: ["JSON", "API", "Regex", "Deploy"],
  },
];

const nextStepSuggestions = [
  "Pick a topic if the goal is broad.",
  "Open a tool if the calculation is known.",
  "Read knowledge if the result needs context.",
  "Follow a journey if the task has multiple steps.",
];

const featuredTools = [
  {
    label: "BMI Calculator",
    intent: "Screen weight category and continue into energy planning.",
    cluster: "BMI → BMR → TDEE → Calories",
  },
  {
    label: "Compound Interest",
    intent: "Estimate long-term growth and compare saving scenarios.",
    cluster: "Principal → Rate → Time → Growth",
  },
  {
    label: "Percentage Calculator",
    intent: "Solve discounts, increases, ratios, and everyday math.",
    cluster: "Percent → Discount → Tax → Tip",
  },
  {
    label: "Date Difference",
    intent: "Count days, compare dates, and plan time windows.",
    cluster: "Start → End → Difference → Planning",
  },
];

const featuredTopics = [
  {
    label: "Health planning",
    summary: "BMI, BMR, TDEE, calories, progress, and safety disclaimers.",
  },
  {
    label: "Personal finance",
    summary: "Interest, payments, affordability, savings, and comparison paths.",
  },
  {
    label: "Everyday math",
    summary: "Percentages, conversions, date math, ratios, and quick formulas.",
  },
];

const explorerGroups = [
  "Health calculators",
  "Finance calculators",
  "Math helpers",
  "Unit converters",
  "Date and time tools",
  "Developer utilities",
];

const knowledgeCards = [
  "Formula explanations",
  "Examples and limitations",
  "Source and review policy",
];

const latestGuides = [
  "How BMI, BMR, and TDEE work together",
  "How compound interest changes over time",
  "How to choose the right percentage formula",
];

const clusterSteps = ["BMI", "BMR", "TDEE", "Calories", "Progress"];

export default function HomepageGoldPrototype() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.34),_transparent_36%),linear-gradient(135deg,_#020617,_#0f172a_54%,_#111827)] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
              Hero · Formula Universe · Homepage Gold Prototype v3
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Calculate, understand, and continue through connected formulas.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              A prototype-only homepage experience that adds discovery search, trending intent, journey cards, and next-step suggestions.
            </p>
            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-h-14 flex-1 items-center rounded-2xl bg-white px-5 text-slate-500">
                  Search calculators, formulas, topics, or guides
                </div>
                <button className="rounded-2xl bg-blue-400 px-6 py-4 font-bold text-slate-950">Explore universe</button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/15 px-4 py-2">Static prototype</span>
              <span className="rounded-full border border-white/15 px-4 py-2">Placeholder search only</span>
              <span className="rounded-full border border-white/15 px-4 py-2">No production imports</span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-100">Discovery Flow</p>
            <div className="mt-5 grid gap-3">
              {discoveryFlow.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-300 font-black text-slate-950">{index + 1}</span>
                  <span className="text-lg font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-sky-700">Quick Search</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Start discovery from tools, knowledge, or topics.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">Placeholder only. The prototype shows search intent categories without implementing query logic.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {quickSearchModes.map((mode) => (
              <article key={mode.label} className="rounded-3xl border border-sky-100 bg-sky-50 p-7 shadow-sm">
                <div className="mb-5 h-12 w-12 rounded-2xl bg-sky-200" />
                <h3 className="text-2xl font-black">{mode.label}</h3>
                <p className="mt-3 text-slate-600">{mode.helper}</p>
                <div className="mt-6 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-sky-800">Search placeholder</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">Trending Tools</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">High-intent calculator shortcuts.</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {trendingTools.map((tool) => (
                <span key={tool} className="rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-base font-black text-blue-800">{tool}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Trending Topics</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Semantic entry points for exploration.</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {trendingTopics.map((topic) => (
                <span key={topic} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-base font-black text-emerald-800">{topic}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">Discovery Flow</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Search becomes a guided journey.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {discoveryFlow.map((step, index) => (
              <div key={step} className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-200 font-black text-indigo-900">{index + 1}</div>
                <h3 className="text-xl font-black">{step}</h3>
                <p className="mt-2 text-sm text-slate-600">Discovery layer placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Journey Cards</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Turn discovery into multi-step outcomes.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">Prototype-only journey cards show how topics, tools, and knowledge can connect into guided paths.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {journeyCards.map((journey) => (
              <article key={journey.title} className="rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-2xl">
                <h3 className="text-2xl font-black">{journey.title}</h3>
                <p className="mt-3 min-h-20 text-slate-300">{journey.intent}</p>
                <div className="mt-6 grid gap-3">
                  {journey.steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 font-black text-slate-950">{index + 1}</span>
                      <span className="text-lg font-bold">{step}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-50 px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">Next Step Suggestions</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">What should I do next?</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">After discovery, the homepage should help users decide whether to browse a topic, open a tool, read context, or continue into a journey.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {nextStepSuggestions.map((suggestion, index) => (
              <div key={suggestion} className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 font-black text-amber-950">{index + 1}</div>
                <p className="text-lg font-bold leading-7 text-slate-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">Featured Tools</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Fast paths into high-value calculators.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">Curated tool cards support direct calculator intent while previewing the next semantic journey.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredTools.map((tool) => (
              <article key={tool.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 h-12 w-12 rounded-2xl bg-blue-100" />
                <h3 className="text-2xl font-black">{tool.label}</h3>
                <p className="mt-3 min-h-20 text-slate-600">{tool.intent}</p>
                <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-700">{tool.cluster}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Featured Topics</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Start from the problem, not the category.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredTopics.map((topic) => (
              <article key={topic.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="text-2xl font-black">{topic.label}</h3>
                <p className="mt-3 text-lg leading-8 text-slate-600">{topic.summary}</p>
                <div className="mt-6 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Topic placeholder</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Universe Explorer</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Browse the full formula graph.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">A prototype explorer that can later become the central browsing system across categories, formulas, tools, topics, and guides.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {explorerGroups.map((group) => (
              <div key={group} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <div className="mb-4 h-2 w-20 rounded-full bg-cyan-300" />
                <h3 className="text-xl font-black">{group}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">Category group placeholder with future tool and guide links.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">Knowledge Hub</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Every calculation needs context.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {knowledgeCards.map((card) => (
              <article key={card} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-5 h-12 rounded-2xl bg-violet-100" />
                <h3 className="text-2xl font-black">{card}</h3>
                <p className="mt-3 text-slate-600">Placeholder for explainers, limitations, examples, and source-backed review signals.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">Tool Clusters</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">One result should lead to the next useful step.</h2>
          <div className="mt-9 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 md:grid-cols-5">
              {clusterSteps.map((step, index) => (
                <div key={step} className="relative rounded-3xl border border-orange-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-black text-orange-800">{index + 1}</div>
                  <h3 className="text-xl font-black">{step}</h3>
                  <p className="mt-2 text-sm text-slate-600">Journey step placeholder</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-14 text-slate-950 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">Latest Guides</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Fresh knowledge keeps the universe alive.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {latestGuides.map((guide) => (
              <article key={guide} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-rose-700">Guide placeholder</p>
                <h3 className="text-2xl font-black">{guide}</h3>
                <p className="mt-3 text-slate-600">Short summary placeholder for an educational article linked back to relevant tools.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-12 text-slate-200 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-5">
          {["Tools", "Topics", "Knowledge", "Company", "Legal"].map((group) => (
            <div key={group}>
              <h2 className="text-lg font-black text-white">{group}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <p>Footer link placeholder</p>
                <p>Footer link placeholder</p>
                <p>Footer link placeholder</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-500">
          Prototype only · static placeholders · not connected to production navigation or configuration.
        </div>
      </footer>
    </main>
  );
}
