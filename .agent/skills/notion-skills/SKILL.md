---
name: notion-skills
description: Gestione avanzata del database Notion per il logging cinemato-grafico ed editoriale delle sessioni di lavoro (Devlog). Genera template dettagliati e interattivi ispirandosi alla documentazione "Premium/Clinical".
---

# Notion Skills - Registrazione Avanzata Sessioni Lavoro

Utilizza questa skill ogni volta che l'utente richiede `/notion-skills`, oppure chiede di "tracciare/caricare la sessione", loggare il tempo, o creare la "solita configurazione" su Notion (es. "solita configurazione timing 60 minuti").

## Obiettivo
Creare record e documentazione su Notion strutturati in vero e proprio formato di **Devlog Dettagliato**, replicando la profondità e lo stile di documentazione Premium delle dashboard di Job Courier. L'interazione deve essere **proattiva**.

## 1. Trigger e Domande Interattive
Se l'utente invoca la skill **senza** fornire informazioni dettagliate su cosa loggare, **devi interrompere l'azione** e porre all'utente queste singole domande per mappare il DB (fai le domande in una singola lista):
1. *Qual è la Descrizione Breve della sessione?*
2. *Qual è il Progetto Collegato?*
3. *Che Categoria devo applicare?* (Scegli tra: `Sviluppo`, `Bug Fix`, `Meeting`, `Preparazione Corsi`, `Erogazione corso`, `Formazione`, `Debug`, `Altro`)
4. *Quanti Minuti Lavorati devo registrare?* (Default: 60)
5. *Dammi 2-3 frasi di contesto su quali sono stati gli Obiettivi e le Attività Svolte.*

*Solo dopo aver ricevuto queste risposte (o se l'utente te le ha già fornite), procedi alla creazione del record.*

## 2. Payload Database (Properties)
**DB ID Sessioni di Lavoro:** `c024f662-8528-4572-86bb-8c1809680da2`

Usa `mcp_notion_API-post-page` con questo payload per `properties`:
- `Descrizione Breve` (title): Titolo accattivante.
- `Data Sessione` (date): `YYYY-MM-DD` (di oggi, es. 2026-04-20).
- `Minuti Lavorati` (number): Valore in minuti, es. 60.
- `Categoria` (select): Es. `{"select": {"name": "Sviluppo"}}`.
- `Progetto Collegato` (relation): Array con ID del progetto. Es: Job Courier = `[{"id": "317fa85c-0d03-80fa-a38e-cb41059d5e74"}]`. *(Se non lo sai cercalo prima tramite API).*
- `Note` (rich_text): Un riassunto ultra-compatto.

## 3. Payload Interno della Pagina (Block Children - Il Devlog Cinematico)
Subito dopo la creazione della pagina, usa `mcp_notion_API-patch-block-children` sull'ID creato.
Inserisci il seguente format di devlog, ispirato all'Evoluzione Strategica e Design Cinematico.

**Devi includere esattamente questo ordine e questo stile di design:**

1. **Titolo H2:** "🎯 Obiettivi della Sessione"
   - **Paragrafo:** Descrizione in 2-3 righe dell'obiettivo macro (es. restyling, fix dell'architettura).
   - **Divider**
2. **Titolo H2:** "📝 Descrizione Attività"
   - **Paragrafo:** Breve narrazione delle scelte tech e dell'esperienza sviluppata.
   - **Divider**
3. **Titolo H2:** "📋 Todo List Eseguita (Attività/Fix)"
   - **Bulleted List Items:** I punti chiave delle feature create o problemi risolti.
4. **Titolo H2:** "🧠 Mappa Concettuale (Visione Strategica)" *(Includilo sempre)*
   - **Code Block (language: mermaid):** Genera un piccolo diagramma Mermaid `graph TD` che visualizza il flusso di ciò su cui hai lavorato (es: Component --> State --> View, o un flow dell'utente).
   - **Divider**
5. **Titolo H2:** "🛠️ Execution Roadmap (Prossimi Passi)"
   - Usa dei **Titoli H3** per suddividere per categorie (es. 1. UI Navigation, 2. API Integration).
   - Inserisci dei blocchi di tipo `to_do` (checkbox) sotto ogni H3 con le task da completare nella prossima sessione.
6. **Callout:**
   - Aggiungi sempre alla fine un blocco di tipo `callout` con icona `💡`. All'interno inserisci una best-practice formattata in grassetto da tenere a mente derivata dall'esperienza della sessione corrente.

## Schema Esempio (Payload JSON per Patch Block Children)
```json
[
  { "type": "heading_2", "heading_2": { "rich_text": [{"text": {"content": "🎯 Obiettivi della Sessione"}}] } },
  { "type": "paragraph", "paragraph": { "rich_text": [{"text": {"content": "..."}}] } },
  { "type": "divider", "divider": {} },
  { "type": "heading_2", "heading_2": { "rich_text": [{"text": {"content": "📝 Descrizione Attività"}}] } },
  { "type": "paragraph", "paragraph": { "rich_text": [{"text": {"content": "..."}}] } },
  { "type": "divider", "divider": {} },
  { "type": "heading_2", "heading_2": { "rich_text": [{"text": {"content": "📋 Todo List Eseguita"}}] } },
  { "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{"text": {"content": "..."}}] } },
  { "type": "heading_2", "heading_2": { "rich_text": [{"text": {"content": "🧠 Mappa Concettuale"}}] } },
  { "type": "code", "code": { "language": "mermaid", "rich_text": [{"text": {"content": "graph TD\\n  A --> B"}}] } },
  { "type": "divider", "divider": {} },
  { "type": "heading_2", "heading_2": { "rich_text": [{"text": {"content": "🛠️ Execution Roadmap"}}] } },
  { "type": "heading_3", "heading_3": { "rich_text": [{"text": {"content": "1. Next Epic"}}] } },
  { "type": "to_do", "to_do": { "checked": false, "rich_text": [{"text": {"content": "..."}}] } },
  { "type": "callout", "callout": { "icon": {"type": "emoji", "emoji": "💡"}, "rich_text": [{"text": {"content": "⚠️ Ricorda di testare i deployment su Vercel ad ogni feature completata."}}] } }
]
```

**Nota Operativa:** Non presentare il json nudo all'utente e non indicare i dati specifici della chimata API. Sintetizza sempre che hai "Aggiornato Notion seguendo rigorosamente il format editoriale avanzato."
