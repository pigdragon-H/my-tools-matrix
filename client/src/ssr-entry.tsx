import "../../server/_core/ws-polyfill";
import { renderToString } from "react-dom/server";
import App from "./App";
import { getSsrMetaTags, resetSsrMetaTags } from "./lib/seo";

export function render(url: string): string {
  return renderToString(<App ssrPath={url} />);
}

export { getSsrMetaTags, resetSsrMetaTags };
