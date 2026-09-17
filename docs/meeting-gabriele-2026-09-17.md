# Meeting Gabriele — 17/09/2026 pomeriggio (parte Job Courier)

Fonte: registrazione condivisa da Gabriele, trascrizione automatica. Nota: la stessa riunione ha toccato anche Wallmoss (vedi doc separata nel progetto Wallmoss).

## Prossime attività per area

### UX pagina offerte
- Doppio scroll indipendente tra colonna lista offerte e colonna dettaglio (non barra unica).
- Colonna lista: altezza dinamica pari alla colonna dettaglio (oggi statica a 5 elementi).
- Ridurre dimensione banner ADS (sx e dx) seguendo la logica già usata sui banner homepage — restano riconoscibili come ADS per policy AdSense.
- Rendere linkabili i loghi azienda ovunque mancano (pagina "tutte le aziende", pagina offerta).
- Unire descrizione azienda + lista offerte sulla pagina company — **bloccato**: manca il link/fonte per recuperare le descrizioni, chiesto a Laura.
- Bug testo troncato/sovrapposto su annunci Randstad — sospetto carattere speciale nel feed. Serve screenshot al prossimo episodio per avere evidenza.
- Cambiare CTA "candidatura gestita su sito esterno" → dinamico "Candidatura diretta sul sito di [nome cliente]".

### Blog automation (priorità dichiarata da Gabriele)
- Target: 2 articoli/giorno (1 candidati + 1 aziende), in 3 lingue, pubblicazione autonoma.
- Keyword da audit Semrush giornaliero già attivo — puntare su termini alto valore/poco sfruttati.
- Ogni articolo deve embeddare offerte pertinenti filtrate per lingua/cantone (stesso pattern doppio scroll).
- Articoli aziende: tono più commerciale verso il servizio.
- ADS anche dentro gli articoli, non solo su pagina offerte.
- Valutare sezione blog non indicizzata per contenuti di servizio.

### AdSense / traffico
- Auto ADS riattivate, monitorare rendimento su finestra 7 giorni.
- Verificare quota traffico che arriva sul frontend proprio JC (oggi ~10%, sito in fase di indicizzazione).

### Infrastruttura
- Vercel: dominio ai limiti di traffico su v3.6 — autorizzazione verbale ricevuta da Gabriele per intervenire.
- Server FTP in cloud da allestire per il feed dati (file arriva ogni sera, struttura Excel, primo giorno carica tutto lo storico poi solo differenze) — **bloccato fino a fine settembre**, priorità dopo blog + correzioni sito.
- Pannello hosting non abilita una funzione necessaria per l'FTP — da riprendere con l'hosting provider.

### Marketing / altro
- Aggiungere link LinkedIn in home (30k follower) + banner non invasivo.

### Amministrativo
- Fatture: uniformare nomenclatura voci — "Prestazioni informatiche di consulenza" per Job Courier, "Attività di formazione/training" per le ore formazione.

## Prossimo checkpoint
Nessuna data JC-specifica fissata in call — priorità: correzioni sito → blog → FTP, in quest'ordine.
