#!/usr/bin/env node
const site =
  process.env.SITE_URL || "https://my-tools-matrix-production.up.railway.app";
const concurrency = Number(process.env.QC_CONCURRENCY || 12);

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "Codex-QC/1.0" },
    });
    return {
      url,
      status: response.status,
      location: response.headers.get("location") || "",
      contentType: response.headers.get("content-type") || "",
      body: await response.text(),
    };
  } catch (error) {
    return { url, error: error instanceof Error ? error.message : String(error) };
  }
}

function firstMatch(pattern, text) {
  const match = text.match(pattern);
  return match ? match[1] : "";
}

function getCanonical(html) {
  return (
    firstMatch(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i, html) ||
    firstMatch(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i, html)
  );
}

function getRobots(html) {
  return firstMatch(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i, html);
}

const sitemap = await fetchText(`${site.replace(/\/$/, "")}/sitemap.xml`);
const locs = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
let cursor = 0;
const issues = [];
const stats = {
  total: locs.length,
  status: {},
  redirects: 0,
  errors: 0,
  missingCanonical: 0,
  canonicalMismatch: 0,
  noindex: 0,
};

async function worker() {
  while (cursor < locs.length) {
    const url = locs[cursor++];
    const result = await fetchText(url);
    if (result.error) {
      stats.errors += 1;
      issues.push({ url, issue: "fetch error", error: result.error });
      continue;
    }

    stats.status[result.status] = (stats.status[result.status] || 0) + 1;
    if (result.status >= 300 && result.status < 400) {
      stats.redirects += 1;
      issues.push({ url, status: result.status, issue: "redirect", location: result.location });
      continue;
    }
    if (result.status !== 200) {
      issues.push({ url, status: result.status, issue: "non-200" });
      continue;
    }

    const canonical = getCanonical(result.body);
    const robots = getRobots(result.body);
    if (!canonical) {
      stats.missingCanonical += 1;
      issues.push({ url, status: result.status, issue: "missing canonical" });
    } else if (canonical !== url) {
      stats.canonicalMismatch += 1;
      issues.push({ url, status: result.status, issue: "canonical mismatch", canonical });
    }
    if (/noindex/i.test(robots)) {
      stats.noindex += 1;
      issues.push({ url, status: result.status, issue: "noindex", robots });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

console.log(
  JSON.stringify(
    {
      site,
      stats,
      issueSample: issues.slice(0, 50),
    },
    null,
    2,
  ),
);

if (
  stats.total < 806 ||
  stats.errors ||
  stats.redirects ||
  stats.missingCanonical ||
  stats.canonicalMismatch ||
  stats.noindex ||
  Object.keys(stats.status).some((status) => status !== "200")
) {
  process.exit(1);
}
