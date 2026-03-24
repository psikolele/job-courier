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

tasks = [
    'Implementation Plan UI', 
    'Implementazione Calendario Bloom', 
    'Bug Fix N8N (Backend)', 
    'Aggiornamento Informazione Database', 
    'Implementation Plan N8N', 
    'Bug Fix UI (Frontend)'
]

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

blocks = [
    {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "📋 Temi Trattati (Sessione Javier)"}}]}},
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Durante la sessione formativa di 150 minuti sono stati affrontati e analizzati i seguenti progetti:"}}]}},
] + bullets + [
    {"object": "block", "type": "divider", "divider": {}},
    {"object": "block", "type": "callout", "callout": {
        "rich_text": [{"type": "text", "text": {"content": "Sessione completata con successo. Tutti i punti in agenda relativi alla programmazione backend/frontend e AI agent sono stati discussi."}}],
        "icon": {"type": "emoji", "emoji": "🎓"}
    }}
]

properties = {
    "Descrizione Breve": {"title": [{"text": {"content": "Sessione Formazione Javier"}}]},
    "Data Sessione": {"date": {"start": today_str}},
    "Minuti Lavorati": {"number": 150},
    "Categoria": {"select": {"name": "Formazione"}},
    "Note": {"rich_text": [{"text": {"content": "Sessione di 150 minuti sui seguenti task: " + ", ".join(tasks)}}]}
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
