# Full SEO Audit — www.jobcourier.ch

*Audited: 2026-08-15. Business type: Two-sided job marketplace (Swiss, Ticino/Italian-Switzerland primary, national IT/EN/DE/FR expansion). Vercel-hosted client-side-rendered (React SPA) with partial SSR on job detail and listing routes.*

## Executive Summary

**SEO Health Score: 44 / 100**

| Category | Score | Weight |
|---|---|---|
| Technical SEO | 68 | 22% |
| Content Quality | 38 | 23% |
| On-Page SEO | 45 | 20% |
| Schema / Structured Data | 42 | 10% |
| Performance (CWV) | 29 | 10% |
| AI Search Readiness (GEO) | 28 | 10% |
| Images | 30 | 5% |

### The one root cause behind most of the score

**Four independent specialist passes (technical, performance, GEO, SXO) all converged on the same finding from different angles:** the site is a client-rendered SPA where only `/offerte` (listings) and `/offerta/{id}` (job detail) are server-rendered. Every other route — homepage, `/come-funziona`, `/tariffe`/`/prezzi`, `/faq`, `/contatti`, and all `/blog/*` pages — ships an empty `<div id="root"></div>` with a duplicate fallback `<title>JobCourier - Il portale svizzero per il lavoro</title>` until JavaScript hydrates. And when it does hydrate, the first visible content on the homepage is the Cookiebot consent banner listing "1022 partner," not the actual value proposition. This single architectural gap explains the technical duplicate-title issue, the GEO/AI-crawler blindness, the 9-10s LCP, and the SXO trust-signal weakness simultaneously.

### Top 5 Critical Issues

1. **Non-listing routes serve empty HTML + duplicate titles pre-render** (Technical, Critical) — extend SSR coverage beyond `/offerte*`.
2. **Homepage/blog rendered content is dominated by the Cookiebot consent overlay**, blocking real copy from users, crawlers, and AI agents alike (GEO/Performance/SXO/Content, Critical).
3. **Site-wide UTF-8 mojibake in JSON-LD** — every accented character in job descriptions, articles, and FAQ text is double-encoded garbage (Schema, Critical) — corrupts what Google indexes.
4. **LCP ~9.4-9.9s, TBT ~2-3.4s** on homepage and `/offerte` — CSR shell + 44,306-element DOM (largely Cookiebot's injected vendor list) + render-blocking third parties (Performance, Critical).
5. **No author entity / no visible heritage-brand trust signal** anywhere in sampled content — the site's strongest differentiator (rebrand of "Corriere Lavoro," tied to the real Corriere del Ticino newspaper) is invisible on-page, and the backlinks audit found **no confirmed technical link inheritance** from that legacy either (Content/Backlinks, Critical).

### Top 5 Quick Wins

1. Migrate homepage/blog/static routes onto the same SSR pipeline already proven on `/offerte` and `/offerta/{id}` (fixes titles, GEO visibility, and much of the LCP problem in one move).
2. Make Cookiebot's script load `async`/deferred and lazy-render its 981-vendor list only on user interaction, not on initial paint — directly fixes DOM bloat, TBT, and the "crawlers only see the cookie banner" problem.
3. Fix the JSON-LD UTF-8 encoding bug (likely a response-header/serialization issue, not a content-authoring issue) — one backend fix corrects every affected page.
4. Add `Organization` schema site-wide and fill missing `JobPosting` fields (`employmentType`, `identifier`, `baseSalary`, split `addressRegion`/`postalCode`).
5. Add security response headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) — currently only HSTS is present.

## Category Detail

Full per-category findings: `findings/technical.md`, `findings/content.md`, `findings/schema.md`, `findings/sitemap.md`, `findings/performance.md`, `findings/geo.md`, `findings/sxo.md`, `findings/backlinks.md`.

### Technical SEO — 68/100
Strengths: clean robots.txt/sitemaps, correct canonicals everywhere, clean apex→www redirect, `JobPosting`/`WebSite` structured data properly SSR'd on job pages. Weaknesses: duplicate titles/empty HTML on non-listing routes (Critical), no security headers (High), unmeasured CWV risk on non-SSR routes, missing IndexNow, missing manifest.

### Content Quality / E-E-A-T — 38/100
No author byline on any blog post's `Article` schema. No visible Corriere del Ticino heritage narrative anywhere sampled. Homepage extracted text is 100% consent boilerplate. No `/chi-siamo` (about) page found in crawled sections. Blog post sampled reads shorter than the 1,500-word pillar-content benchmark. FAQ is genuine Q&A but marked up as the now-defunct `FAQPage` rich-result type.

### Schema / Structured Data — 42/100
Site-wide UTF-8 mojibake corrupting all accented JSON-LD text (Critical). No `Organization` schema anywhere; `/offerte` listing page has no `ItemList`. `JobPosting` on detail pages is required-field-complete (Google for Jobs eligible) but missing recommended fields. `BreadcrumbList` only found on one blog post.

### Sitemap — 68/100
Both `sitemap.xml` and `api/sitemap-jobs.xml` are valid, complete, and correctly referenced in robots.txt. No `<lastmod>` anywhere despite job pages carrying `datePosted`/`validThrough` — Google has no freshness signal. Expired job IDs return soft-404 (HTTP 200 on unknown `/offerta/{id}`) instead of 404/410, so stale listings can't be reliably pruned from the sitemap.

### Performance / Core Web Vitals — 29/100 (avg of 25 home / 33 offerte)
LCP 9.4-9.9s (Poor, ~4x threshold), TBT 1.94-3.39s, homepage CLS 0.144 (Needs Improvement). TTFB is fine (~50ms) — this is entirely client-rendering, not server latency. Root causes: empty CSR shell, 44,306-element DOM from Cookiebot, render-blocking `consent.cookiebot.com/uc.js` and web fonts. No CrUX field data available (no Google API credentials configured).

### GEO / AI Search Readiness — 28/100
Homepage/blog return ~4.9KB raw HTML with empty `<div id="root">` — most AI crawlers (GPTBot, PerplexityBot) see nothing but title/OG tags. Even full Playwright renders extract mostly the Cookiebot consent notice, not real copy. No `llms.txt`. robots.txt itself is permissive to AI crawlers — the blocker is entirely rendering/consent-overlay, not access rules. Upside noted: low-competition Swiss-Italian regional niche has real headroom for AI Overviews/ChatGPT/Perplexity citation once fixed.

### SXO (Search Experience) — 54/100 (gap score)
`/offerte`'s page type correctly matches what ranks for job-seeker queries (filterable listing aggregator, same pattern as LinkedIn/Randstad/Carriera.ch) — the gap is authority/ranking, not page-type mismatch. Employer-side queries already rank reasonably. Weakest persona: "Compliance-Aware Employer" (26/100) — no content addresses Swiss RAV vacancy-registration obligations, which government content dominates in the same SERP cluster. Zero images detected on home/`/offerte`; no testimonials/case studies/client logos anywhere.

### Backlinks — insufficient data (free-tier only)
Common Crawl shows jobcourier.ch has **no measurable authority** (`in_rankings: false`, PageRank/harmonic centrality null) despite being crawled. No confirmed cross-linking with cdt.ch (Corriere del Ticino's own domain, which *is* well-ranked in Common Crawl). Domain history flags an unverified `topical_shift` — it's not confirmed whether jobcourier.ch is the same domain as the old Corriere Lavoro property or a fresh registration. **This means the "inherited legacy trust" premise used in the earlier SEO-STRATEGY.md should be treated as unverified, not assumed** — recommend a manual Wayback Machine check and a Moz API key for a real referring-domain count.

## Data Confidence Notes

- No Google API credentials configured — Performance scores are Lighthouse lab data only, not CrUX field data; GSC indexation/traffic data unavailable.
- No Moz/Bing API key — backlink analysis limited to Common Crawl's free domain-graph tier, no referring-domain list or anchor-text data.
- Crawl sample was targeted (representative pages across sections), not the full 500-page ceiling — sufficient to identify the systemic SSR/consent-overlay pattern, which by nature applies to entire route groups rather than individual pages.
- Content-audit subagent hit a session API limit mid-task; `findings/content.md` was completed inline from already-captured rendered-page data rather than a fresh independent pass — flagged in that file's header.
