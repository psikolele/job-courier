# Design Doc: Registration Wall (Click Tracker)

## Obiettivo
Aumentare le conversioni degli utenti anonimi spingendoli all'iscrizione dopo un numero limitato di visualizzazioni degli annunci.

## Specifiche Funzionali
1. **Conteggio Clic**: Monitorare i clic sulle card della sezione "Ultime Inserite" (Filters.jsx).
2. **Persistenza**: Salvare il conteggio nel `localStorage` con scadenza a 24 ore.
3. **Trigger**: Al terzo clic, bloccare l'apertura del link e mostrare un popup.
4. **Popup (Registration Wall)**:
   - UI Cinematica (sfondo blu, blur pesante, design premium).
   - Messaggio: "Per continuare a visualizzare gli annunci, iscriviti gratuitamente al portale".
   - CTA: Bottone magnetico verso `https://jobroom.jobcourier.ch/job-seekers-login.php`.
   - Chiusura: Tasto "X" per tornare alla navigazione (ma i clic successivi ri-triggerano il popup).

## Architettura Tecnica
### 1. State Management (Local)
Verrà implementato un hook personalizzato o una funzione di utility per gestire il `localStorage`:
```json
{
  "count": 3,
  "expiry": 1714731200000
}
```

### 2. Componente UI: `RegistrationModal.jsx`
Un componente dedicato (definito in `Filters.jsx` o separato) che utilizza:
- **GSAP**: Per le animazioni di entrata/uscita.
- **Lucide React**: Icona `UserPlus`.
- **Tailwind**: Per il layout cinematico e il blur.

### 3. Intercettazione Clic
Modifica del componente `motion.a` in `Filters.jsx`:
- Aggiunta di un `onClick` che verifica il conteggio prima di permettere il comportamento di default del link.

## Piano di Test
1. Cliccare 1 volta: Verificare salvataggio in localStorage.
2. Cliccare 3 volte: Verificare comparsa popup e blocco link.
3. Chiudere popup e cliccare ancora: Verificare ri-comparsa immediata.
4. Simulare scadenza (24h): Verificare reset del conteggio.
