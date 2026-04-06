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
DATABASE_ID = "c024f662-8528-4572-86bb-8c1809680da2" # Sessioni di Lavoro
PROJECTS_DB_ID = "e8c61bb9-6f17-4fd4-8d4e-12822aef64cf" # Assumendo questo come DB Progetti, ma usiamo /search generico come nello script di riferimento

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
            if "Progetti" in result.get("parent", {}).get("database_id", "") or True:
                 # Just take the first result for simplicity, assuming it's the project
                 return result['id']
    return None

def create_project(name, cliente="Personale", qualita="Media"):
    url = "https://api.notion.com/v1/pages"
    
    # We might not know the exact DB ID for projects here (unless it's hardcoded). 
    # But let's first search to see if "Job Courier" exists.
    pass

def create_page(project_id):
    url = "https://api.notion.com/v1/pages"
    
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")

    blocks = [
        {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "📋 Argomenti Trattati"}}]}},
        
        # Sezione 1: Integrazione API Modello
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Sviluppo Scraper e Vercel Serverless API"}}]}},
        {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Creazione e integrazione di un bridge Vercel per bypassare il blocco CORS del portale Jobroom."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Implementazione di `api/jobs.js` tramite Cheerio."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Scraping in tempo reale delle ultime 12 offerte con gestione mock fallback locale."}}]}},

        # Sezione 2: Componenti e Layout
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Modale e Vetrina Aziende"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Costruzione e sollevamento stato UI in `App.jsx` per l'handling del Modale di Login/Azienda."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Applicazione dei link definitivi 'Soluzioni e Tariffe' sia per l'Header (sostituendo Istituzioni) che nello slider ad estrazione."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Creazione del componente `Vetrini.jsx` in piena replica rispetto a `showcase-iframe.js` nativo, con polling dell'altezza in inter-window."}}]}},

        # Sezione 3: Git e CI/CD
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. Troubleshooting GitHub Actions / Vercel"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Commit massivo della codebase per testing Vercel."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Risoluzione configurazione `Root Directory` su Vercel Dashboard a seguito di errato default GitHub."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Creazione del branch 'trigger-vercel-deploy' e apertura di una Pull Request da CLI bypassando lock della pipeline principale."}}]}},

        {"object": "block", "type": "divider", "divider": {}},
        
        # Conclusione
         {"object": "block", "type": "callout", "callout": {
             "rich_text": [{"type": "text", "text": {"content": "Le implementazioni della fase 2 di Job Courier (meeting 27/03) sono concluse: backend bypassato e UI fedeltà 100% sulla vetrina iFrame."}}],
             "icon": {"type": "emoji", "emoji": "🎯"}
         }}
    ]

    properties = {
        "Descrizione Breve": {"title": [{"text": {"content": "JobCourier - Implemenzione Backend Scraping, Slider Aziende e Deploy"}}]},
        "Data Sessione": {"date": {"start": today_str}},
        "Minuti Lavorati": {"number": 90},
        "Categoria": {"select": {"name": "Sviluppo"}},
        "Note": {"rich_text": [{"text": {"content": "Sviluppo API Vercel Serverless, migrazione Vetrina iFrame dinamica, sistemazione workflow GitHub e Vercel, e state-management UI per i Login."}}]}
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
    import sys
    # Search for an appropriate project, "Job Courier" or fallback to "Social & Marketing" or "BLC"
    print("Searching for project 'Job Courier'...")
    pid = search_page("Job Courier")
    if not pid:
        print("Project 'Job Courier' not found, searching for 'Social & Marketing'...")
        pid = search_page("Social & Marketing")
    
    print(f"Project ID: {pid}")
    print("Creating page...")
    create_page(pid)
