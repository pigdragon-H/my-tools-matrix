# MASTER GALAXY INDEX
**Version:** 1.1.0  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Maintained by:** Claude（Universe Auditor）  

---

## 用途

這是所有 Universe / Galaxy 的總索引。
每次新增 Universe 或 Galaxy，必須更新此檔案。
AI 每次工作前應先閱讀此檔案，確認 taxonomy 正確。

---

## 已定義 Universe

| Universe | Key | Status | Galaxy 數 | 工具數 | 文件 |
|----------|-----|--------|-----------|--------|------|
| Finance | FIN | ✅ Stable | 20 | 9 | FIN_UNIVERSE_MAP.md |
| Developer | DEV | ✅ Stable | 30 | 16 | DEV_UNIVERSE_MAP.md |
| Health | HLT | ✅ Stable | 20 | 7 | HLT_UNIVERSE_MAP.md |

---

## FIN Galaxy 快速索引

| Key | Galaxy | Priority | 說明 |
|-----|--------|----------|------|
| INV | Investing | P1 | 投資 |
| RET | Retirement | P1 | 退休 |
| LOA | Loans | P1 | 貸款 |
| MTG | Mortgage | P1 | 房貸 |
| FXR | Currency Exchange | P1 | 匯率 |
| BUD | Budgeting | P2 | 預算規劃 |
| SAV | Savings | P2 | 儲蓄 |
| TAX | Tax Planning | P2 | 稅務 |
| INS | Insurance | P2 | 保險 |
| BNK | Banking | P2 | 銀行 |
| CRD | Credit | P2 | 信用 |
| CSH | Cash Flow | P3 | 現金流 |
| NWT | Net Worth | P3 | 淨資產 |
| FIR | Financial Independence | P3 | 財務自由 |
| DBT | Debt Management | P3 | 債務管理 |
| INC | Income Planning | P3 | 收入規劃 |
| EXP | Expense Tracking | P3 | 支出管理 |
| PTF | Portfolio Analysis | P3 | 投資組合 |
| RSK | Risk Management | P3 | 風險管理 |
| BSF | Business Finance | P3 | 商業財務 |

---

## DEV Galaxy 快速索引

| Key | Galaxy | Priority | 說明 |
|-----|--------|----------|------|
| CNV | Conversion Tools | P1 | 編碼/格式轉換 |
| FMT | Formatting Tools | P1 | Formatter/beautifier |
| ENC | Encoding Tools | P1 | Base64/URL/UTF |
| VAL | Validation Tools | P1 | JSON/XML/Schema |
| GEN | Generation Tools | P1 | Token/UUID/Mock |
| PAR | Parsing Tools | P2 | Parser/extractor |
| API | API Tools | P2 | API utilities |
| DBS | Database Tools | P2 | SQL/DB |
| DOP | DevOps Tools | P2 | CI/CD/infra |
| NET | Networking Tools | P2 | IP/DNS/ports |
| SEC | Security Tools | P2 | Hash/JWT/crypto |
| RGX | Regex Tools | P2 | Regex ecosystem |
| DTM | Date & Time Tools | P2 | Unix/timezone |
| FRT | Frontend Tools | P2 | CSS/HTML/SVG |
| BCK | Backend Tools | P3 | Server/backend |
| CLD | Cloud Tools | P3 | AWS/GCP/Azure |
| DAT | Data Engineering | P3 | CSV/ETL |
| AID | AI Developer Tools | P3 | Prompt/token |
| GIT | Git Tools | P3 | Git helpers |
| PRF | Performance Tools | P3 | Benchmark |
| TST | Testing Tools | P3 | QA/testing |
| DOC | Documentation Tools | P3 | Markdown/OpenAPI |
| PKG | Package Tools | P3 | npm/pip/cargo |
| MOB | Mobile Dev Tools | P3 | Android/iOS |
| GAM | Game Dev Tools | P3 | Unity/Unreal |
| BLK | Blockchain Dev | P3 | Web3/dev |
| CMP | Compiler Tools | P3 | transpilers |
| CLI | CLI Tools | P3 | terminal helpers |
| MON | Monitoring Tools | P3 | logs/metrics |
| LOC | Localization Tools | P3 | i18n/l10n |

---

## HLT Galaxy 快速索引

| Key | Galaxy | Priority | 說明 |
|-----|--------|----------|------|
| CAL | Calories | P1 | 卡路里 |
| BIO | Biometrics | P1 | 生理指標 |
| FIT | Fitness | P1 | 健身 |
| WLS | Weight Loss | P1 | 減重 |
| NTR | Nutrition | P1 | 營養 |
| SLP | Sleep | P2 | 睡眠 |
| MNT | Mental Health | P2 | 心理健康 |
| CRD | Cardio | P2 | 心血管 |
| WLN | Wellness | P2 | 健康生活 |
| RSK | Medical Risk | P2 | 健康風險 |
| HYD | Hydration | P2 | 水分 |
| MET | Metabolism | P2 | 代謝 |
| BDC | Body Composition | P2 | 身體組成 |
| PRG | Pregnancy | P3 | 孕期 |
| LNG | Longevity | P3 | 長壽 |
| HAB | Habit Tracking | P3 | 習慣健康 |
| RCV | Recovery | P3 | 恢復 |
| HRM | Hormone Health | P3 | 荷爾蒙 |
| AGE | Aging | P3 | 老化 |
| BHK | Biohacking | P3 | 生物優化 |

---

## 重要規則

1. Galaxy Key 永遠 3字母 UPPERCASE
2. Key 一旦定義永不更改（immutable）
3. 語意不可重疊
4. URL 不等於 taxonomy
5. 每個工具只屬於一個 Galaxy
6. 新增工具前必須先查此索引確認 Galaxy Key

---

## 變更記錄

| 日期 | 變更 | 執行者 |
|------|------|--------|
| 2026-05-22 | 建立 FIN + DEV Galaxy MAP | Claude |
| 2026-05-22 | 建立 HLT Galaxy MAP | Claude |
| 2026-05-22 | DEV 16個工具補 Galaxy Key | Claude |
| 2026-05-22 | FIN 9個工具補 Galaxy Key | Claude |
| 2026-05-22 | DSG-000048 → DEV-000048 修正 | Claude |
| 2026-05-22 | TRV-000054 → FIN-000054 修正 | Claude |
| 2026-05-22 | DEV-000035 拆分 ENC+FMT | Claude |

---

*Last updated: 2026-05-22 v1.1.0 | Maintained by: Claude*
