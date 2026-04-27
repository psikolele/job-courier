# Job Courier Translation and Layout Refinement Design

## 1. Internationalization (i18n) Architecture
- **Data Management**: We will configure `react-i18next` with JSON dictionaries. Since the application currently falls back to Italian without proper configuration, we will create `it.json`, `en.json`, `de.json`, and `fr.json` under `src/locales/` and ensure `i18n.js` properly loads them.
- **Hero & Navbar**: Replace hardcoded Italian strings with `t('key')` references for mega menu items (`CANDIDATI`, `AZIENDE`), the "Access your Next Job" hero titles, and the CTA buttons.
- **Blog Section**: Move the static arrays (`candidateArticles`, `companyArticles`) out of `Blog.jsx` and map them directly from the JSON dictionary files using `t('blog.candidateArticles', { returnObjects: true })`. This allows titles and descriptions to dynamically change based on language.

## 2. Multilingual Text Responsiveness
- **Mega Menu (Navbar)**: The current fixed text sizes cause overlap when German or English translations produce longer words (e.g., "Unternehmen registrieren"). 
- **Solution**: We will add Tailwind's `break-words` and `whitespace-normal` classes. We will also introduce dynamic font-size scaling (`text-xs md:text-sm`) inside the dropdown menus to ensure text wraps correctly within the "Glass" containers on smaller viewports.

## 3. Advertisement Section Consolidation
- **Problem**: The bottom section in `Home.jsx` features empty text placeholders (`AdSlot A` and `AdSlot B`), while the design requirement dictates the sleek, image-based design seen in `Filters.jsx`.
- **Solution**: We will extract the high-fidelity ad markup from `Filters.jsx` (which contains the "Advertisement" badge and image overlay logic) into a reusable `<AdBanner id={id} />` component.
- **Implementation**: We will replace the inline ad blocks in `Filters.jsx` and the `AdSlot` components in `Home.jsx` with `<AdBanner />`. This ensures 100% visual consistency and a premium aesthetic across all ad placements.
