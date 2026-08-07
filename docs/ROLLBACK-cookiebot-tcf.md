# Rollback — passaggio del TCF da Google a Cookiebot

**Data:** 2026-08-07
**Branch:** `claude/cookiebot-tcf`
**Stato:** in test su preview. **Nulla di questo è in produzione.**

Ogni modifica di questo lavoro è elencata qui con il modo esatto per annullarla.
L'ordine di rollback è l'inverso di quello di applicazione.

---

## Contesto in una riga

Il sito mostra due banner di consenso perché nessuno produce una stringa IAB TCF:
`__tcfapi('ping')` in produzione risponde `cmpId 300` (Google). Cookiebot (`cmpId 134`)
può farlo, ma va acceso da codice. Acceso quello, il messaggio GDPR di Google diventa
superfluo e si può spegnere.

**Regola d'oro:** il messaggio Google si spegne **solo dopo** aver visto `cmpId 134` e una
TC string valida in produzione. Spegnerlo prima lascia AdSense senza segnale di consenso
valido nel SEE/UK/Svizzera: gli annunci scadono a non personalizzati o smettono di essere
serviti. È l'unico passo che tocca le entrate.

---

## Stato attuale delle modifiche

| # | Modifica | Dove | Applicata | Reversibile in |
|---|---|---|---|---|
| 1 | `data-framework="TCFv2.2"` + `gtag_enable_tcf_support` | `webapp/index.html` | branch, **non in produzione** | 1 comando git |
| 2 | Alias dominio di preview | Cookiebot → Impostazioni → Domini | **sì, live** | 30 secondi a mano |
| 3 | Spegnere il messaggio GDPR Google | AdSense → Privacy e messaggi | **no, non fatta** | 1 interruttore |
| 4 | Attestazione conformità IAB | privacy/cookie policy | no, da scrivere | modifica testo |

---

## 1. Codice — `webapp/index.html`

**Cosa cambia:** aggiunge `data-framework="TCFv2.2"` al tag Cookiebot e
`window['gtag_enable_tcf_support'] = true;` prima dei tag Google.

**Rollback se non è ancora stato unito in `main`:** non serve fare nulla, la produzione
non lo ha mai avuto. Per buttare via il branch:

```bash
git push origin --delete claude/cookiebot-tcf
```

**Rollback se è già stato unito in `main` e deployato:**

```bash
git revert --no-edit <sha-del-merge-o-del-commit>
git push origin main
```

Vercel ridistribuisce da solo in ~1 minuto. In alternativa, dal pannello Vercel si può
promuovere il deployment precedente ("Instant Rollback"), che è più veloce e non richiede
un commit — ma poi il codice va comunque revertito, altrimenti il deploy successivo
reintroduce la modifica.

**Come verificare che il rollback abbia funzionato:** su `https://www.jobcourier.ch`,
in console del browser:

```js
__tcfapi('ping', 2, (d, s) => console.log(d.cmpId))
```

Deve tornare a stampare `300` (Google). Se stampa `134`, il vecchio codice è ancora servito
— svuotare la cache o attendere il deploy.

---

## 2. Cookiebot — alias del dominio di preview

**Cosa è stato fatto:** aggiunto l'alias
`job-courier-webapp-git-claude-cookiebot-tcf-psikolele-projects.vercel.app`
mappato su `www.jobcourier.ch`, in Impostazioni → Domini → Alias dominio.

**Perché:** senza alias Cookiebot non riconosce l'host di preview, non serve la
configurazione e il banner non compare — quindi non è testabile nulla che dipenda
dall'interazione dell'utente.

**Rollback:** manage.cookiebot.com → Impostazioni → Domini → riga dell'alias → icona ⌫ a
destra → SALVA (la spunta nella barra azzurra a sinistra).

**Rischio se lo si dimentica acceso:** basso ma non nullo. L'alias non influisce sul
comportamento in produzione; però lascia un host di test autorizzato a usare la
configurazione di consenso del cliente. Va rimosso a fine test — e comunque quando il
branch viene cancellato quell'host smette di esistere.

**Nota:** le modifiche alla configurazione Cookiebot impiegano **fino a 20 minuti** a
propagarsi. Vale sia per l'aggiunta sia per la rimozione: dopo il rollback il banner può
restare com'era per un po'. Non è un errore.

---

## 3. Messaggio GDPR di Google — NON ANCORA TOCCATO

**Da fare solo dopo la verifica in produzione del punto 1.**

Percorso: AdSense (`adsense.google.com/adsense/u/3/pub-4406252930350703`) →
Privacy e messaggi → Regolamenti europei → riga "Messaggio relativo ai regolamenti europei
senza titolo" → interruttore nella colonna **Pubblica**.

**Rollback:** riaccendere lo stesso interruttore. Il messaggio torna attivo, la sua
configurazione non viene persa quando è spento.

**Attenzione:** questo è l'unico passo con impatto diretto sulle entrate. Prima di spegnere,
verificare in produzione:

- `__tcfapi('ping')` → `cmpId: 134`, `tcfPolicyVersion: 5`
- `__tcfapi('getTCData')` dopo aver accettato → `tcString` non vuota
- Google (vendor ID 755) presente tra i vendor con consenso
- richieste a `pagead2.googlesyndication.com` presenti e annunci visibili
- AdSense → nessun nuovo errore, entrate stabili per almeno 2-3 giorni

**Segnale di allarme dopo lo spegnimento:** calo di RPM, aumento di annunci non
personalizzati, o errori di consenso nei report AdSense. In quel caso riaccendere subito
il messaggio: torna la situazione a due banner, che è brutta ma sicura.

---

## 4. Attestazione di conformità IAB — da scrivere

Cookiebot lo richiede a chi attiva il TCF: una dichiarazione di conformità alle policy
IAB in un punto visibile del sito, tipicamente la privacy o la cookie policy.

**Rollback:** rimuovere il paragrafo. Va rimosso se si torna indietro sul TCF, altrimenti
il sito dichiara una conformità a un framework che non usa più.

---

## Rollback completo, nell'ordine

Se serve tornare esattamente allo stato del 07.08.2026 prima di questo lavoro:

1. AdSense → riaccendere il messaggio GDPR (se era stato spento) — **per primo**, è quello
   che protegge le entrate
2. `git revert` del commit su `main` e push, oppure Instant Rollback su Vercel
3. Cookiebot → rimuovere l'alias del dominio di preview
4. rimuovere l'attestazione IAB dalla privacy policy, se aggiunta
5. verificare su `www.jobcourier.ch` che `cmpId` sia tornato `300` e che gli annunci girino

Il passo 1 va fatto per primo e non ha attese: è un interruttore. Gli altri possono
richiedere qualche minuto (deploy) o fino a 20 minuti (propagazione Cookiebot).

---

## Cosa NON è reversibile

Nulla di questo lavoro distrugge dati. I consensi già raccolti restano nel registro
Cookiebot; la configurazione del messaggio Google sopravvive allo spegnimento; il codice è
in git. L'unico effetto non annullabile è il tempo in cui i visitatori hanno visto una
configurazione diversa — e i consensi raccolti in quella finestra, che restano validi.
