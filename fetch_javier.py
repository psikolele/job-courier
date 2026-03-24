import requests
import os
import json
from dotenv import load_dotenv
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(r'C:\Users\psiko\Desktop\Antigravity\Bloom 2.0\.env')
API_KEY = os.getenv('NOTION_API_KEY')
HEADERS = {'Authorization': f'Bearer {API_KEY}', 'Notion-Version': '2022-06-28'}
url = 'https://api.notion.com/v1/blocks/31711fcad25980e19c14ec705519d899/children'

response = requests.get(url, headers=HEADERS)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    for block in response.json().get('results', []):
        block_type = block['type']
        if block_type in block and 'rich_text' in block[block_type]:
            text = "".join([t['plain_text'] for t in block[block_type]['rich_text']])
            print(f"[{block_type}] {text}")
else:
    print(response.text)
