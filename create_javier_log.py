import requests
import os
import sys
import io
import datetime
from dotenv import load_dotenv

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(r'C:\Users\psiko\Desktop\Antigravity\Bloom 2.0\.env')
API_KEY = os.getenv('NOTION_API_KEY')
HEADERS = {'Authorization': f'Bearer {API_KEY}', 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json'}

db_url = 'https://api.notion.com/v1/databases/31711fcad25980e19c14ec705519d899/query'

response = requests.post(db_url, headers=HEADERS)
tasks = []
if response.status_code == 200:
    results = response.json().get('results', [])
    for r in results:
        title_prop = r.get('properties', {}).get('Task name', {}).get('title', [])
        if title_prop:
            tasks.append(title_prop[0]['plain_text'])

print("Found tasks:", tasks)

# Now create the session log
def search_page(query):
    url = "https://api.notion.com/v1/search"
    payload = {"query": query, "filter": {"value": "page", "property": "object"}}
    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code == 200:
        results = response.json().get("results", [])
        if results:
             return results[0]['id']
    return None

project_id = search_page("Internal Training")
if not project_id:
    project_id = search_page("Formazione")
if not project_id:
    project_id = search_page("BLC")
if not project_id:
     project_id = search_page("Social & Marketing")

today_str = datetime.datetime.now().strftime("%Y-%m-%d")

bullets = []
for task in tasks:
    bullets.append(
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": task}}]}}
    )

if not bullets:
    bullets = [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Nessun task trovato nel database specificato."}}]}}]


blocks = [
    {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "📋 Temi Trattati (Sessione Javier)"}}]}},
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Durante la sessione formativa sono stati affrontati e analizzati i seguenti task/progetti:"}}]}},
] + bullets + [
    {"object": "block", "type": "divider", "divider": {}},
    {"object": "block", "type": "callout", "callout": {
        "rich_text": [{"type": "text", "text": {"content": "Sessione completata con successo. Tutti i punti in agenda sono stati smarcati/discussi."}}],
        "icon": {"type": "emoji", "emoji": "🎓"}
    }}
]

properties = {
    "Descrizione Breve": {"title": [{"text": {"content": "Sessione Formazione Javier"}}]},
    "Data Sessione": {"date": {"start": today_str}},
    "Minuti Lavorati": {"number": 150},
    "Categoria": {"select": {"name": "Formazione"}},
    "Note": {"rich_text": [{"text": {"content": "Analisi e formazione sui task: " + ", ".join(tasks)}}]}
}

if project_id:
    properties["Progetto Collegato"] = {"relation": [{"id": project_id}]}

DATABASE_ID = "c024f662-8528-4572-86bb-8c1809680da2" # Sessioni di Lavoro
payload = {
    "parent": {"database_id": DATABASE_ID},
    "icon": {"type": "emoji", "emoji": "👨‍🏫"},
    "properties": properties,
    "children": blocks
}

url_create = "https://api.notion.com/v1/pages"
response_create = requests.post(url_create, json=payload, headers=HEADERS)
if response_create.status_code == 200:
    data = response_create.json()
    print(f"SUCCESS! Page URL: {data['url']}")
else:
    print(f"ERROR: {response_create.text}")
