# June 4th Refinements and Pricing Redesign Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Complete refinements on the DotCard animation, footer login modal triggers, api cookie parsing bug, and a full redesign of the Pricing page.

**Architecture:** We will implement an absolute container for DotCard tracking, update prop flows for the footer, fix node-fetch headers parsing in the backend API, and restructure the Pricing page into a responsive 2-tab layout with styled pricing tiers and a benefits sidebar.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, Framer Motion

---

### Task 1: Refactor DotCard Component and styles

**Files:**
- Modify: `webapp/src/components/ui/moving-dot-card.jsx`
- Modify: `webapp/src/index.css`

**Step 1: Write code updates for moving-dot-card.jsx**
Add `.jc-dot-border-container` and responsive font size based on text length.

**Step 2: Write styles updates for index.css**
Update `.jc-dot-dot` and `.jc-dot-border-container` classes, and set keyframes of `moveDot` to be percentage-based and responsive.

**Step 3: Commit**
```bash
git add webapp/src/components/ui/moving-dot-card.jsx webapp/src/index.css
git commit -m "feat: implement responsive moving dot animation and long text font scaling"
```

---

### Task 2: Fix Footer Login Modal Trigger

**Files:**
- Modify: `webapp/src/App.jsx`
- Modify: `webapp/src/components/Footer.jsx`

**Step 1: Pass setShowLoginModal prop in App.jsx**
Pass the `setShowLoginModal` function down to `<Footer />`.

**Step 2: Add trigger logic in Footer.jsx**
Receive `setShowLoginModal` as prop, and intercept clicks on any link with `href="#login"` to open the modal.

**Step 3: Commit**
```bash
git add webapp/src/App.jsx webapp/src/components/Footer.jsx
git commit -m "fix: trigger login modal from footer links"
```

---

### Task 3: Fix API cookie parsing in backend

**Files:**
- Modify: `webapp/api/job-detail.js`

**Step 1: Update set-cookie header extraction in job-detail.js**
Replace `.headers.raw()['set-cookie']` with `sessionResponse.headers.get('set-cookie')` and a regex parser.

**Step 2: Commit**
```bash
git add webapp/api/job-detail.js
git commit -m "fix: correct node-fetch headers.raw() issue on job-detail API"
```

---

### Task 4: Redesign Pricing Page

**Files:**
- Modify: `webapp/src/pages/Pricing.jsx`

**Step 1: Implement 2-tab layout and Organic Tech style in Pricing.jsx**
Rewrite the file to include the 2 tabs, pricing grids, sidebar, and direct contacts for Agency pricing.

**Step 2: Commit**
```bash
git add webapp/src/pages/Pricing.jsx
git commit -m "feat: redesign pricing page with dual tabs, pricing tiers, and sidebar"
```
