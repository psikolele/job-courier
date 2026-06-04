# 2026-06-04 Handoff Refinements Design Document

**Goal:** Correct UI and API bugs (DotCard animation clipping, footer login triggering, node-fetch header parsing) and completely redesign the "Soluzioni e tariffe" (Pricing) page in a premium Organic Tech style.

## 1. DotCard Animation and Font Clipping

### Problem
- Flexbox alignment conflicts with absolute positioning on `.jc-dot-dot` in `index.css`.
- Keyframes use fixed pixels, causing tracing to break when the card scales.
- Font sizes in the card clip on long numbers like `120'000+`.

### Design Solution (Approach 1)
- Add a helper container `.jc-dot-border-container` matching the exact position/dimensions of `.jc-dot-card`.
- Reposition `.jc-dot-dot` inside it.
- Animate using relative percentages (`top`, `left`) and `transform: translate(-50%, -50%)` to trace the borders responsively.
- Scale down counter font sizes dynamically based on length (under 7 chars = `2.4rem`, over = `1.9rem`).

---

## 2. Footer Modal Trigger

### Problem
- Footer is rendered without receiving `setShowLoginModal`, so clicking "Login" in the footer is a dead link (`#login`).

### Design Solution
- Pass `setShowLoginModal` from `App.jsx` to `<Footer />`.
- Catch the click in `Footer.jsx` and trigger the modal directly if `l.href === '#login'`.

---

## 3. API cookie parsing (`job-detail.js`)

### Problem
- Node-fetch v3 does not support `headers.raw()`, throwing an exception when retrieving the `set-cookie` header on `webapp/api/job-detail.js:38`.

### Design Solution
- Use `headers.get('set-cookie')` to get the concatenated cookie string.
- Parse multiple cookies using a regex that splits commas not followed by date variables: `/,(?=\s*[a-zA-Z0-9_]+=)/`.
- Map and extract raw session cookies safely.

---

## 4. Pricing Page Redesign (`Pricing.jsx`)

### Design Solution
- Style the page in **Organic Tech** (Navy, Fuchsia, White, Light-gray palette).
- Implement a two-tab navigation: `Aziende & PMI` and `Agenzie di selezione`.
- The `Aziende & PMI` tab will showcase 3 pricing tiers in a grid:
  1. **Job Post Basic**: CHF 249 + IVA (30-day online posting).
  2. **Job Post Boost (Consigliato)**: CHF 890 + IVA (Pack 5 boost, fuchsia highlighted layout, fuchsia button).
  3. **Continuo**: da CHF 1'200 + IVA (Annual/semi-annual subscription plans).
- A sidebar detailing the core recruitment advantages of JobCourier Swiss marketplace.
- The `Agenzie di selezione` tab will feature a locked layout with a fuchsia lock icon, explaining specialized services (massive posting, direct ATS integrations, database unlocking) with a direct click to `/contatti`.
