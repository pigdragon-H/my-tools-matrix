# Admin backend — operation guide

> **Audience:** Victor (admin) + medical contributors (editor) + AI bots (claude/superninja/gpt).
> **Status:** Phase A → E shipped; Phase F (DB migration) is one manual step in Supabase SQL Editor.

---

## 1. One-time setup (Phase F)

### 1.1 Run the migration

1. Open Supabase project `hxfjdfinwzmqkgaripbe` → **SQL Editor** → **New query**.
2. Paste the entire contents of `migrations/001_admin_schema.sql`.
3. Click **Run**. You should see no errors and `Success` at the bottom.
4. Verify in **Database → Tables**:
   - `site_settings` (1 row, key=`global`)
   - `articles` (≥ 4 rows seeded)
   - `article_revisions`, `article_reviews`, `ai_bot_tokens` (empty)

### 1.2 Set your admin role

1. Supabase → **Authentication → Users** → click your row (`victortigerhuang@gmail.com`).
2. **Raw user meta data → app_metadata** → add:
   ```json
   { "role": "admin" }
   ```
3. Save.  Sign out + sign in once on the site to refresh the JWT.

### 1.3 Confirm Railway env vars

Already set ✅. For reference these must exist in Railway → Variables:

| Var                          | Value                                      |
|------------------------------|--------------------------------------------|
| `SUPABASE_URL`               | `https://hxfjdfinwzmqkgaripbe.supabase.co` |
| `SUPABASE_ANON_KEY`          | (anon key)                                 |
| `SUPABASE_SERVICE_ROLE_KEY`  | (service-role key — server-only)           |
| `ANTHROPIC_API_KEY`          | (your Anthropic key)                       |
| `CLAUDE_MODEL`               | `claude-sonnet-4-5-20250929` (default)     |

---

## 2. Daily flow — how to write an article

1. Go to <https://my-tools-matrix-production.up.railway.app/login> → sign in.
2. The Navbar shows **後台管理 (admin)**; click it (or visit `/admin`).
3. **Sidebar → 知識庫文章 → 新增文章**.
4. Fill in:
   - **Slug** (URL piece, e.g. `breakeven-explained`)
   - **Locale** (zh / en)
   - **Title / Description / Cover image**
   - **Category** + **Tools referenced** + **Tags**
   - **Body** in Markdown.
5. While writing, use the three AI buttons:
   - ✨ **AI 摘要** — generate 80-word AI summary + keywords (Claude Sonnet 4.5).
   - ⚠️ **機械語感檢測** — score 0–10 + flagged phrases (3-line anti-AI-tone defense).
   - 🪄 **人話化** — rewrite a stilted paragraph into natural human voice.
6. **Save** → **發布** when ready.  The article goes live at `/blog/<slug>`.

The same article is also exposed for AI consumers:

- `GET /api/articles?locale=zh` — JSON list of all published articles
- `GET /api/articles/<slug>` — single article (includes `content_mdx`, `ai_summary`, `ai_keywords`, `tools_referenced`)
- `GET /llms.txt` — site index for Perplexity / ChatGPT Search / Claude / etc.

---

## 3. Allowing doctor friends to contribute

1. Have them sign up at `/login` (uses Supabase email + password).
2. In Supabase → Authentication → Users → click their row → set `app_metadata.role = "editor"`.
3. They can now sign in, see **後台管理**, write drafts, and submit `in_review`.
4. You (admin) review and click **發布** to publish.

---

## 4. Allowing AI bots (Claude / SuperNinja / GPT) to submit articles

The schema includes `ai_bot_tokens` and `articles.ai_source`. Implementation order when you're ready:

1. Generate a bot token: insert into `ai_bot_tokens` with `name = 'claude-prod'` and `token_hash = sha256(secret)`.
2. Bots `POST /api/bot/articles` with `Authorization: Bearer <secret>` and a JSON body matching the article shape.
3. Server checks `token_hash`, sets `ai_source = name`, status = `in_review`, returns `{id, status}`.
4. Article appears in the admin list with a 🤖 badge for review.

(That endpoint isn't shipped yet — the table is in place so we can add it without another migration.)

---

## 5. Architecture map

```
client/src/
  pages/admin/
    AdminDashboard.tsx        — stats + last sign-in card
    AdminArticles.tsx         — list page, status filter
    AdminArticleEditor.tsx    — full Markdown editor + 3 AI buttons
    AdminSettings.tsx         — 4-tab settings (FeatureFlag/AdSense/Premium/Affiliate)
    AdminUsers.tsx            — recent users
    AdminHealth.tsx           — tRPC + healthz check
  pages/
    BlogList.tsx              — featured guides + DB articles
    BlogPost.tsx              — /blog/:slug renderer
  _core/
    TrpcProvider.tsx          — auth-aware tRPC client
    ProtectedAdminRoute.tsx   — gates /admin
    hooks/useAuth.ts          — Supabase session + role + last sign-in

server/
  _core/
    index.ts                  — Express + tRPC mount + /api/articles + /llms.txt
    trpc.ts                   — public/protected/admin procedures
    context.ts                — Bearer-token parser
  lib/
    supabaseAdmin.ts          — anon + service-role clients + verifySupabaseToken()
  routers/
    admin.ts                  — dashboard stats, ranking, trends
    articles.ts               — CRUD + AI (Claude Sonnet 4.5)
    settings.ts               — global site settings
  routers.ts                  — root tRPC router

shared/
  const.ts                    — ARTICLE_STATUSES, USER_ROLES
  toolsConfig                 — 5000+ tool catalog (existing)

migrations/
  001_admin_schema.sql        — Phase F: tables + RLS + seed
```

---

## 6. Troubleshooting

- **/admin shows "存取被拒絕" (Access denied):** your `app_metadata.role` is not `admin`. Re-check step 1.2 and sign in again.
- **Admin Dashboard cards show 0:** expected if you haven't set up `calculation_history`. The dashboard gracefully falls back.
- **Articles list shows "無法載入文章":** the `articles` table doesn't exist yet — run `migrations/001_admin_schema.sql`.
- **AI buttons fail with "ANTHROPIC_API_KEY is not configured":** add the env var in Railway and redeploy.
- **Build hash on `/index.html` doesn't match local:** Railway is still deploying. Wait 3–5 min then refresh.
