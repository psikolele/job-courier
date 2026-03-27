import urllib.request
import re

try:
    req = urllib.request.Request('https://www.jobcourier.ch/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    
    fonts = set(re.findall(r'font-family\s*:\s*([^;\"\}\>]+)', html, re.I))
    print("FONTS:", fonts)
    
    logos = re.findall(r'src=[\"\']([^\"\']*logo[^\"\']*)[\"\']', html, re.I)
    print("LOGOS:", logos)
    
except Exception as e:
    print(f"Error fetching URL: {e}")
