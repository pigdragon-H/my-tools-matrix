// ============================================================
// AdSenseWrapper - 廣告注入組件
// 支援延遲載入（Lazy Loading），避免影響首屏效能
// ============================================================

import { useEffect, useRef, useState } from "react";
import { isEnabled } from "@/config/featureFlags";

interface AdSenseWrapperProps {
  showAds: boolean;
  adSlot?: string;
  adFormat?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

export function AdSenseWrapper({
  showAds,
  adSlot = "demo-slot",
  adFormat = "auto",
  className = "",
}: AdSenseWrapperProps) {
  const realAdsEnabled = isEnabled("ENABLE_REAL_ADSENSE");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!showAds) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [showAds]);

  // Load AdSense script when visible
  useEffect(() => {
    if (!isVisible || adLoaded) return;

    // TODO: Replace with actual AdSense publisher ID
    // const script = document.createElement("script");
    // script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    // script.async = true;
    // script.dataset.adClient = "ca-pub-XXXXXXXXXXXXXXXX";
    // document.head.appendChild(script);

    setAdLoaded(true);
  }, [isVisible, adLoaded]);

  if (!showAds || !realAdsEnabled) return null;

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {isVisible ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground text-xs"
          style={{
            minHeight: adFormat === "horizontal" ? "90px" : "250px",
          }}
        >
          {/* 
            Production: Replace this div with actual AdSense ins tag:
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot={adSlot}
              data-ad-format={adFormat}
              data-full-width-responsive="true"
            />
          */}
          <span className="select-none">Sponsored content area</span>
        </div>
      ) : (
        <div
          className="rounded-lg bg-muted/10"
          style={{ minHeight: adFormat === "horizontal" ? "90px" : "250px" }}
        />
      )}
    </div>
  );
}
