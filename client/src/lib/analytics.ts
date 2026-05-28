function isConfigured(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !value.includes("%VITE_") &&
    !value.includes("undefined") &&
    !value.includes("null")
  );
}

export function initializeAnalytics() {
  if (typeof document === "undefined") return;

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

  if (!isConfigured(endpoint) || !isConfigured(websiteId)) {
    return;
  }

  if (document.querySelector('script[data-tools-matrix-analytics="umami"]')) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  script.dataset.toolsMatrixAnalytics = "umami";
  document.head.appendChild(script);
}
