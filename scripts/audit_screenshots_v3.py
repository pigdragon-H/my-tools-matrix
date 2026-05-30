#!/usr/bin/env python3
"""Phase G Sprint F — visual regression after Tech×Nature Calm palette + Sprint E rewrites.

Captures 14 routes in light/dark/mobile (3 viewports per route = 42 screenshots).
Output: /workspace/audit-v3/{light,dark,mobile}/{route}.png
"""
import asyncio, os, pathlib
from playwright.async_api import async_playwright

BASE = "http://localhost:5183"
OUT  = pathlib.Path("/workspace/audit-v3")

ROUTES = [
    ("home",            "/"),
    ("about",           "/about"),
    ("dev",             "/category/dev"),
    ("health",          "/category/health"),
    ("finance",         "/category/finance"),
    ("media",           "/category/media"),
    ("knowledge",       "/category/knowledge"),
    ("life",            "/category/life"),
    ("bmi",             "/tools/health/bmi"),
    ("bmr",             "/tools/health/bmr"),
    ("editorial",       "/editorial"),
    ("privacy",         "/privacy"),
    ("terms",           "/terms"),
    ("notfound",        "/this-route-does-not-exist"),
]

VIEWPORTS = {
    "light":  {"w": 1440, "h": 900,  "dark": False},
    "dark":   {"w": 1440, "h": 900,  "dark": True},
    "mobile": {"w":  390, "h": 844,  "dark": False},
}

async def capture(page, route_name, url, mode, dark):
    target = OUT / mode / f"{route_name}.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        await page.goto(BASE + url, wait_until="networkidle", timeout=20000)
    except Exception as e:
        print(f"  ! {mode}/{route_name}: nav timeout — {e}")
    # apply dark class manually (app uses .dark on <html>, controlled by localStorage)
    if dark:
        await page.evaluate("document.documentElement.classList.add('dark')")
    else:
        await page.evaluate("document.documentElement.classList.remove('dark')")
    # let framer-motion settle, then trigger viewport-aware reveals by scrolling
    await page.wait_for_timeout(400)
    try:
        await page.evaluate("""async () => {
            const h = document.body.scrollHeight;
            for (let y = 0; y < h; y += 600) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 90));
            }
            window.scrollTo(0, 0);
            await new Promise(r => setTimeout(r, 400));
        }""")
    except Exception:
        pass
    await page.wait_for_timeout(500)
    await page.screenshot(path=str(target), full_page=True)
    size = target.stat().st_size // 1024
    print(f"  ✓ {mode}/{route_name}.png ({size}kB)")

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for mode, vp in VIEWPORTS.items():
            print(f"\n=== {mode} ({vp['w']}×{vp['h']}, dark={vp['dark']}) ===")
            ctx = await browser.new_context(
                viewport={"width": vp["w"], "height": vp["h"]},
                color_scheme="dark" if vp["dark"] else "light",
                device_scale_factor=1,
            )
            page = await ctx.new_page()
            # force theme: app may use prefers-color-scheme OR a class — try both
            for name, url in ROUTES:
                await capture(page, name, url, mode, vp["dark"])
            await ctx.close()
        await browser.close()
    print(f"\nDone → {OUT}")

if __name__ == "__main__":
    asyncio.run(main())
