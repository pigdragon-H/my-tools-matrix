/**
 * CJK font setup for high-fidelity Word→PDF conversion.
 *
 * The SOONTOP quotation (and most Taiwanese .docx) reference Windows-only
 * Traditional-Chinese fonts (標楷體 / 新細明體 / 華康粗明體). On the Linux
 * server these don't exist, so LibreOffice falls back to Noto Sans CJK — a
 * wider, heavier black-body (黑體) face whose larger glyph advance widths
 * inflate every line, overflow the fixed-width quotation table cells, and push
 * the layout out of place ("字體膨脹位移"), sometimes dropping the footer.
 *
 * We install a fontconfig alias that maps those Windows font names onto AR PL
 * UKai/UMing and TW-Kai/TW-Sung — Traditional-Chinese Kaiti/Mingti faces whose
 * proportions closely match the originals — so the exported PDF matches the
 * Smallpdf gold standard.
 *
 * This is ensured before the first conversion attempt, then cached in-process.
 * It is best-effort: any failure is logged and swallowed so it can never crash
 * the server. If the alias or fonts are unavailable the conversion still works
 * (it just falls back to a less-faithful substitute face).
 */
import { execFile } from "node:child_process";
import { mkdir, writeFile, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Inlined so it works regardless of how the server is bundled/deployed.
// Mirrors server/assets/61-mtm-cjk-alias.conf (kept in sync).
const ALIAS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <match target="pattern">
    <test name="family"><string>標楷體</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UKai TW</string><string>TW-Kai</string><string>AR PL UKai HK</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>DFKai</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UKai TW</string><string>TW-Kai</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>DFKai-SB</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UKai TW</string><string>TW-Kai</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>BiauKai</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UKai TW</string><string>TW-Kai</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>新細明體</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UMing TW</string><string>TW-Sung</string><string>AR PL UMing HK</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>細明體</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>PMingLiU</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>MingLiU</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>華康粗明體</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>微軟正黑體</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans CJK TC</string><string>WenQuanYi Zen Hei</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>Microsoft JhengHei</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans CJK TC</string><string>WenQuanYi Zen Hei</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>Microsoft JhengHei UI</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans CJK TC</string><string>WenQuanYi Zen Hei</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>serif</string></test>
    <edit name="family" mode="append" binding="weak">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
  <match target="pattern">
    <test name="family"><string>sans-serif</string></test>
    <edit name="family" mode="append" binding="weak">
      <string>Noto Sans CJK TC</string><string>WenQuanYi Zen Hei</string>
    </edit>
  </match>
</fontconfig>
`;

let done = false;
const VERIFY_FAMILIES: Array<{ requested: string; expected: string[] }> = [
  { requested: "標楷體", expected: ["AR PL UKai TW", "TW-Kai", "AR PL UKai HK"] },
  { requested: "DFKai", expected: ["AR PL UKai TW", "TW-Kai"] },
  { requested: "DFKai-SB", expected: ["AR PL UKai TW", "TW-Kai"] },
  { requested: "新細明體", expected: ["AR PL UMing TW", "TW-Sung", "AR PL UMing HK"] },
  { requested: "PMingLiU", expected: ["AR PL UMing TW", "TW-Sung"] },
  { requested: "微軟正黑體", expected: ["Noto Sans CJK TC", "WenQuanYi Zen Hei"] },
  { requested: "Microsoft JhengHei", expected: ["Noto Sans CJK TC", "WenQuanYi Zen Hei"] },
];

/**
 * Install the CJK fontconfig alias and refresh the font cache. Idempotent and
 * best-effort — never throws.
 */
export async function ensureCjkFonts(): Promise<void> {
  if (done) return;
  done = true;

  // Candidate locations, in order of preference. The first writable one wins.
  const candidates = [
    "/etc/fonts/conf.d",
    join(process.env.HOME || "/root", ".config/fontconfig/conf.d"),
  ];

  let installedTo: string | null = null;
  for (const dir of candidates) {
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "61-mtm-cjk-alias.conf"), ALIAS_CONF, "utf8");
      installedTo = dir;
      break;
    } catch {
      // try next candidate
    }
  }

  if (!installedTo) {
    // eslint-disable-next-line no-console
    console.warn("[fontSetup] could not install CJK alias (no writable conf.d)");
    return;
  }

  // Refresh fontconfig cache so soffice picks up the alias immediately.
  try {
    await execFileAsync("fc-cache", ["-f"], { timeout: 30_000 });
  } catch {
    // fc-cache may be missing in some images; the alias still applies on next
    // fontconfig read, so this is non-fatal.
  }

  // Light verification (logged only).
  try {
    await access("/usr/share/fonts", FS.R_OK);
  } catch {
    /* noop */
  }

  await verifyFontAliases();

  // eslint-disable-next-line no-console
  console.log(`[fontSetup] CJK alias installed at ${installedTo}`);
}

async function verifyFontAliases(): Promise<void> {
  for (const { requested, expected } of VERIFY_FAMILIES) {
    try {
      const { stdout } = await execFileAsync("fc-match", [requested, "--format=%{family}\n"], {
        timeout: 10_000,
      });
      const resolved = stdout.trim();
      const ok = expected.some((name) => resolved.includes(name));
      if (ok) {
        // eslint-disable-next-line no-console
        console.log(`[fontSetup] alias OK: ${requested} -> ${resolved}`);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[fontSetup] alias VERIFY mismatch: ${requested} -> ${resolved || "(empty)"}; expected one of ${expected.join(", ")}`
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[fontSetup] alias VERIFY skipped for ${requested}: ${(error as Error).message}`);
    }
  }
}

// Keep a reference to dirname for potential future asset loading.
export const __FONT_SETUP_DIR = dirname(fileURLToPath(import.meta.url));
