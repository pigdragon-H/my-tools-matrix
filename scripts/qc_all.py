#!/usr/bin/env python3
"""QC Master · 一鍵跑全部稽核(§A 17-Layer + §E Visual Layout + §F Uniqueness)。"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CHECKS = [
    ("§A · 17-Layer Anatomy",      "scripts/qc_layer_audit.py"),
    ("§E · Visual Layout",         "scripts/qc_layout_audit.py"),
    ("§F · Uniqueness/Anti-Pattern", "scripts/qc_uniqueness_audit.py"),
    ("§G · AdSense Systemic Guardrails", "scripts/qc_adsense_systemic_audit.py"),
]


def main() -> int:
    overall_ok = True
    for label, script in CHECKS:
        print(f"\n{'='*64}")
        print(f"  {label}")
        print('='*64, flush=True)
        proc = subprocess.run(
            ["python3", "-u", str(ROOT / script)],
            cwd=ROOT,
        )
        rc = proc.returncode
        if rc != 0:
            print(f"  ⚠ {script} returned exit code {rc}")
            overall_ok = False

    print("\n" + "="*64)
    if overall_ok:
        print("  ✅ ALL QC CHECKS PASSED")
        return 0
    print("  ❌ Some QC checks failed (see above)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
