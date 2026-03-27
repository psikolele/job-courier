import urllib.request
import re

codepen_url = 'https://codepen.io/MarcRay/pen/PomBeP'
req_js = urllib.request.Request(f'{codepen_url}.js', headers={'User-Agent': 'Mozilla/5.0'})
req_css = urllib.request.Request(f'{codepen_url}.css', headers={'User-Agent': 'Mozilla/5.0'})

try:
    with open('codepen.js', 'w', encoding='utf-8') as f:
        f.write(urllib.request.urlopen(req_js).read().decode('utf-8', errors='ignore'))
    with open('codepen.css', 'w', encoding='utf-8') as f:
        f.write(urllib.request.urlopen(req_css).read().decode('utf-8', errors='ignore'))
    print("CodePen downloaded successfully!")
except Exception as e:
    print(f"Error fetching CodePen: {e}")

# JobRoom API Analysis
job_url = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&role=logistica-2fmagazzino&role_id=224&source=https%3A%2F%2Fwww.jobcourier.ch%2F'
req_job = urllib.request.Request(job_url, headers={
    'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://www.jobcourier.ch/'
})

try:
    html = urllib.request.urlopen(req_job).read().decode('utf-8', errors='ignore')
    # Find all job items by some standard class or extract a snippet
    job_cards = re.findall(r'<div[^>]*class=[\'\"][^\'\"]*job[^\'\"]*[\'\"][^>]*>.*?</div>', html, re.I | re.S)
    if job_cards:
        print(f"Found {len(job_cards)} job cards. Snippet of first:")
        print(job_cards[0][:500])
    elif "{" in html[:10] or "[" in html[:10]: # maybe JSON?
        print("Response is JSON!")
        print(html[:500])
    else:
        print("HTML Snippet returned (first 1000 chars):")
        print(html[:1000])
        print("HTML Snippet returned (last 1000 chars):")
        print(html[-1000:])
except Exception as e:
    print(f"Error fetching JobRoom: {e}")
