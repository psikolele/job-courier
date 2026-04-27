# LLM Wiki: Job Courier Redesign (27 Apr 2026)

## 📌 Stato Attuale: Cosa abbiamo fatto oggi

1. **Hero & Navbar: Visual Refinement**
   - Reso lo sfondo Navbar `FAFAFA` e quello Candidates `F4F6F8` per un distacco più elegante rispetto all'originale grigio.
   - Istituito il colore rosso `#e63946` per il tasto LOGIN.
   - Sostituito lo slider immagini base lato aziende con una versione più dinamica, introducendo l'interazione manuale tramite **Pill-style Dots** animati e riducendo il tempo tra le slide a 4s.

2. **Blog: Redesign 50/50 Split**
   - Distrutto il vecchio layout a sfondo scuro `#1a2554` con le tre card fisse.
   - Creato un nuovo layout "Clinical Boutique" totalmente bianco, spezzato in due colonne a metà esatta per mantenere il dualismo (Candidati a sx, Aziende a dx).
   - Introdotto in ogni colonna un carosello indipendente per le card (che a loro volta sono state stilizzate in bianco e bordo tenue) con controllo Pill-style e tempi sfasati (5s e 5.3s) per evitare un effetto eccessivamente sincronizzato.

## 🚀 Prossime Operazioni da Fare

1. **Job Cards (Lista Annunci):** 
   - Logo azienda grande in alto a sx.
   - Sotto il logo, layout stringato con: Titolo Annuncio (Prominente), Cantone + Comune, e solo per ultimi i tag Settore / Ruolo.

2. **AdSlots (Spazi Pubblicitari):**
   - Devono estendersi per tutta la larghezza (full-width) disponibile.
   - Ridurre il totale a 4 slot posizionati correttamente (probabilmente in una griglia 2x2 o 4 colonne).
   - Rimuovere curve eccessive per restare nello stile "rettangolare" concordato.

3. **Menu e Rotte:**
   - Creazione della rotta `/come-funziona` (Pagina Statica Step-by-Step).
   - Controllare label del menu candidati (Deve essere "Pubblica il tuo curriculum").

4. **Meccanismo di Paywall / Ingaggio:**
   - Sviluppare un sistema di blocco ("Barriera") per cui l'utente, giunto al terzo click su un annuncio, riceve un popup per registrarsi o fare login.

5. **Template Annuncio Interno:**
   - La Job Card non porterà più direttamente fuori (su JobRoom), ma aprirà una pagina template di JobCourier `/offerta/:id`. L'unica via d'uscita sarà premere "Candidati ora".

6. **Home Add-ons:**
   - Montare il componente `<Vetrini />` sulla home per mostrare le aziende premium.
   - Prevedere un nuovo blocco per due grandi "Referenze/Testimonial".

7. **Hero H1:**
   - Uniformare l'animazione di scale in modo che gli H1 candidati e aziende abbiano sempre le stesse identiche dimensioni a riposo.

## 📝 Notion Documentation Standard

Tutte le sessioni create su Notion (es. "Sessioni di Lavoro" o "Devlog") **DEVONO** seguire il seguente template di struttura a blocchi (ispirato allo stile "Premium/Clinical"):

1. **Paragraph**: `🚀 [Tipo] [Nome Progetto] — [Titolo Sessione]`
2. **Heading 2**: `🎯 Obiettivo della sessione`
3. **Paragraph**: `**Conclusione:** [Testo del riassunto]`
4. **Paragraph**: `**📋 Attività svolte:**`
5. **Bulleted List**: Elenco dei compiti completati
6. **Divider**
7. **Heading 2**: `✅ Risultati raggiunti`
8. **Paragraph (Opzionale)**: Sottotitolo in bold es. `**UI/UX Components:**`
9. **Bulleted List**: Elenco dei risultati
10. **Divider**
11. **Heading 2**: `📋 Prossimi passi`
12. **Bulleted List**: Elenco dei prossimi passi
