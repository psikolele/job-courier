import * as cheerio from 'cheerio';

async function testFetch() {
  const targetUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&role=logistica-2fmagazzino&role_id=224';
  
  try {
    // Add realistic headers
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const jobs = [];
    $('.dataContainer.inline').slice(0, 4).each((i, el) => {
      const $el = $(el);
      const title = $el.find('h3').text().trim();
      const link = $el.find('a').first().attr('href');
      
      const details = $el.find('.detailsHead').text();
      // estrae sede e azienda
      // Sede: Svizzera... - Azienda
      
      jobs.push({ title, link, rawDetails: details.trim() });
    });
    
    console.log("Jobs found:", jobs.length);
    console.log(JSON.stringify(jobs, null, 2));
    
    if (jobs.length === 0) {
        // Fallback: print what we got
        console.log("HTML snippet:");
        console.log(html.substring(0, 500));
    }
  } catch(e) {
    console.error("Fetch error:", e);
  }
}

testFetch();
