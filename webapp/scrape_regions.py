import urllib.request
try:
    from bs4 import BeautifulSoup
except ImportError:
    import os
    os.system('pip install beautifulsoup4')
    from bs4 import BeautifulSoup

url = "https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&source=https%3A%2F%2Fwww.jobcourier.ch%2F"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')
select = soup.find('select', {'name': 'region'})
if select:
    for opt in select.find_all('option'):
        val = opt.get('value')
        if val:
            print(f"{val}: {opt.text.strip()}")
else:
    print("Select non trovata. Ecco alcuni select della pagina:")
    for s in soup.find_all('select'):
        print("Name:", s.get('name'))
