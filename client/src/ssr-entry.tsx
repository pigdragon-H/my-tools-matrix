import "../../server/_core/ws-polyfill";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import App from "./App";
import { getSsrMetaTags, resetSsrMetaTags, setSeoMeta } from "./lib/seo";
import { getSsrMetaInfo } from "./lib/seo-ssr-helper";

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // SSR 時重置 meta 標籤
    resetSsrMetaTags();

    // 根據路徑獲取 meta 信息並設定
    const metaInfo = getSsrMetaInfo(url);
    setSeoMeta({
      title: metaInfo.title,
      description: metaInfo.description,
    }, url);

    let html = "";
    const writable = new PassThrough();
    writable.on("data", (chunk) => {
      html += chunk;
    });
    writable.on("end", () => resolve(html));
    writable.on("error", reject);

    const { pipe } = renderToPipeableStream(<App ssrPath={url} />, {
      onAllReady() {
        // 等所有 Suspense boundary 都真正 resolve 完，才開始輸出
        pipe(writable);
      },
      onError(err) {
        reject(err);
      },
    });
  });
}

export { getSsrMetaTags, resetSsrMetaTags };
