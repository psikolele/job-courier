# Hero Spotlight Cards Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Sostituire le statistiche aziendali statiche nella Hero con due card interattive dotate di effetto "glassmorphism" e spotlight luminoso fucsia che segue il movimento del mouse.

**Architecture:** Creazione del nuovo componente riusabile `SpotlightCard.jsx` che cattura gli eventi di mouse-move e posiziona dinamicamente un gradiente radiale fucsia. Integrazione di questo componente in `Hero.jsx` per mostrare le statistiche `120'000+` e `3'000+` con incremento animato all'avvio.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React

---

## Proposed Changes

### UI Components

#### [NEW] [spotlight-card.jsx](file:///c:/Users/psiko/Desktop/Antigravity/02_Azienda_Kraken/Sviluppo_Web/Clienti/Job_Courier/webapp/src/components/ui/spotlight-card.jsx)
Un componente che traccia la posizione del mouse e visualizza un effetto luce radiale fucsia all'interno di una card vetro.

#### [DELETE] [moving-dot-card.jsx](file:///c:/Users/psiko/Desktop/Antigravity/02_Azienda_Kraken/Sviluppo_Web/Clienti/Job_Courier/webapp/src/components/ui/moving-dot-card.jsx)
Eliminazione del vecchio componente di animazione a pallino orbitante non più utilizzato.

#### [MODIFY] [Hero.jsx](file:///c:/Users/psiko/Desktop/Antigravity/02_Azienda_Kraken/Sviluppo_Web/Clienti/Job_Courier/webapp/src/components/Hero.jsx)
Sostituzione del blocco statico delle statistiche con due istanze di `SpotlightCard` contenenti i contatori animati per "Candidati registrati" e "Candidature al mese".

### Styling

#### [MODIFY] [index.css](file:///c:/Users/psiko/Desktop/Antigravity/02_Azienda_Kraken/Sviluppo_Web/Clienti/Job_Courier/webapp/src/index.css)
Rimozione dei vecchi stili `.jc-dot-` e introduzione delle classi `.jc-spotlight-` per il glassmorphism e il bagliore.

---

## Bite-Sized Tasks

### Task 1: Create SpotlightCard Component and Update Styles

**Files:**
- Create: `webapp/src/components/ui/spotlight-card.jsx`
- Delete: `webapp/src/components/ui/moving-dot-card.jsx`
- Modify: `webapp/src/index.css`

**Step 1: Scrivere spotlight-card.jsx**
Creare il file `webapp/src/components/ui/spotlight-card.jsx` con il codice per il mouse-tracking e il contatore animato.
```jsx
import React, { useState, useEffect, useRef } from 'react';

export default function SpotlightCard({ target, duration = 2000, label }) {
  const [count, setCount] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (end <= 0) return;
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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const display = `${formatSwiss(count)}${count >= target ? '+' : ''}`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="jc-spotlight-card"
    >
      {isHovered && (
        <div
          className="jc-spotlight-glow"
          style={{
            background: `radial-gradient(circle 90px at ${coords.x}px ${coords.y}px, rgba(255, 31, 122, 0.18), transparent 80%)`,
          }}
        />
      )}
      <div className="jc-spotlight-content">
        <div className="jc-spotlight-text">{display}</div>
        <div className="jc-spotlight-label">{label}</div>
      </div>
    </div>
  );
}
```

**Step 2: Aggiornare index.css**
Modificare `webapp/src/index.css` per definire le classi `.jc-spotlight-`.
Rimuovere tutte le classi `.jc-dot-` a partire da riga 243.
```css
/* Spotlight Card — glassmorphic with mouse tracking */
.jc-spotlight-card {
  position: relative;
  flex: 1;
  height: 140px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
.jc-spotlight-card:hover {
  border-color: rgba(255, 31, 122, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
.jc-spotlight-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s ease;
}
.jc-spotlight-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.jc-spotlight-text {
  font-family: var(--font-brand);
  font-weight: 900;
  font-size: 2.2rem;
  color: var(--brand-white);
  letter-spacing: -0.02em;
  line-height: 1;
}
.jc-spotlight-label {
  font-family: var(--font-brand);
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
  text-align: center;
}
```

**Step 3: Cancellare moving-dot-card.jsx**
Rimuovere il file `webapp/src/components/ui/moving-dot-card.jsx`.

**Step 4: Commit**
```bash
git rm webapp/src/components/ui/moving-dot-card.jsx
git add webapp/src/components/ui/spotlight-card.jsx webapp/src/index.css
git commit -m "feat: create SpotlightCard component and styling with mouse tracking spotlight"
```

---

### Task 2: Integrate SpotlightCard in Hero

**Files:**
- Modify: `webapp/src/components/Hero.jsx`

**Step 1: Modificare Hero.jsx**
Importare `SpotlightCard` e sostituire la riga di statistiche statica con le due card responsive.
```jsx
// Aggiungere l'import in alto
import SpotlightCard from './ui/spotlight-card';

// Sostituire le righe 428-440 con le SpotlightCard
                    {/* Stat aziende + CTA — same container as candidati form */}
                    <div className="hero-card-box w-full max-w-lg mx-auto mb-6 md:mb-8 md:h-[312px] flex flex-col justify-between p-6" style={{ borderRadius: 0 }}>
                        {/* Stats Spotlight Cards row */}
                        <div className="flex gap-4 w-full pb-2" style={{ flex: 1, alignItems: 'center' }}>
                            <SpotlightCard target={120000} duration={2200} label="Candidati registrati" />
                            <SpotlightCard target={3000} duration={1800} label="Candidature al mese" />
                        </div>
                        {/* Button — pinned to bottom, full width */}
                        <AnimatedButton
```

**Step 2: Commit**
```bash
git add webapp/src/components/Hero.jsx
git commit -m "feat: integrate SpotlightCard stats into Hero companies panel"
```

---

### Task 3: Verification

**Step 1: Test di compilazione locale**
Eseguire `npm run build` all'interno di `webapp` per verificare l'assenza di errori di sintassi o bundling.

**Step 2: Aggiornare task.md**
Aggiornare `docs/plans/task.md` indicando lo stato delle attività.
