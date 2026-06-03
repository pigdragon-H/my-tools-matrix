# Mass Production SOP — Tool Rewrite Cycle (v2)

**Internalized after D-09 black-hole feedback (2026-06-03).**
**Violation = supplier deduction. Zero tolerance.**

## The Seven Steps (NEVER SKIP)

```
1. Write code (EXACTLY mirror the gold template — JsonFormatter)
2. TS check (tsc --noEmit) + Gate 1 (validate-registry) + Gate 2 (qc_blackhole.mjs)
3. Local Vite build (vite build) → start local preview station (port 5173)
4. Local visual QC: capture screenshot of new tool AND gold template, compare 17 layers
5. ATOMIC commit/push (5a-5e, see below)
6. Report HASH to Victor → that's how "my side is done" is recognized
7. Move to next tool — only after Victor confirms previous one
```

## Step 5 ATOMIC SUB-STEPS (post-D-09, mandatory)

```
5a. git add EVERY relevant file (don't trust -m to add modifieds)
    git add shared/toolsConfig.ts client/src/pages/ToolPage.tsx \
            client/src/tools/<category>/<Name>/index.tsx
    git status                          # NO " M ..." lines should remain

5b. git commit -m "feat(<category>): <tool-name> — <gold-template> 17 layers"

5c. VERIFY commit completeness (Gate 3)
    npm run qc:commit                   # must PASS
    # or directly:  node scripts/qc_commit_integrity.mjs
    # MUST list trio: index.tsx + toolsConfig.ts + ToolPage.tsx

5d. git push origin main
    # pre-push hook auto-runs Gate 3; if it FAILS push aborts

5e. VERIFY GitHub remote contains the tool (Gate 4)
    GITHUB_PAT=<token> npm run qc:remote -- <tool-id>
    # must show ✓ toolsConfig.ts ✓ ToolPage.tsx
    # If FAIL: GitHub does not have it → Railway will not deploy it → black hole
```

**ABSOLUTE RULE**: do NOT report HASH to Victor until 5e PASSES.

## The Five Gates

| Gate | What it defends | When it runs |
|------|-----------------|--------------|
| Gate 1 | Schema/registry consistency (config-only) | `npm run validate:registry` (manual + prebuild) |
| Gate 2 | URL black holes (HTTP probe of dev server) | `npm run qc:blackhole` (manual) |
| **Gate 3** | **Commit completeness — D-09 black hole** | **`npm run qc:commit` (manual + pre-push hook)** |
| **Gate 4** | **GitHub remote actually has the tool** | **`npm run qc:remote -- <tool-id>` (manual after push)** |
| Gate 5 | prebuild final guard | runs automatically before `vite build` |

## Why each step exists

- **Step 1**: Gold template is law. Visual language never bends to tool purpose.
- **Step 2**: TS errors and registry gaps create config-level black holes.
- **Step 3**: Local server is the ONLY reliable way to do visual QC.
- **Step 4**: Side-by-side screenshot comparison catches L6 violations.
- **Step 5a-e**: D-09 proved that "本地 PASS" ≠ "GitHub remote has it" ≠ "Railway deployed it".
  Each sub-step generates verifiable evidence that the chain is unbroken.
- **Step 6**: HASH = receipt. No HASH without 5e PASS.
- **Step 7**: One tool fully approved before the next.

## L6 visual rule (carved in stone after D-08)

The L6 PrimaryResult outputJson area is ALWAYS:
```tsx
<pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">
```
NEVER a white div with prose typography. The dark emerald `<pre>` is the gold
visual language and applies regardless of tool purpose.

## Black-hole symptoms quick triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Local PASS, prod missing tool | Gate 4 should have caught — commit didn't include trio | Run `qc:commit` on bad commit, then add+commit the missing files, push, run `qc:remote` |
| Tool path 404 in dev | Lazy import missing in ToolPage.tsx | Add to map, prebuild Gate 1 will then PASS |
| Tool listed but visual wrong | Step 4 was skipped | Redo step 4, fix-commit |
| "已 push 但 production 沒更新" | First check Gate 4, NOT Railway | If Gate 4 PASS and 5+ min passed, ask Victor for prod URL to curl bundle |
