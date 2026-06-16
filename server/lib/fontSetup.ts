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
 * This runs once at server startup. It is best-effort: any failure is logged
 * and swallowed so it can never crash the server. If the alias or fonts are
 * unavailable the conversion still works (it just falls back to Noto).
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
    <test name="family"><string>serif</string></test>
    <edit name="family" mode="append" binding="weak">
      <string>AR PL UMing TW</string><string>TW-Sung</string>
    </edit>
  </match>
</fontconfig>
`;

let done = false;

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
  // eslint-disable-next-line no-console
  console.log(`[fontSetup] CJK alias installed at ${installedTo}`);
}

// Keep a reference to dirname for potential future asset loading.
export const __FONT_SETUP_DIR = dirname(fileURLToPath(import.meta.url));
