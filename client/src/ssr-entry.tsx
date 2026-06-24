import "../../server/_core/ws-polyfill";
import { renderToString } from "react-dom/server";
import App from "./App";
import { getSsrMetaTags, resetSsrMetaTags, setSeoMeta } from "./lib/seo";
import { getSsrMetaInfo } from "./lib/seo-ssr-helper";

export function render(url: string): string {
  // SSR 時重置 meta 標籤
  resetSsrMetaTags();
  
  // 根據路徑獲取 meta 信息並設定
  const metaInfo = getSsrMetaInfo(url);
  setSeoMeta({
    title: metaInfo.title,
    description: metaInfo.description,
    noindex: metaInfo.noindex,
  });
  
  return renderToString(<App ssrPath={url} />);
}

export { getSsrMetaTags, resetSsrMetaTags };
