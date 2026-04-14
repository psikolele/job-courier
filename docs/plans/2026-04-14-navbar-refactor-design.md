# Navbar Refactoring — Design Document

**Data:** 2026-04-14  
**Stato:** Approvato dall'utente

---

## Obiettivo

Ripristinare il navbar nello stile della versione Vercel precedente (split bicolore, menu a tutto schermo), aggiungendo la suddivisione tra "Candidati" e "Aziende" **solo all'interno del menu esploso** (Vertical Stack accordion).

---

## Design Approvato

### Navbar Chiusa (Default)

Layout **split bicolore** orizzontale con `fixed` positioning:

| Zona | Contenuto | Sfondo |
|:---|:---|:---|
| Sinistra (~50-60%) | Logo `JOBCOURIER` | Bianco (`#ffffff`) |
| Destra (~40-50%) | `IT \| DE \| FR` + bottone `LOGIN` + hamburger | Scuro (`#1a2554` o `#131f3f`) |

**Comportamento scroll:**
- Non trasparente → già visibile dall'inizio (come attualmente)  
- `box-shadow` più marcata sul bordo inferiore: `0 4px 24px rgba(0,0,0,0.18)` per essere leggibile su sfondi scuri
- Riduzione altezza da 72px → 60px dopo scroll > 40px

**Nota:** La dicitura "PER I CANDIDATI" (piccola, in colore accento) che appare sotto il logo è un tocco opzionale recuperato dalla versione precedente — **non nella navbar chiusa comune** — può essere omessa per semplicità.

---

### Menu Esploso (Full-Screen Overlay)

Attivato dal **hamburger** in alto a destra (visibile su tutti i dispositivi: mobile e desktop).

**Struttura dell'overlay:**
- Overlay a tutto schermo: `fixed inset-0 z-[100]`
- Sfondo: `#0B1120` (dark navy), texture leggera opzionale
- Animazione entrata: `opacity 0→1 + y -20→0` in `0.3s`

**Contenuto dell'overlay (Vertical Stack):**

```
[X]  Chiudi (in alto a destra)

 PER I CANDIDATI  ▼             ← accordion header, bold, grande
 ├─ 🔍 Cerca Lavoro             ← link con icona + descrizione breve
 ├─ ⭐ Le mie Candidature
 ├─ 📈 Consigli di Carriera
 └─ 📖 Blog

 ─────────────────────          ← divisore orizzontale sottile

 PER LE AZIENDE   ▼             ← accordion header, bold, grande
 ├─ 💼 Pubblica un Annuncio
 ├─ 👥 Gestisci Candidature
 ├─ 🏢 Soluzioni e Tariffe
 └─ 📈 Recruiter Pro

 [ACCEDI]                       ← bottone pieno, in basso
 IT | DE | FR                  ← selettori lingua
```

**Comportamento accordion:**
- Una sola sezione aperta alla volta (chiude l'altra al click)
- Default: "Per i Candidati" aperta, "Per le Aziende" chiusa
- Icone `ChevronDown` animate (rotate 180° quando aperto)
- Animazione espansione: `height: auto` con `overflow: hidden` e transizione smooth

---

## File Modificati

- **Unico file:** `webapp/src/components/Navbar.jsx` (refactoring completo)

---

## Cosa NON cambia

- `App.jsx` → nessuna modifica
- `Hero.jsx` → nessuna modifica
- I link nelle due sezioni candidati/aziende rimangono identici a quelli attuali
- Il Login Modal rimane identico
- i18n e multilingua rimangono identici
