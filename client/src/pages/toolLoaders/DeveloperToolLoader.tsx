import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "developer/json-formatter": lazy(() => import("@/tools/developer/JsonFormatter")),
  "developer/base64-encoder": lazy(() => import("@/tools/developer/Base64Encoder")),
  "developer/url-encoder": lazy(() => import("@/tools/developer/UrlEncoder")),
  "developer/regex-tester": lazy(() => import("@/tools/developer/RegexTester")),
  "developer/color-converter": lazy(() => import("@/tools/developer/ColorConverter")),
  "developer/timestamp-converter": lazy(() => import("@/tools/developer/TimestampConverter")),
  "developer/markdown-preview": lazy(() => import("@/tools/developer/MarkdownPreview")),
  "developer/diff-checker": lazy(() => import("@/tools/developer/DiffChecker")),
  "developer/csv-to-json": lazy(() => import("@/tools/developer/CsvToJson")),
  "developer/hash-generator": lazy(() => import("@/tools/developer/HashGenerator")),
  "developer/html-encoder": lazy(() => import("@/tools/developer/HtmlEncoder")),
  "developer/jwt-decoder": lazy(() => import("@/tools/developer/JwtDecoder")),
  "developer/cron-expression": lazy(() => import("@/tools/developer/CronExpression")),
  "developer/ip-calculator": lazy(() => import("@/tools/developer/IpCalculator")),
  "developer/color-palette-generator": lazy(() => import("@/tools/developer/ColorPaletteGenerator")),
  "developer/password-generator": lazy(() => import("@/tools/developer/PasswordGenerator")),
  "developer/qr-code-generator": lazy(() => import("@/tools/developer/QrCodeGenerator")),
  "developer/markdown-to-html": lazy(() => import("@/tools/developer/MarkdownToHtml")),
  "developer/number-base-converter": lazy(() => import("@/tools/developer/NumberBaseConverter")),
  "developer/uuid-generator": lazy(() => import("@/tools/developer/UuidGenerator")),
  "developer/lorem-ipsum-generator": lazy(() => import("@/tools/developer/LoremIpsumGenerator")),
  "developer/code-minifier": lazy(() => import("@/tools/developer/CodeMinifier")),
  "developer/image-to-base64": lazy(() => import("@/tools/developer/ImageToBase64")),
  "developer/chmod-calculator": lazy(() => import("@/tools/developer/ChmodCalculator")),
  "developer/hex-to-rgb": lazy(() => import("@/tools/developer/HexToRgb")),
  "developer/html-to-markdown": lazy(() => import("@/tools/developer/HtmlToMarkdown")),
};

export default function DeveloperToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
