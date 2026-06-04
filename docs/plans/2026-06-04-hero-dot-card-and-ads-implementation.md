# Hero Dot Card, Quick Links and Ad Banners Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implementare l'animazione della DotCard identica all'originale Le Thanh di 21st.dev, ingrandire ed allineare i Quick Links orizzontali in Hero e creare il layout con i due banner reali sopra Vetrini e i quattro banner BLC sotto Vetrini.

**Architecture:** Modificheremo `moving-dot-card.jsx` e `index.css` per allineare card e tracciamento in percentuale del dot. Modificheremo `Hero.jsx` per allineare i Quick Links e ingrandire il font. Modificheremo `AdBanner.jsx` e `Home.jsx` per separare la visualizzazione degli annunci in alto (2 banner reali, object-fit contain) e in basso (4 BLC ads). Rimuoveremo il vecchio banner da `Filters.jsx`.

**Tech Stack:** React 19, Tailwind CSS v4

---

### Task 1: Refactor DotCard Component and CSS styles

**Files:**
- Modify: `webapp/src/components/ui/moving-dot-card.jsx`
- Modify: `webapp/src/index.css`

**Step 1: Aggiornare moving-dot-card.jsx per corrispondere alla struttura originale**
Rimuovere il wrapper `.jc-dot-border-container` e posizionare `.jc-dot-dot` direttamente dentro `.jc-dot-outer`, affiancato a `.jc-dot-card`.

```jsx
import React, { useState, useEffect } from 'react';

export default function DotCard({ target = 777000, duration = 2000, label = 'Views' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) return;
    const increment = Math.ceil(end / (duration / 50));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [target, duration]);

  const formatSwiss = (n) => {
    if (n < 1000) return `${n}`;
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return `${thousands}'${String(remainder).padStart(3, '0')}`;
  };
  const display = `${formatSwiss(count)}${count >= target ? '+' : ''}`;
  const isLongText = display.length > 7;

  return (
    <div className="jc-dot-outer">
      <div className="jc-dot-dot" />
      <div className="jc-dot-card">
        <div className="jc-dot-ray" />
        <div className="jc-dot-text" style={{ fontSize: isLongText ? '1.9rem' : '2.4rem' }}>{display}</div>
        <div className="jc-dot-label">{label}</div>
        <div className="jc-dot-line jc-dot-topl" />
        <div className="jc-dot-line jc-dot-leftl" />
        <div className="jc-dot-line jc-dot-bottoml" />
        <div className="jc-dot-line jc-dot-rightl" />
      </div>
    </div>
  );
}
```

**Step 2: Aggiornare index.css per l'animazione e posizionamento Le Thanh**
Definire il posizionamento assoluto di `.jc-dot-card` e la coordinata `@keyframes jcMoveDot` con i valori esatti del posizionamento dei bordi.

```css
/* Moving Dot Card — namespaced CSS classes */
.jc-dot-outer {
  position: relative;
  width: 190px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.jc-dot-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  animation: jcMoveDot 4s linear infinite;
  box-shadow: 0 0 8px rgba(255,255,255,0.85);
  transform: translate(50%, 50%);
  z-index: 5;
}
.jc-dot-card {
  position: absolute;
  top: 10%;
  right: 10%;
  bottom: 30px;
  left: 35px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.jc-dot-ray {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle at 10% 10%, rgba(255,255,255,0.12) 0%, transparent 80%);
  pointer-events: none;
}
.jc-dot-text {
  font-family: var(--font-brand);
  font-weight: 900;
  font-size: 2.4rem;
  color: #a8c4e8;
  letter-spacing: -0.03em;
  line-height: 1;
  position: relative;
  z-index: 1;
}
.jc-dot-label {
  font-family: var(--font-brand);
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-top: 8px;
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 6px;
}
.jc-dot-line {
  position: absolute;
  background: rgba(255,255,255,0.13);
}
.jc-dot-topl    { top: 0;    left: 12px; right: 12px; height: 1px; }
.jc-dot-bottoml { bottom: 0; left: 12px; right: 12px; height: 1px; }
.jc-dot-leftl   { left: 0;   top: 12px;  bottom: 12px; width: 1px; }
.jc-dot-rightl  { right: 0;  top: 12px;  bottom: 12px; width: 1px; }

@keyframes jcMoveDot {
  0%, 100% {
    top: 10%;
    right: 10%;
  }
  25% {
    top: 10%;
    right: calc(100% - 35px);
  }
  50% {
    top: calc(100% - 30px);
    right: calc(100% - 35px);
  }
  75% {
    top: calc(100% - 30px);
    right: 10%;
  }
}
```

**Step 3: Commit**
```bash
git add webapp/src/components/ui/moving-dot-card.jsx webapp/src/index.css
git commit -m "feat: align DotCard layout and keyframes with Le Thanh original coordinates"
```

---

### Task 2: Align Quick Links and Enlarge Font Size in Hero

**Files:**
- Modify: `webapp/src/components/Hero.jsx`

**Step 1: Aggiungere .hero-quick-links e ingrandire il testo in Hero.jsx**
1. Modificare i Quick Links candidati:
   - Aggiungere classe `hero-quick-links` al contenitore wrapper.
   - Sostituire `text-[11px]` con `text-[13px]`.
2. Modificare i Quick Links aziende:
   - Aggiungere classe `p-6` a `.hero-card-box` lato destro.
   - Aggiungere classe `hero-quick-links` al contenitore wrapper aziende.
   - Sostituire `text-[11px]` con `text-[13px]`.
3. Nel tag `<style>` in `Hero.jsx`, definire il padding per `.hero-quick-links` in base alle altezze dello schermo per sincronizzarsi con `.hero-card-box`:
   ```css
   .hero-quick-links {
       padding-left: 1.5rem;
       padding-right: 1.5rem;
   }
   @media (max-height: 950px) and (min-width: 768px) {
       .hero-quick-links {
           padding-left: 1.25rem !important;
           padding-right: 1.25rem !important;
       }
   }
   @media (max-height: 850px) and (min-width: 768px) {
       .hero-quick-links {
           padding-left: 1rem !important;
           padding-right: 1rem !important;
       }
   }
   @media (max-height: 720px) and (min-width: 768px) {
       .hero-quick-links {
           padding-left: 0.75rem !important;
           padding-right: 0.75rem !important;
       }
   }
   ```

**Step 2: Commit**
```bash
git add webapp/src/components/Hero.jsx
git commit -m "style: align quick links horizontally and enlarge text to 13px"
```

---

### Task 3: Split Ad Banner Layout in Home.jsx and update AdBanner.jsx

**Files:**
- Modify: `webapp/src/components/AdBanner.jsx`
- Modify: `webapp/src/components/Filters.jsx`
- Modify: `webapp/src/pages/Home.jsx`

**Step 1: Aggiornare AdBanner.jsx per supportare le tipologie top e bottom**
Modificare `AdBanner.jsx` per ricevere la prop `type` e renderizzare:
- `type="top"`: 2 banner reali affiancati (`banner-asfl-svbl.png` e `banner-forma-academy.png`), con `object-fit: contain` e sfondi specifici per ciascun banner.
- `type="bottom"`: 4 banner BLC (`Gemini_Generated_Image_ape98sape98sape9.png`) in griglia 2x2.

**Step 2: Rimuovere AdBanner da Filters.jsx**
Rimuovere il rendering di `<AdBanner />` e il relativo import in `Filters.jsx`.

**Step 3: Aggiungere i due banner in Home.jsx**
Includere `<AdBanner type="top" />` sopra `<Vetrini />` e `<AdBanner type="bottom" />` sotto `<Vetrini />` (sopra `<Blog />`).

**Step 4: Commit**
```bash
git add webapp/src/components/AdBanner.jsx webapp/src/components/Filters.jsx webapp/src/pages/Home.jsx
git commit -m "feat: split ads into top placement (2 real banners) and bottom placement (4 BLC ads)"
```

---

### Task 4: Verification and Deployment

**Files:**
- None

**Step 1: Test di compilazione locale**
Eseguire `npm run build` all'interno di `webapp`.

**Step 2: Deploy su Vercel**
Eseguire `npx vercel --prod --yes` dalla cartella radice del workspace.

**Step 3: Commit**
```bash
# Se necessario, per eventuali ultime modifiche di rifinitura
```
