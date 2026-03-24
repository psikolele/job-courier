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
        
        # Sezione 1: Setup Progetto
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Inizializzazione React e Vite"}}]}},
        {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Setup completo dell'ambiente di sviluppo per la landing page di JobCourier."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Creazione webapp con Vite e React."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Integrazione TailwindCSS v4, Framer Motion e GSAP."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Configurazione file index.css con preset Midnight Luxe e Glassmorphism."}}]}},

        # Sezione 2: Componenti UI
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Sviluppo Componenti UI"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Navbar ad isola fluttuante."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Hero Section asimmetrica con tipografia Playfair Display."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Sezione Features interattive (Diagnostic Shuffler, Telemetry Typewriter)."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Sezione Protocol con card sticky parallax (ScrollTrigger)."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Footer e CTA split configurati."}}]}},

        # Sezione 3: Deploy
        {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. GitHub e Vercel"}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Commit e Push del progetto completo."}}]}},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Apertura Pull Request (#1) sul ramo feature/initial-webapp per il deploy."}}]}},

        {"object": "block", "type": "divider", "divider": {}},
        
        # Conclusione
         {"object": "block", "type": "callout", "callout": {
             "rich_text": [{"type": "text", "text": {"content": "La prima versione della piattaforma è stata completata e pubblicata su GitHub, in attesa del deploy finale su Vercel."}}],
             "icon": {"type": "emoji", "emoji": "🎯"}
         }}
    ]

    properties = {
        "Descrizione Breve": {"title": [{"text": {"content": "Sviluppo JobCourier Landing Page e PR Vercel"}}]},
        "Data Sessione": {"date": {"start": today_str}},
        "Minuti Lavorati": {"number": 120},
        "Categoria": {"select": {"name": "Sviluppo"}},
        "Note": {"rich_text": [{"text": {"content": "Setup React+Vite, TailwindCSS, Componenti UI (Hero, Navbar, Features, Protocol). Push su GitHub e PR per deploy."}}]}
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
