# Batteria di test manuali — jobcourier.ch

Da eseguire **in produzione** su `https://www.jobcourier.ch`. Ogni test dice cosa fare, cosa
devi vedere, e — la parte che conta — **cosa significa se fallisce**, perché quasi tutti i
difetti trovati su questo progetto non danno errori: danno un'assenza, e un'assenza somiglia
troppo a "non c'è niente da mostrare".

**Prima di iniziare**
- Usa una **finestra in incognito** per ogni blocco che riguarda i cookie: il consenso resta
  memorizzato e falsa i test successivi.
- Tieni aperta la console del browser (F12). Se un test fallisce, guarda **Console** e
  **Network** prima di segnalarlo: distingue "il sito è rotto" da "l'upstream non risponde".
- Alcuni test dipendono da cosa pubblica Arca24 in quel momento. Dove serve, è scritto come
  trovare un annuncio adatto invece di sperare che ci sia.

---

## A. Annunci pubblicitari

### A1 — L'annuncio compare ogni 3 offerte, ed è riconoscibile
1. Apri `/offerte` in incognito e **accetta** i cookie di marketing.
2. Scorri la lista.

**Atteso:** dopo la terza card compare un riquadro con **fondo grigio, bordo tratteggiato** e
l'etichetta **ANNUNCIO** in alto. Non deve somigliare a una card offerta.

**Se fallisce:** riquadro assente → l'unità non sta servendo (vedi A3 prima di allarmarti).
Riquadro presente ma **senza etichetta o con bordo pieno come le card** → fermati e segnalalo
subito: è la condizione che mette a rischio l'account AdSense.

### A2 — Nessun annuncio in home
Apri `/` con i cookie accettati e scorri tutta la pagina.

**Atteso:** nessun annuncio, in nessun punto. I banner degli sponsor (BLC, Ated, Formaty,
SUPSI) **devono** esserci: quelli non sono AdSense.

**Se fallisce:** se compaiono annunci Google in home, è stata riaccesa la modalità automatica
nel pannello AdSense — decisione presa e revocata il 04/09.

### A3 — Rifiutando i cookie non resta un buco
1. Nuova finestra in incognito, apri `/offerte`, **rifiuta** i cookie (o "Solo necessari").
2. Scorri fino a dove sarebbe l'annuncio.

**Atteso:** **niente**. Nessuna etichetta "ANNUNCIO", nessun riquadro vuoto, nessuno spazio
bianco: le card si susseguono senza interruzioni.

**Se fallisce:** un'etichetta sopra uno spazio vuoto è il difetto corretto il 04/09 — se
riappare, è tornata indietro.

### A4 — Consenso dato in ritardo *(il test che nessuno pensa di fare)*
1. Incognito, apri `/offerte` e **non toccare il banner** per almeno 30 secondi.
2. Scorri la lista, poi **accetta** i cookie di marketing.
3. Resta sulla pagina e guarda il punto fra la terza e la quarta card.

**Atteso:** quando l'annuncio compare, arriva **con la sua etichetta e il suo bordo**.

**Se fallisce:** un annuncio senza etichetta è esattamente il difetto corretto il 06/09
(`c54cac2`). È il più grave dei tre, perché è la situazione in cui Google interviene.

### A5 — Dettaglio offerta: uno sopra, uno sotto
Apri una qualsiasi offerta (`/offerta/<id>`) con i cookie accettati.

**Atteso:** al massimo un annuncio sopra la descrizione e uno in fondo. **Mai in mezzo al
testo** dell'annuncio di lavoro.

---

## B. Candidatura esterna

Serve un annuncio che si candida sul sito del datore. **Come trovarlo:** apri
`/offerte?keyword=adecco` (oppure `manpower`, `randstad`) e clicca le offerte finché sotto il
bottone **CANDIDATI** non compare la scritta *"Candidatura gestita su sito esterno"*. Se in un
giorno non ne trovi nessuna su ~15 provate, **non è un difetto**: dipende da cosa pubblica
Arca24 — ma segnalamelo, perché il 04/09 quella stessa assenza era invece un bug nostro.

### B1 — L'avviso c'è su entrambe le pagine
Verifica la nota sia nella **lista** (`/offerte`, sotto il titolo della card selezionata) sia
nella **pagina dell'offerta** (`/offerta/<id>`, sotto il bottone).

**Se fallisce:** manca su una delle due → il candidato non sa che sta per uscire dal sito.

### B2 — L'icona significa qualcosa
Confronta un'offerta esterna e una interna.

**Atteso:** esterna → icona "link esterno"; interna → freccia `→`.

**Se fallisce:** se l'icona è identica ovunque, siamo tornati alla versione in cui non
distingueva nulla.

### B3 — La transizione parte da sola
Clicca **CANDIDATI** su un'offerta esterna.

**Atteso:** compare la schermata JobCourier con logo, nome azienda, **il sito di destinazione
scritto** (es. `easyapply.jobs`) e una barra che si riempie. Dopo ~2,5 secondi si apre il sito
del datore **senza altri click**.

**Se fallisce:** se devi cliccare due volte, è tornato il difetto del popup bloccato. Se la
schermata resta **trasparente o invisibile** ma il redirect parte lo stesso, è tornato il
difetto dell'animazione.

### B4 — La destinazione è quella giusta *(controllo che salva figuracce)*
Sulla schermata di transizione leggi il dominio mostrato, e confrontalo con il **nome
dell'azienda dell'offerta**.

**Atteso:** coerente (l'ATS del datore o un servizio tipo `easyapply.jobs`, `jometer.com`).

**Se fallisce:** se atterri sul form di **un'altra azienda**, è il difetto corretto il 06/09 —
il link veniva preso da un annuncio correlato nella stessa pagina. Segnalalo subito: manda via
i candidati verso il datore sbagliato.

### B5 — Cambio offerta rapido
Nella lista clicca **rapidamente** tre offerte diverse, poi clicca CANDIDATI sull'ultima.

**Atteso:** la destinazione è quella dell'offerta che stai guardando, non di una precedente.

---

## C. Ricerca e filtri

### C1 — Widget home e pagina offerte danno lo stesso risultato
1. Dalla home cerca **HR** + **Ticino** → annota i primi 3 titoli.
2. Copia l'URL della pagina risultante, aprila in una scheda nuova.

**Atteso:** stessi risultati, stesso ordine. Era il bug mostrato a schermo da Gabriele.

### C2 — I cantoni rispondono tutti
Prova almeno: **Ticino**, **Zurigo**, **Ginevra**, **Berna**, **Vaud**, **San Gallo**,
**Grigioni**, **Argovia**.

**Atteso:** ogni cantone o dà risultati, o dice esplicitamente che non ce ne sono. La sede
mostrata nelle card deve appartenere al cantone scelto.

**Se fallisce:** un cantone **sempre vuoto** merita una segnalazione: 17 cantoni su 26 sono
stati muti per mesi senza che nessuno se ne accorgesse, perché una lista vuota si legge come
"non ci sono offerte".

### C3 — La rilevanza è imperfetta, e va saputo
Cerca **HR** in Ticino.

**Atteso:** la maggior parte dei risultati è pertinente; **qualche risultato fuori tema è
normale** — il portale a monte cerca anche nel corpo dell'annuncio e in altre lingue. Un
annuncio da "sviluppatore" per la ricerca "informatico" è corretto, non un errore.

**Da segnalare solo se:** i risultati non c'entrano *quasi mai* con la ricerca.

### C4 — Cambio lingua
Passa a **DE** e poi a **FR** e ripeti una ricerca.

**Atteso:** in tedesco escono offerte dei cantoni tedeschi, in francese di quelli francesi; la
lista non è mai vuota (se non c'è nulla nella regione, mostra comunque offerte).

---

## D. Lista offerte e layout

### D1 — Una sola barra di scorrimento
Su `/offerte` da computer, scorri.

**Atteso:** scorre **la pagina**, non riquadri interni. Nessun scroll dentro lo scroll.

### D2 — Nessuna card tagliata a metà
**Atteso:** l'ultima card visibile è intera. In fondo c'è **Carica altro**, che aggiunge altre
offerte senza ricaricare la pagina.

### D3 — Tag NUOVO
**Atteso:** sulle offerte del giorno, accanto alla data, la scritta **NUOVO** in **nero e
grassetto** (non fucsia).

**Nota:** se lo controlli **fra mezzanotte e le 2 del mattino**, verifica che sia sull'offerta
di *oggi* e non su quella di ieri — era un difetto reale, corretto il 06/09.

### D4 — Mobile
Ripeti D1-D3 da telefono: lista e dettaglio sono due schede separate, e il passaggio fra le
due non deve mostrare pagine bianche.

---

## E. Pagine legali e lingue

### E1 — Condizioni generali e cookie policy in 4 lingue
Apri `/condizioni-generali` e `/cookie-policy`, cambiando lingua IT → EN → DE → FR.

**Atteso:** **tutto** il testo cambia lingua, non solo i titoli. In fondo, la riga che dice che
in caso di divergenza fa fede l'italiano.

**Nota:** l'URL resta in italiano in tutte le lingue. È così per tutto il sito, non è un
difetto di queste pagine.

### E2 — La tabella dei cookie si carica
Su `/cookie-policy`, in mezzo alla pagina, deve comparire l'elenco dei cookie generato da
Cookiebot. Se resta vuoto, è il servizio esterno a non rispondere.

---

## F. Vetrina in home

### F1 — Massimo 2 offerte per azienda
In home, guarda le offerte in vetrina.

**Atteso:** nessuna azienda occupa più di **2** posti, anche se ne ha molte pubblicate.

### F2 — Mai vuota
Cambia lingua e ricontrolla: la vetrina mostra sempre qualcosa, anche se nella lingua scelta
non ci sono offerte della regione.

---

## Cosa segnalare, e come

Perché una segnalazione sia utile servono tre cose: **URL**, **cosa ti aspettavi**, **cosa hai
visto**. Se puoi, aggiungi uno screenshot e l'orario.

Priorità alta, da segnalare subito:
- annuncio pubblicitario **senza etichetta** o indistinguibile da una card (A1, A4)
- candidatura che porta al **datore sbagliato** (B4)
- un cantone **sempre vuoto** (C2)
- annunci in **home** (A2)

Le prime due mettono a rischio, rispettivamente, l'account AdSense e la fiducia dei candidati.
La terza è quella che è già passata inosservata per mesi.
