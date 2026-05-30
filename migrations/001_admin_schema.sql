-- ============================================================================
-- Phase F migration  ·  Formula Universe / Tool Matrix  admin backend
-- ============================================================================
-- HOW TO RUN:
--   1. Open Supabase project hxfjdfinwzmqkgaripbe
--      → SQL Editor → New query
--   2. Paste this entire file and click "Run"
--   3. Verify no errors. Tables will appear in "Database" → "Tables".
--
-- WHAT THIS DOES:
--   • Enables pgvector for future embedding/RAG support
--   • Creates site_settings  (the 4-tab admin Settings panel persistence)
--   • Creates articles       (multi-author + AI-collaborator knowledge base)
--   • Creates article_revisions  (full edit history)
--   • Creates article_reviews    (editorial workflow audit trail)
--   • Creates ai_bot_tokens      (named tokens for Claude/SuperNinja/GPT bots)
--   • RLS policies: only admin/editor can mutate; anyone can read published
--   • Seeds 4 featured guides as published articles (BMI/BMR · CAGR · JSON · Health overview)
--
-- IDEMPOTENT: safe to re-run.  Uses CREATE TABLE IF NOT EXISTS,
--             ON CONFLICT DO NOTHING, DROP POLICY IF EXISTS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";  -- pgvector, for ai_summary embeddings

-- ----------------------------------------------------------------------------
-- 1. site_settings  — single-row global config (key='global')
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key            text primary key,
  value          jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id) on delete set null
);

comment on table  public.site_settings is 'Admin-editable global site settings (FeatureFlag / AdSense / Premium / Affiliate).';
comment on column public.site_settings.key   is 'Use ''global'' for the single shared row.';
comment on column public.site_settings.value is 'JSON shape defined in server/routers/settings.ts SettingsSchema.';

-- ----------------------------------------------------------------------------
-- 2. articles  — knowledge base with multi-author + AI workflow
-- ----------------------------------------------------------------------------
create table if not exists public.articles (
  id                uuid primary key default uuid_generate_v4(),
  slug              text not null,
  locale            text not null default 'zh' check (locale in ('zh','en')),
  status            text not null default 'draft'
                    check (status in ('draft','in_review','needs_revision','published','rejected','archived')),
  title             text not null,
  description       text default '',
  cover_image       text default '',
  content_mdx       text default '',

  -- Authoring
  author_id         uuid references auth.users(id) on delete set null,
  author_role       text default 'admin'
                    check (author_role in ('admin','editor','user','ai-bot')),
  ai_source         text,                    -- e.g. 'claude','superninja','gpt'
  reviewed_by       uuid references auth.users(id) on delete set null,
  reviewed_at       timestamptz,

  -- AI-friendly metadata (read by /api/articles, /llms.txt, future MCP)
  ai_summary        text default '',          -- short human-voice summary
  ai_keywords       text[] default '{}',      -- 3-6 keywords
  category_key      text default '',
  tools_referenced  text[] default '{}',
  tags              text[] default '{}',

  -- For pgvector RAG (1536 = OpenAI text-embedding-3-small / Voyage compatible)
  embedding         vector(1536),

  -- Anti-machine-tone score from last detection (0=human, 10=machine)
  machine_tone_score numeric(3,1),

  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (slug, locale)
);

comment on table public.articles is 'Knowledge base articles. Multi-author (admin/editor/ai-bot) + state machine.';

create index if not exists articles_status_idx       on public.articles (status);
create index if not exists articles_locale_idx       on public.articles (locale);
create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_category_idx     on public.articles (category_key);
create index if not exists articles_updated_at_idx   on public.articles (updated_at desc);

-- ----------------------------------------------------------------------------
-- 3. article_revisions  — every save is appended
-- ----------------------------------------------------------------------------
create table if not exists public.article_revisions (
  id           uuid primary key default uuid_generate_v4(),
  article_id   uuid not null references public.articles(id) on delete cascade,
  editor_id    uuid references auth.users(id) on delete set null,
  editor_role  text,
  title        text,
  content_mdx  text,
  diff_summary text,
  created_at   timestamptz not null default now()
);

create index if not exists article_revisions_article_idx on public.article_revisions (article_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. article_reviews  — editorial workflow audit trail
-- ----------------------------------------------------------------------------
create table if not exists public.article_reviews (
  id          uuid primary key default uuid_generate_v4(),
  article_id  uuid not null references public.articles(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  action      text not null check (action in ('submitted','approved','rejected','requested_revision','published','archived')),
  comment     text default '',
  created_at  timestamptz not null default now()
);

create index if not exists article_reviews_article_idx on public.article_reviews (article_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 5. ai_bot_tokens  — named tokens for AI collaborators (Claude / SuperNinja / GPT)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_bot_tokens (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null unique,         -- 'claude-prod', 'superninja-claude', 'gpt-research'
  token_hash   text not null,                -- sha256 of the bearer token
  created_by   uuid references auth.users(id) on delete set null,
  enabled      boolean not null default true,
  last_used_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- 6. ROW-LEVEL SECURITY  ·  defaults to deny, then we open specific paths
-- ============================================================================

alter table public.site_settings     enable row level security;
alter table public.articles          enable row level security;
alter table public.article_revisions enable row level security;
alter table public.article_reviews   enable row level security;
alter table public.ai_bot_tokens     enable row level security;

-- Helper: a user is admin or editor if their app_metadata.role is 'admin' or 'editor'.
-- (Set via Supabase dashboard → Authentication → Users → User → Raw user meta data → app_metadata.role)

-- ---- site_settings ----
drop policy if exists "settings:public-read"  on public.site_settings;
drop policy if exists "settings:admin-write"  on public.site_settings;

create policy "settings:public-read" on public.site_settings
  for select using (true);

create policy "settings:admin-write" on public.site_settings
  for all using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  ) with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- ---- articles ----
drop policy if exists "articles:public-read-published" on public.articles;
drop policy if exists "articles:editor-read-all"      on public.articles;
drop policy if exists "articles:editor-write"         on public.articles;

create policy "articles:public-read-published" on public.articles
  for select using (status = 'published');

create policy "articles:editor-read-all" on public.articles
  for select using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );

create policy "articles:editor-write" on public.articles
  for all using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  ) with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );

-- ---- article_revisions ----
drop policy if exists "revisions:editor-read"  on public.article_revisions;
drop policy if exists "revisions:editor-write" on public.article_revisions;

create policy "revisions:editor-read" on public.article_revisions
  for select using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );
create policy "revisions:editor-write" on public.article_revisions
  for insert with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );

-- ---- article_reviews ----
drop policy if exists "reviews:editor-read"  on public.article_reviews;
drop policy if exists "reviews:editor-write" on public.article_reviews;

create policy "reviews:editor-read" on public.article_reviews
  for select using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );
create policy "reviews:editor-write" on public.article_reviews
  for insert with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin','editor')
  );

-- ---- ai_bot_tokens ----  (admin only — secrets)
drop policy if exists "bot-tokens:admin-only" on public.ai_bot_tokens;

create policy "bot-tokens:admin-only" on public.ai_bot_tokens
  for all using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  ) with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- NOTE: server uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, so server-side
-- tRPC mutations always work. RLS guards direct browser access to Supabase REST.

-- ============================================================================
-- 7. SEED  ·  4 featured guides as published articles  (zh + en)
-- ============================================================================

insert into public.articles
  (slug, locale, status, title, description,
   author_role, ai_source, ai_summary, ai_keywords,
   category_key, tools_referenced, tags,
   content_mdx, published_at)
values
  ('bmi-bmr-health-planning', 'zh', 'published',
   'BMI 與 BMR:健康規劃的起點',
   '理解身體質量指數與基礎代謝率如何輔助熱量、體重與日常健康決策。',
   'admin', null,
   '介紹 BMI 與 BMR 兩個基礎健康指標,說明它們如何串起熱量需求、體重管理與日常飲食決策。',
   array['BMI','BMR','健康','代謝','熱量'],
   'health',
   array['/tools/health/bmi-calculator','/tools/health/bmr-calculator'],
   array['health','intro','beginner'],
$$# BMI 與 BMR:健康規劃的起點

身體質量指數(BMI)與基礎代謝率(BMR)是兩個常被一起討論的健康基礎指標,但兩者解決的問題不同。

## BMI 看的是「比例」

BMI 用體重與身高的比例,粗略反映身體的胖瘦狀態。它不分肌肉與脂肪,因此對運動員或長者要保留判斷空間。

- **計算**:`BMI = 體重(kg) / 身高(m)²`
- **常用區間**:< 18.5 過輕、18.5–24 正常、24–27 過重、≥ 27 肥胖

## BMR 看的是「需求」

BMR 是身體在完全靜止狀態下,維持基本生命活動所需的熱量。它是計算每日總熱量需求(TDEE)的起點。

我們建議使用 [Mifflin–St Jeor 公式](/tools/health/bmr-calculator),這是目前臨床與運動營養學常用的版本。

## 兩個工具一起用

先用 [BMI 計算機](/tools/health/bmi-calculator) 了解體位,再用 BMR 估算每日熱量,最後依照活動量計算 TDEE,就能規劃合理的飲食與運動目標。

> 提醒:這兩個指標都是估算工具。孕婦、特殊疾病患者或運動員應諮詢專業人員。$$,
   now())
on conflict (slug, locale) do nothing;

insert into public.articles
  (slug, locale, status, title, description,
   author_role, ai_source, ai_summary, ai_keywords,
   category_key, tools_referenced, tags,
   content_mdx, published_at)
values
  ('bmi-bmr-health-planning', 'en', 'published',
   'BMI and BMR: where health planning starts',
   'Understand how body mass index and basal metabolic rate support calorie, weight, and daily health decisions.',
   'admin', null,
   'BMI tells you the ratio between weight and height; BMR estimates baseline calorie need. Used together they form the entry point to TDEE-based planning.',
   array['BMI','BMR','health','metabolism','calorie'],
   'health',
   array['/tools/health/bmi-calculator','/tools/health/bmr-calculator'],
   array['health','intro','beginner'],
$$# BMI and BMR: where health planning starts

Body Mass Index (BMI) and Basal Metabolic Rate (BMR) are two foundational health indicators. They look similar but answer different questions.

## BMI is a ratio

BMI compares weight to height. It doesn't distinguish muscle from fat, so use it as a starting screen, not a verdict.

- **Formula:** `BMI = weight(kg) / height(m)²`
- **Common ranges:** < 18.5 underweight · 18.5–24 normal · 24–27 overweight · ≥ 27 obese

## BMR is a need

BMR is the energy your body burns at rest just to stay alive. It is the foundation for Total Daily Energy Expenditure (TDEE).

We recommend the [Mifflin–St Jeor formula](/tools/health/bmr-calculator), the version most clinicians and sports nutritionists use today.

## Use them together

Start with the [BMI calculator](/tools/health/bmi-calculator), then estimate BMR, then add activity to get TDEE. From there, calorie targets and exercise plans become easy to set.

> Reminder: both are estimation tools. Pregnant individuals, athletes, and people with conditions should consult a professional.$$,
   now())
on conflict (slug, locale) do nothing;

insert into public.articles
  (slug, locale, status, title, description,
   author_role, ai_source, ai_summary, ai_keywords,
   category_key, tools_referenced, tags,
   content_mdx, published_at)
values
  ('cagr-and-compounding', 'zh', 'published',
   'CAGR 與複利:投資成長的核心公式',
   '用年化成長率與複利觀念建立投資報酬、退休金與資產配置的基本脈絡。',
   'admin', null,
   '說明 CAGR 與複利如何用來衡量投資長期成長,並提供常見退休與資產配置的入門思路。',
   array['CAGR','複利','投資','退休金','資產配置'],
   'finance',
   array['/tools/finance/cagr-calculator'],
   array['finance','intro','investment'],
$$# CAGR 與複利:投資成長的核心公式

投資不是一年的事,真正能讓資產長大的力量來自時間與複利。CAGR(年化成長率)就是把這股力量量化的方法。

## 什麼是 CAGR

CAGR 把多年累積的報酬,平均回推成「每年穩定成長」的等效數字,讓不同投資標的可以放在同一張尺上比較。

- **公式**:`CAGR = (期末值 / 期初值)^(1/年數) − 1`
- 適合比較共同基金、ETF、房地產等需要多年觀察的標的。

## 複利為什麼重要

如果今年賺 8%、明年再賺 8%,實際成長不是 16%,而是 (1.08)² − 1 ≈ 16.64%。年數拉長後差距會被放大,這就是複利。

我們的 [CAGR 計算機](/tools/finance/cagr-calculator) 可以快速試算各種期間,觀察複利的真實效果。

## 應用場景

- **退休金規劃**:把每月儲蓄與預期報酬輸入計算機,反推 30 年後的資產規模。
- **資產配置**:用 CAGR 比較不同資產類別,找到能匹配風險承受度的組合。

> 提醒:CAGR 是回溯指標,不能保證未來表現。$$,
   now())
on conflict (slug, locale) do nothing;

insert into public.articles
  (slug, locale, status, title, description,
   author_role, ai_source, ai_summary, ai_keywords,
   category_key, tools_referenced, tags,
   content_mdx, published_at)
values
  ('cagr-and-compounding', 'en', 'published',
   'CAGR and compounding: core formulas for investment growth',
   'Use compound annual growth rate and compounding to frame investment return, retirement, and asset allocation.',
   'admin', null,
   'Explains CAGR and compounding as the language of long-term return, with practical use cases in retirement and asset allocation.',
   array['CAGR','compounding','investing','retirement','asset allocation'],
   'finance',
   array['/tools/finance/cagr-calculator'],
   array['finance','intro','investment'],
$$# CAGR and compounding: core formulas for investment growth

Investing is a multi-year game. The force that grows wealth is time × compounding, and CAGR is how we measure it.

## What is CAGR

CAGR (Compound Annual Growth Rate) translates many years of returns into one equivalent steady growth rate, so you can compare assets on the same scale.

- **Formula:** `CAGR = (end / start)^(1 / years) − 1`
- Best for funds, ETFs, real estate — anything that needs a multi-year view.

## Why compounding matters

Earning 8% this year and 8% next year is not 16% — it's (1.08)² − 1 ≈ 16.64%. Across decades the gap becomes the dominant force, which is why compounding is sometimes called the eighth wonder.

Try our [CAGR calculator](/tools/finance/cagr-calculator) on different time spans and watch the curve bend up.

## Where to use it

- **Retirement planning:** project monthly savings + expected return into a 30-year horizon.
- **Asset allocation:** use CAGR to compare asset classes that match your risk tolerance.

> Reminder: CAGR is backward-looking. It does not guarantee future returns.$$,
   now())
on conflict (slug, locale) do nothing;

insert into public.articles
  (slug, locale, status, title, description,
   author_role, ai_source, ai_summary, ai_keywords,
   category_key, tools_referenced, tags,
   content_mdx, published_at)
values
  ('developer-workflows-json-regex-api', 'zh', 'published',
   'JSON、Regex、API:開發者常用工作流',
   '從資料清理、格式驗證到 API 檢查,整理開發者工具的實用使用場景。',
   'admin', null,
   '把 JSON、Regex、API 三類常用工具串成日常開發工作流,協助使用者用最少步驟完成驗證、清理與整合。',
   array['JSON','Regex','API','開發者','工作流'],
   'developer',
   array['/category/developer'],
   array['developer','workflow'],
$$# JSON、Regex、API:開發者常用工作流

工程師日常都會遇到三件事:讀懂一份 JSON、寫一個 Regex 規則、檢查一個 API 回傳。這篇文章把這三個動作整合成一條工作流。

## Step 1 · JSON 整理

從後端拿到資料後,先用工具格式化,確認欄位結構。重點是先看「形狀」,而不是急著解析。

## Step 2 · Regex 驗證

要從 JSON 字串中取出 email、電話、URL,Regex 是快又準的選擇。建議寫完規則後跑幾組正反例,確認沒誤判。

## Step 3 · API 檢查

最後用 API 工具發送請求,觀察 Header / Status / Body,並在前端整合前先做一輪「假資料測試」。

把這三步串起來,你會發現大多數整合工作其實只需要 5–10 分鐘。$$,
   now())
on conflict (slug, locale) do nothing;

-- ============================================================================
-- 8. Default site settings row
-- ============================================================================
insert into public.site_settings (key, value)
values (
  'global',
  '{
    "featureFlag": {
      "premium": false,
      "affiliate": true,
      "newsletter": true,
      "adsense": true
    },
    "adsense": {
      "publisherId": "",
      "enabled": false
    },
    "premium": {
      "tierProMonthlyTwd": 96,
      "tierTeamMonthlyTwd": 330,
      "tierAgencyMonthlyTwd": 996,
      "tierProMonthlyUsd": 3,
      "tierTeamMonthlyUsd": 9,
      "tierAgencyMonthlyUsd": 33,
      "tagline": "知識付費,但不要成為負擔"
    },
    "affiliate": {
      "products": []
    }
  }'::jsonb
)
on conflict (key) do nothing;

-- ============================================================================
-- DONE.  Verify with:
--   select count(*) from public.articles;          -- should be ≥ 4 (8 if both locales)
--   select key, jsonb_pretty(value) from public.site_settings;
--   select * from public.articles order by published_at desc limit 5;
-- ============================================================================
