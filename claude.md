# Job_Courier — Marketplace Platform Guide

**Parent:** ../../claude.md  
**Category:** Website Development > Marketplace  
**Status:** 🔴 CRITICAL - Active Development  
**Updated:** 2026-09-17  
**Model:** Haiku 4.5 (default) | Sonnet 4.6 (architecture/debug)

---

## ⚡ Quick Summary

**What:** jobcourier.ch — marketplace offerte (feed Arca24/jobroom), vetrina aziende, blog SEO multilingua. CRM email campaigns è un troncone separato (Next.js, vedi wiki).  
**Stack reale:** React + Vite in `webapp/`, API serverless Vercel in `api/`. Le sezioni "Architettura"/"Token Budget" che comparivano qui fino al 17/09 descrivevano uno stack che non è mai esistito in questo repo (`Browse.tsx`, `useFilters.ts`, ecc.) — erano un template mai adattato. Rimosse.

**⚠️ Stato e task correnti: SEMPRE `00_Wiki/job-courier/README.md`, non questo file.** Questo file ha tenuto per mesi un "Recap Riunioni" statico del 27/03/2026: il 17/09/2026 ha causato un errore reale (task di marzo, alcuni già chiusi da mesi, proposti come se fossero della riunione di quel giorno). Un session-status o un elenco task **datato** va nel wiki (`00_Wiki/job-courier/`, una pagina per meeting/decisione), mai qui: qui non c'è un meccanismo che lo tenga aggiornato o lo segnali come scaduto.

---

## 🚫 Scope discipline — non-negotiable

**Never touch files, components, or content that were not explicitly part of the current task.** Not "cleanup while I'm in here", not "this looked unused", not a side effect of an unrelated refactor. If a change isn't the thing the user asked for, it doesn't go in the same commit — flag it separately and ask.

**Why:** 11/08/2026 — a homepage-only AdSense/banner removal (explicitly scoped to `Home.jsx`) turned out to delete BLC/Ated/Formaty/SUPSI sponsor banners **site-wide**, because `AdBanner` had only ever been used on the homepage and nobody checked that before removing it. The user found out from a client-facing production regression, not from the session that caused it. This is exactly the failure mode `.githooks/pre-push` (`webapp/scripts/verify-no-unintended-deletions.mjs`) now exists to catch — but the hook is a backstop, not a substitute for checking scope before editing.

**How to apply:** before removing or replacing anything, `git log --oneline --all -- <file>` and grep for other usages of the component/export you're about to touch. If a change would affect anything beyond the file(s) the user named, say so and wait for confirmation before proceeding — don't proceed and mention it in the summary afterward.

---

## ✅ Session Checklist

- [ ] Nessun console.log/debugger in codice di produzione
- [ ] Test scritti per i percorsi critici toccati
- [ ] **Temp files eliminati** — script `_*_tmp.*`, output intermedi, screenshot diagnostici cancellati a fine sessione (prefisso `_` = temporaneo = cancellare; asset finali, sorgente React, wiki → conservare)

---

**Ultimo handoff:** [docs/handoff-2026-09-06.md](docs/handoff-2026-09-06.md) (precedente: [handoff-2026-09-04.md](docs/handoff-2026-09-04.md))

**🏢 VETRINA AZIENDE — DATORI CON ANNUNCI SCOLLEGATI:** se la vetrina mostra *meno* aziende del previsto, o `/aziende-che-assumono` non concorda con `/api/companies?withJobs=1`, cercare `[SNAPSHOT-EXPIRED]` e `[SNAPSHOT-REJECTED]` nei log e leggere la sezione "Datori con annunci scollegati" in `00_Wiki/job-courier/arca24-company-index.md`. Tre trappole: il file `api/_orphan-employers-snapshot.js` committato **non** è quello che legge la produzione; nella `build` il generatore orfani deve girare **prima** di quello del roster; lo snapshot scade a 7 giorni e da lì la pagina statica perde quei datori senza che nulla fallisca.

**🏢 VETRINA AZIENDE:** prima di diagnosticare la vetrina in home o `/aziende-che-assumono` (pochi loghi, un logo solo, aziende "sparite"), leggere `00_Wiki/job-courier/arca24-company-index.md` — la paginazione dell'indice è client-side (la prima risposta contiene già tutte le aziende, `?page=2` risponde 410 a ragione), i formati di link azienda vivi sono tre, e il selettore CSS va tenuto accanto al parser perché il disallineamento svuota il roster senza errori.

**📡 FEED OFFERTE:** prima di diagnosticare offerte mancanti, poche card in vetrina o una pagina offerta vuota, leggere `00_Wiki/job-courier/jobroom-feed-resilience.md` — forme note del guasto Arca24 e invarianti da rispettare (varietà ≠ volume, id = prefisso numerico, mai `find(...) || list[0]`).

**🚨 GO-LIVE DOMINIO:** prima di QUALSIASI operazione su DNS, Vercel domains o deploy produzione, leggere [docs/GOLIVE-PLAN.md](docs/GOLIVE-PLAN.md) — mappa infrastruttura verificata (GoDaddy=DNS, Hostpoint=WP vecchio), redirect map obbligatoria (213 URL), playbook errori e rollback. Il go-live è FATTO (DNS switch 01/08/2026, `jobcourier.ch` live su Vercel) — GOLIVE-PLAN.md ora è playbook storico/rollback, non più pre-flight. La migrazione verso l'account Vercel dedicato (`jobcourier24-4812`) è un troncone diverso e separato: stato sempre in `00_Wiki/job-courier/vercel-dedicated-account-migration-2026-08-28.md`, mai qui — quella pagina veniva letta con uno stato di agosto ormai superato, da riverificare prima di ogni affermazione su di essa.

---

## 📋 Notion — Formato Sessioni di Lavoro (OBBLIGATORIO)

**Database:** `collection://6ba19f86-ee14-46b1-b082-7ad1363711f9`  
**Progetto Collegato Job Courier (dev):** `https://www.notion.so/32cfa85c0d0381babb25e98a05c98279`  
**Progetto Collegato Job Courier (generale):** `https://www.notion.so/317fa85c0d0380faa38ecb41059d5e74`

### ⚠️ REGOLA CRITICA — Progetto Collegato (SEMPRE)

Quando crei/aggiorni sessioni Notion per **Job Courier**, il campo `Progetto Collegato` deve essere:
```
"[\"https://app.notion.com/p/317fa85c0d0380faa38ecb41059d5e74\"]"
```
- **Nome progetto:** "Create Job Courier Website"
- **Collection:** `collection://2acfa85c-0d03-81a3-b22f-000b86019b58` (Progetti N8N)
- **Formato:** JSON array stringificato (NON array nativo — causa errore MCP)
- **Se hai dubbi su quale progetto collegare → CHIEDI prima di creare la sessione**

### Struttura ESATTA del contenuto pagina (Notion-flavored Markdown)

```
## 🎯 Obiettivo della sessione
**Conclusione:** [frase singola riassuntiva di cosa è stato fatto e perché]
**📋 Attività svolte:**
- [attività 1]
- [attività 2]
- [attività N]
---
## ✅ Risultati raggiunti
- **[Etichetta breve]:** [descrizione risultato concreto]
- **[Etichetta breve]:** [descrizione risultato concreto]
---
## 📋 Prossimi passi
- [azione futura 1]
- [azione futura 2]
---
## [Sezione specifica opzionale — es. 🗺️ Implementation Plan / 🔍 Logica / 📅 Timeline]
[tabelle, codice, dettagli tecnici]
```

### Regole
- **NO callout block** (`<callout>`) come blocco introduttivo — inizia SEMPRE con `## 🎯`
- **NO `# 🛠️ Dev Log`** come titolo interno — è uno stile vecchio
- Sezioni separate sempre da `---`
- Bullet list con `**Label:**` prefix per risultati
- Tabelle Notion con `<table header-row="true">` solo per implementation plan / timeline / task list
- Proprietà `Minuti Lavorati`: numero intero (es. 120, non "120 minuti")
- Proprietà `Categoria`: uno tra `Sviluppo | Bug Fix | Meeting | Preparazione Corsi | Erogazione corso | Formazione | Debug | Altro`
- Se sessione copre sia sviluppo che meeting → `Categoria: Sviluppo`, dettaglio meeting nella sezione Attività svolte
- Proprietà `Note`: SEMPRE compilare con breve riassunto (1-2 frasi) — stato finale + eventuali pendenze. Non lasciare vuoto.

## 🌐 Lingua

Risposte SEMPRE in italiano. Codice e commit in inglese.
