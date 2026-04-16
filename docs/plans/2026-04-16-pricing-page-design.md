# Design Doc: Pricing Page & Routing Refactor

## Objective
Replicate the "Soluzioni e Tariffe" page from the current website as a new, standalone page in the React application, integrated with a multi-page routing system and updated navigation.

## Architecture
- **Framework**: React 19.
- **Routing**: `react-router-dom` v6+.
- **State Management**: React Context or Local State for UI-specific toggles (e.g., Monthly/Yearly pricing).
- **Navigation Logic**:
    - The `Navbar` will become "route-aware".
    - Anchor links (e.g., `#filters`) will lead to `/#filters`.
    - Cross-page navigation will be handled via `Link` component and URL hashes.

## UI/UX Design (Cinematic Guidelines)
- **Theme**: Clinical Luxe (Preset A/B hybrid).
- **Global Effects**: Noise overlay (5%), `rounded-[2rem]` containers.
- **Hero Section**: 
    - Full-bleed dark background with high-fidelity office/clinic imagery.
    - Title: "Cerchi candidati? Noi li troviamo per te." (Sans Bold) / "Subito." (Serif Italic).
- **Pricing Sections**:
    - **Autonomia**: Basic (199 CHF) and Boost (249 CHF) cards.
    - **Abbonamenti**: ProRecruit and FlexiPost options with staggered pricing for 6/12 months.
    - **Multi-pack**: Artifact-style cards for 5 and 10 postings.
- **Animations**: GSAP staggered entrance for pricing cards; smooth scroll between sections.

## Navigation Structure
| Label | Route/Link | Target |
| :--- | :--- | :--- |
| **Cerca Lavoro** | `/#filters` | Home Page Search |
| **Vedi tutte le aziende** | `/#vetrini` | Home Page Logos |
| **Vedi tutte le offerte** | `https://jobroom...` | External (JobRoom) |
| **Soluzioni e tariffe** | `/soluzioni-e-tariffe` | New Page |
| **Registra azienda** | `https://jobroom...` | External (Register) |
| **Blog** | `/#blog` | Home Page Blog |

## Implementation Steps
1. Install `react-router-dom`.
2. Refactor current `App.jsx` content into `pages/Home.jsx`.
3. Create `pages/Pricing.jsx` with the new design.
4. Update `Navbar.jsx` to handle cross-page anchor links.
5. Setup `BrowserRouter` in `main.jsx` and `Routes` in `App.jsx`.

## Error Handling
- Page-level Error Boundary for React Router.
- 404 Page for undefined routes.

## Testing
- Verify cross-page anchor link behavior (e.g., clicking "Blog" from Pricing page correctly navigates to Home and scrolls to Blog).
- Verify responsive layout of pricing cards on mobile.
