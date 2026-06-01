#!/usr/bin/env python3
"""QC: homepage tool links must point to registered, implemented tool paths."""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOME = ROOT / "client/src/pages/Home.tsx"
TOOLS = ROOT / "shared/toolsConfig.ts"
TOOLPAGE = ROOT / "client/src/pages/ToolPage.tsx"


def main() -> int:
    home = HOME.read_text(encoding="utf-8")
    tools = TOOLS.read_text(encoding="utf-8")
    toolpage = TOOLPAGE.read_text(encoding="utf-8")

    registered = set(re.findall(r'path:\s*"(/tools/[^"]+)"', tools))
    implemented = {f"/tools/{m}" for m in re.findall(r'"([a-z]+/[a-z0-9-]+)":\s*lazy\(', toolpage)}
    home_links = sorted(set(re.findall(r'href:\s*"(/tools/[a-z]+/[a-z0-9-]+)"', home)))

    errors: list[str] = []
    for link in home_links:
        if link not in registered:
            errors.append(f"Homepage link is not registered in toolsConfig: {link}")
        if link not in implemented:
            errors.append(f"Homepage link has no ToolPage implementation: {link}")

    print("Homepage Links QC")
    print("=" * 64)
    if errors:
        for err in errors:
            print(f"  ✘ {err}")
        print("=" * 64)
        print("FAILED · remove or correct homepage tool URLs before deployment")
        return 1
    print(f"  ✅ {len(home_links)} homepage tool links are registered and implemented")
    print("=" * 64)
    print("PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
