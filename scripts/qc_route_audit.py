#!/usr/bin/env python3
"""QC §R Route Registration Audit · Triple-binding integrity check

When a tool component exists at `client/src/tools/<category>/<ToolName>/index.tsx`,
its kebab-path `<category>/<tool-name>` MUST appear in ALL THREE places:

  1. client/src/pages/ToolPage.tsx        → toolComponentMap entry (lazy import)
  2. shared/toolsConfig.ts                → tools[] entry with full metadata
  3. client/src/pages/Home.tsx            → href in card list (recommended)

Missing #1 or #2 → live 404 ("找不到此工具" fallback).
Missing #3      → Soft warning (tool works but not surfaced on home).

Usage:
    python3 scripts/qc_route_audit.py

Exit codes:
    0 — all green
    1 — at least one critical (1/2) miss
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS_DIR = ROOT / "client/src/tools"
TOOL_PAGE = ROOT / "client/src/pages/ToolPage.tsx"
TOOLS_CONFIG = ROOT / "shared/toolsConfig.ts"
HOME = ROOT / "client/src/pages/Home.tsx"


def kebab(camel: str) -> str:
    """Convert PascalCase folder names to canonical kebab slugs.

    Aligns this route audit with Gate 1 / registry naming for mixed numeric and
    one-letter acronym cases, e.g.:
    Retirement401kCalculator → retirement-401k-calculator
    RuleOf72Calculator → rule-of-72-calculator
    VitaminDCalculator → vitamin-d-calculator
    """
    # Split acronym-to-word boundaries first: VitaminDCalculator → VitaminD-Calculator
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", camel)
    # Split lower/digit to upper: RuleOf → Rule-Of
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s)
    # Split letter to digit: Retirement401k → Retirement-401k; Of72 → Of-72
    s = re.sub(r"([A-Za-z])([0-9])", r"\1-\2", s)
    # Preserve common technical token spellings used by the registry.
    s = s.replace("Base-64", "Base64").replace("base-64", "base64")
    return s.lower()


def discover_implemented_tools() -> list[tuple[str, str, Path]]:
    """Find all client/src/tools/<cat>/<ToolName>/index.tsx → return (category, tool-name, path)."""
    found: list[tuple[str, str, Path]] = []
    if not TOOLS_DIR.exists():
        return found
    for cat_dir in sorted(TOOLS_DIR.iterdir()):
        if not cat_dir.is_dir():
            continue
        for tool_dir in sorted(cat_dir.iterdir()):
            if not tool_dir.is_dir():
                continue
            idx = tool_dir / "index.tsx"
            if idx.exists():
                found.append((cat_dir.name, kebab(tool_dir.name), idx))
    return found


def audit() -> int:
    tools = discover_implemented_tools()
    if not tools:
        print("⚠️  No implemented tools found under client/src/tools/")
        return 0

    tool_page_src = TOOL_PAGE.read_text(encoding="utf-8") if TOOL_PAGE.exists() else ""
    config_src = TOOLS_CONFIG.read_text(encoding="utf-8") if TOOLS_CONFIG.exists() else ""
    home_src = HOME.read_text(encoding="utf-8") if HOME.exists() else ""

    total_critical_fails = 0
    total_soft_warns = 0

    print(f"🔍 qc_route_audit · scanning {len(tools)} implemented tool(s)\n")

    for category, tool_name, idx_path in tools:
        key = f"{category}/{tool_name}"
        full_path = f"/tools/{key}"

        # Check 1: toolComponentMap key in ToolPage.tsx
        in_toolpage = bool(re.search(
            rf'["\']{re.escape(key)}["\']\s*:', tool_page_src
        ))

        # Check 2: tools[] path in shared/toolsConfig.ts
        in_config = bool(re.search(
            rf'path:\s*["\']{re.escape(full_path)}["\']', config_src
        ))

        # Check 3: href in Home.tsx (soft)
        in_home = bool(re.search(
            rf'href:\s*["\']{re.escape(full_path)}["\']', home_src
        ))

        rel = idx_path.relative_to(ROOT)
        marks = []
        marks.append("✅ ToolPage" if in_toolpage else "❌ ToolPage")
        marks.append("✅ toolsConfig" if in_config else "❌ toolsConfig")
        marks.append("✅ Home" if in_home else "⚠️  Home")

        critical_fail = (not in_toolpage) or (not in_config)
        soft_warn = not in_home

        status_icon = "🔴" if critical_fail else ("🟡" if soft_warn else "🟢")

        print(f"{status_icon} {key:<40} {' · '.join(marks)}")
        print(f"   ↳ {rel}")

        if critical_fail:
            total_critical_fails += 1
            if not in_toolpage:
                print(f"   ⚠️  Missing in ToolPage.tsx toolComponentMap:")
                print(f"      \"{key}\": lazy(() => import(\"@/tools/{key.split('/')[0]}/<ToolName>\")),")
            if not in_config:
                print(f"   ⚠️  Missing in shared/toolsConfig.ts tools[]:")
                print(f"      {{ id: \"{tool_name}\", category: \"{category}\", path: \"{full_path}\", ... }}")
        if soft_warn:
            total_soft_warns += 1
            print(f"   ℹ️  Not surfaced in Home.tsx cards (soft warning)")

        print()

    print("=" * 60)
    print(f"Summary: {len(tools)} tool(s) scanned · "
          f"{total_critical_fails} critical · {total_soft_warns} soft warning")
    print("=" * 60)

    if total_critical_fails > 0:
        print("\n❌ FAIL — fix critical registrations before deploy.")
        return 1
    if total_soft_warns > 0:
        print("\n🟡 PASS with soft warnings — consider surfacing in Home.tsx.")
        return 0
    print("\n✅ ALL ROUTE REGISTRATIONS GREEN.")
    return 0


if __name__ == "__main__":
    sys.exit(audit())
