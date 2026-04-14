import requests
import os
import sys
import io
import datetime
from dotenv import load_dotenv

# Set encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load .env from Bloom 2.0 folder as seen in previous scripts
dotenv_path = r'C:\Users\psiko\Desktop\Antigravity\Bloom 2.0\.env'
load_dotenv(dotenv_path)

API_KEY = os.getenv("NOTION_API_KEY")
DATABASE_ID = "c024f662-8528-4572-86bb-8c1809680da2" # Sessioni di Lavoro

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
            # Look for a project page with "Job Courier" in the title
            properties = result.get("properties", {})
            title_property = properties.get("Name") or properties.get("title") or properties.get("Project Name")
            if title_property:
                # Notion search is already doing the filtering, but let's be sure
                return result['id']
    return None

def create_page(project_id):
    url = "https://api.notion.com/v1/pages"
    
    # Session Date: April 10, 2026
    session_date = "2026-04-10"

    blocks = [
        {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "📋 Argomenti Trattati (Sessione Emanuele & Gabriele)"}}]}},
        
        # Section 1: Hero & UI Refactoring
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Refactoring Hero & UI Layout"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Trasformazione del Search Widget da orizzontale a verticale per allineamento estetico con l'area Aziende."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Rimozione menu secondari (\"Altri Link\") per pulizia visiva e riduzione del carico cognitivo."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Ripristino e animazione delle frecce di interazione (pointer arrows) per migliorare l'affordance."}}]}},

        # Section 2: Advertisements & Filters
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Spazi Sponsorizzati & Filters"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Implementazione griglia pubblicitaria: 4 banner piccoli sopra lo slider e 1 grande in fondo alla sezione."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Inserimento URL reali per i partner Premium (BLC-SA, Wallmoss)."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Risoluzione problemi di overlapping e z-index tramite correzione del padding invece di margini negativi."}}]}},

        # Section 3: Technical Fixes
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. Ottimizzazioni & Bug Fixes"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Fix sintassi JSX in Hero.jsx (rimozione tag di chiusura extra)."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Gestione crash root su Vercel nello script di scraping."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Miglioramento caricamento immagini e aggiunta effetto zoom hover nell'area destra della Hero."}}]}},

        {"object": "block", "type": "divider", "divider": {}},
        
        # Conclusion
        {"object": "block", "type": "callout", "callout": {
            "rich_text": [{"type": "text", "text": {"content": "Sessione di 60 minuti completata. La UI è ora stabilizzata e pronta per il deploy finale della sezione Hero e Filtri."}}],
            "icon": {"type": "emoji", "emoji": "🚀"}
        }}
    ]

    properties = {
        "Descrizione Breve": {"title": [{"text": {"content": "JobCourier - UI Refactoring & Adv Grid Implementation"}}]},
        "Data Sessione": {"date": {"start": session_date}},
        "Minuti Lavorati": {"number": 60},
        "Categoria": {"select": {"name": "Sviluppo"}},
        "Note": {"rich_text": [{"text": {"content": "Sessione tra Emanuele e Gabriele focalizzata sulla stabilità del layout Hero, integrazione spazi pubblicitari e fix Vercel deploy."}}]}
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
        print("Project 'Job Courier' not found.")
    
    print(f"Project ID: {pid}")
    print("Creating Notion page for April 10th session...")
    create_page(pid)
