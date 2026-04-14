import requests
import os
import sys
import io
import datetime
from dotenv import load_dotenv

# Set encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Try to load .env from parent folders if needed
load_dotenv(r'C:\Users\psiko\Desktop\Antigravity\Bloom 2.0\.env')
load_dotenv()

API_KEY = os.getenv("NOTION_API_KEY")
DATABASE_ID = "c024f662-8528-4572-86bb-8c1809680da2"  # Sessioni di Lavoro

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

def search_page(query):
    url = "https://api.notion.com/v1/search"
    payload = {"query": query, "filter": {"value": "page", "property": "object"}}
    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code == 200:
        results = response.json().get("results", [])
        for result in results:
            return result['id']
    return None

def create_page(project_id):
    url = "https://api.notion.com/v1/pages"

    today_str = "2026-04-12"

    blocks = [
        # ── NOTA BREVE ──
        {"object": "block", "type": "callout", "callout": {
            "rich_text": [{"type": "text", "text": {"content": "Sessione di manutenzione e deploy per Job Courier. Recuperato contesto da chat precedente, effettuato il primo deploy del refactoring Navbar, poi applicati fix UI su tre componenti (Navbar, Hero, App)."}}],
            "icon": {"type": "emoji", "emoji": "📝"}
        }},

        {"object": "block", "type": "divider", "divider": {}},

        # ── DEV LOG ──
        {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "🛠️ Dev Log — 12 Aprile 2026"}}]}},

        # 1. Troubleshooting chat history
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Diagnosi problema Chat History"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Investigato perché Antigravity non mostrava le conversazioni precedenti nella UI."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Confermato che i file .pb esistono in conversations/ per tutte le 8 sessioni."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Il bug è nella UI di Antigravity: non genera overview.txt nei log e non mostra sessioni precedenti nella Chat History. Segnalato come bug applicativo non risolvibile lato codice."}}]}},

        # 2. Recupero contesto navbar
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Recupero contesto sessione Navbar Refactor (db992d03)"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Recuperato il contesto della chat precedente dal brain folder (immagini reference ReflexAI, codice Navbar.jsx)."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Verificato con git status che Navbar.jsx aveva 485 righe aggiunte e 122 eliminate pronte ma mai committate."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Effettuato primo commit (5913c99) e push su main → deploy Vercel attivato."}}]}},

        # 3. Fix 1 - Navbar
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. Fix Navbar — sempre visibile"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Problema: con scrollY=0 la navbar era completamente trasparente e invisibile."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Soluzione: rimosso lo stato isTransparent (forzato a false), background white/98 sempre attivo."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Animazione elegante allo scroll: altezza shrinks 72px→60px, shadow progressiva da shadow-none a shadow-[0_2px_24px_rgba(38,54,123,0.10)]."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Logo ripristinato a colori originali (rimosso il filtro brightness-0 invert)."}}]}},

        # 4. Fix 2 - Hero CTAs
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "4. Fix Hero — ripristino CTAs 'Altri link'"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Il refactoring precedente aveva rimosso i link secondari presenti nella versione vecchia."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Lato candidati: aggiunta sezione 'Altri link' con 3 ghost buttons: Vedi tutte le offerte, Vedi tutte le aziende, Blog."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Lato aziende: aggiunta sezione 'Altri link' con: Soluzioni e tariffe, Registra azienda."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Link aziende visibili solo all'hover della sezione companies (opacity 0→1 con Framer Motion)."}}]}},

        # 5. Fix 3 - CTA section
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "5. Fix App — rimozione CTA section e sostituzione AdSlot 50/50"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Rimossa la sezione CTA (componente interattivo duplicato con 'Accedi al tuo Prossimo Lavoro' / 'Trova il Miglior Talento') che generava ridondanza visiva."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Sostituita con 2 AdSlot placeholder in layout flex-row full-width, divisione 50%/50%, divisi da bordo sottile slate-200."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Lazy loading preservato tramite Suspense wrapper."}}]}},

        # 6. Deploy
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "6. Deploy"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Commit 5913c99: feat(Navbar) — primo deploy del refactoring split layout."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Commit 447db2d: fix — navbar always visible, restore hero CTAs, replace CTA with AdSlot 50/50."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Entrambi i commit pushati su main → deploy automatico Vercel."}}]}},

        {"object": "block", "type": "divider", "divider": {}},

        {"object": "block", "type": "callout", "callout": {
            "rich_text": [{"type": "text", "text": {"content": "Tutti i fix richiesti completati e deployati. La navbar è ora sempre visibile con animazione elegante allo scroll. Le CTAs secondarie dell'Hero sono ripristinate. La sezione CTA ridondante è stata sostituita con spazi pubblicitari placeholder 50/50."}}],
            "icon": {"type": "emoji", "emoji": "✅"}
        }}
    ]

    properties = {
        "Descrizione Breve": {"title": [{"text": {"content": "JobCourier — Deploy Navbar Refactor + UI Fixes (navbar, hero CTAs, AdSlot)"}}]},
        "Data Sessione": {"date": {"start": today_str}},
        "Minuti Lavorati": {"number": 120},
        "Categoria": {"select": {"name": "Sviluppo"}},
        "Note": {"rich_text": [{"text": {"content": "Recupero contesto da chat persa, primo deploy Navbar split-section, fix navbar trasparente, ripristino 'Altri link' nelle sezioni Hero, sostituzione CTA con placeholder AdSlot 50/50. 2 commit su main."}}]}
    }

    if project_id:
        properties["Progetto Collegato"] = {"relation": [{"id": project_id}]}

    payload = {
        "parent": {"database_id": DATABASE_ID},
        "icon": {"type": "emoji", "emoji": "💻"},
        "properties": properties,
        "children": blocks
    }

    response = requests.post(url, json=payload, headers=HEADERS)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"SUCCESS! Page URL: {data['url']}")
    else:
        print(f"ERROR: {response.text}")

if __name__ == "__main__":
    print("Searching for project 'Job Courier'...")
    pid = search_page("Job Courier")
    if not pid:
        print("Project not found, creating without relation...")
        pid = None

    print(f"Project ID: {pid}")
    print("Creating Notion page...")
    create_page(pid)
