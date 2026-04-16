# Pricing Page & Routing Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a standalone Pricing page and a multi-page routing system using React Router, while updating the navigation to handle cross-page anchor links.

**Architecture:** 
- SPA refactor into a routed application using `react-router-dom`.
- Separation of `Home` and `Pricing` pages.
- "Route-aware" Navbar for seamless anchor link navigation across pages.

**Tech Stack:** React 19, Tailwind CSS v4, GSAP, react-router-dom.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `webapp/package.json`

**Step 1: Install react-router-dom**
Run: `npm install react-router-dom` in `webapp` directory.

**Step 2: Commit**
```bash
git commit -m "chore: install react-router-dom"
```

### Task 2: Refactor Home Page

**Files:**
- Create: `webapp/src/pages/Home.jsx`
- Modify: `webapp/src/App.jsx`

**Step 1: Create Home.jsx**
Move current content of `App.jsx` (the `return` block within `main`) into a new component named `Home`.

**Step 2: Clean up App.jsx**
Leave `App.jsx` as a skeleton with `Navbar` and `Footer`.

**Step 3: Commit**
```bash
git add webapp/src/pages/Home.jsx webapp/src/App.jsx
git commit -m "refactor: extract home page logic"
```

### Task 3: Setup Routing

**Files:**
- Modify: `webapp/src/main.jsx`
- Modify: `webapp/src/App.jsx`

**Step 1: Wrap App with BrowserRouter**
Update `main.jsx` to wrap `<App />` with `BrowserRouter`.

**Step 2: Define Routes in App.jsx**
Setup `<Routes>` with `/` (Home) and `/soluzioni-e-tariffe` (Pricing).

**Step 3: Commit**
```bash
git add webapp/src/main.jsx webapp/src/App.jsx
git commit -m "feat: setup basic routing"
```

### Task 4: Content/Link Refactor in Navbar

**Files:**
- Modify: `webapp/src/components/Navbar.jsx`

**Step 1: Update Navbar Links**
Implement the new labels and links for Candidati and Aziende:
- **Cerca Lavoro**: `/#filters`
- **Vedi tutte le aziende**: `/#vetrini`
- **Vedi tutte le offerte**: `https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php`
- **Soluzioni e tariffe**: `/soluzioni-e-tariffe`
- **Registra azienda**: `https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it`
- **Blog**: `/#blog`

**Step 2: Implement Anchor Logic**
Use `useLocation` to determine if we are on the Home page. If not, links should use absolute paths (`/`) followed by the hash.

**Step 3: Commit**
```bash
git add webapp/src/components/Navbar.jsx
git commit -m "feat: refactor navbar links for multi-page navigation"
```

### Task 5: Build Pricing Page

**Files:**
- Create: `webapp/src/pages/Pricing.jsx`

**Step 1: Implement Pricing Page UI**
Create the "Cinematic" pricing page with:
- Hero section.
- Autonomia section (2 cards).
- Abbonamenti section (ProRecruit, FlexiPost).
- Multi-pack section (5/10).

**Step 2: Add GSAP Animations**
Implement staggered reveals for pricing tiers.

**Step 3: Commit**
```bash
git add webapp/src/pages/Pricing.jsx
git commit -m "feat: implement pricing page UI"
```

### Task 6: Final Polish and Redirects

**Files:**
- Modify: `webapp/src/App.jsx`

**Step 1: Add ScrollToTop**
Create a small helper to scroll to top on route change.

**Step 2: Verify all links**
Manually check each link behavior.

**Step 3: Commit**
```bash
git commit -m "feat: add scroll to top and final polish"
```
