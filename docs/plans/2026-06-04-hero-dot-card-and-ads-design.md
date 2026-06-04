# Design: Hero Dot Card Animation, Quick Links Alignment, and Split Ad Banners

Questo documento definisce il design tecnico per le modifiche richieste all'interfaccia di Job Courier.

## Componente DotCard e Animazione
- **Classe CSS Namespaced:** Utilizzeremo classi con prefisso `.jc-dot-` per evitare collisioni, mappando esattamente la logica di `21st.dev` (Le Thanh).
- **Posizionamento Assoluto:** La card `.jc-dot-card` sarà posizionata in modo assoluto all'interno del contenitore `.jc-dot-outer` usando:
  ```css
  position: absolute;
  top: 10%;
  right: 10%;
  bottom: 30px;
  left: 35px;
  ```
- **Tracciamento del Bordo Responsivo:** La coordinata del pallino `.jc-dot-dot` utilizzerà `@keyframes jcMoveDot` con percentuali e formule identiche a quelle del posizionamento della card:
  - Angolo Alto-Destra (0%/100%): `top: 10%; right: 10%;`
  - Angolo Alto-Sinistra (25%): `top: 10%; right: calc(100% - 35px);` (corrisponde a `left: 35px`)
  - Angolo Basso-Sinistra (50%): `top: calc(100% - 30px); right: calc(100% - 35px);` (corrisponde a `bottom: 30px`, `left: 35px`)
  - Angolo Basso-Destra (75%): `top: calc(100% - 30px); right: 10%;` (corrisponde a `bottom: 30px`, `right: 10%`)
- **Centratura del Pallino:** `transform: translate(50%, 50%)` per centrare perfettamente il pallino di 10px sulla linea di bordo.

## Allineamento Quick Links e Dimensioni Font
- **Allineamento Perfetto:** Aggiunta di una classe `.hero-quick-links` ai contenitori dei Quick Link in `Hero.jsx`. Nei vari break height della viewport (già presenti per `.hero-card-box`), allineiamo il padding sinistro e destro a quello dei bottoni superiori (`1.5rem`, `1.25rem`, `1rem`, `0.75rem`).
- **Simmetria Lato Aziende:** Aggiungiamo la classe `p-6` alla card aziende (`hero-card-box` lato destro) per renderla simmetrica alla card candidati su desktop.
- **Font Size:** Aumentiamo la dimensione del testo dei link da `text-[11px]` a `text-[13px]` per migliorare la leggibilità.

## Banners Pubblicitari (Ads)
- **Rimozione Vecchio Banner:** Rimuoviamo `<AdBanner />` da `Filters.jsx`.
- **Top Placement (2 Banner Reali):** Rendering di `<AdBanner type="top" />` in `Home.jsx` sopra `<Vetrini />`. Questo banner mostra i reali file locali `/img/banner-asfl-svbl.png` e `/img/banner-forma-academy.png` affiancati. Utilizza `object-fit: contain` per evitare il taglio del testo.
- **Bottom Placement (4 Banner BLC):** Rendering di `<AdBanner type="bottom" />` in `Home.jsx` sotto `<Vetrini />`. Questo banner mostra 4 istanze del placeholder BLC in un layout a griglia.
