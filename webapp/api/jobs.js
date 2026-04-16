import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const jobUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&source=https%3A%2F%2Fwww.jobcourier.ch%2F';

  try {
    const response = await fetch(jobUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Referer': 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudflare or JobRoom blocked the request: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs = [];

    // The selector .vacancies .vacancy might vary, using a more inclusive one
    $('.vacancies .vacancy, .job-listing, tr.job-item, .singleResult').each((i, el) => {
      if (jobs.length >= 12) return;

      const $el = $(el);
      
      // Selectors based on live inspection - looking for the EXACT job link
      let titleLink = $el.find('a[href*="view-job.php"]').first();
      if (titleLink.length === 0) {
        titleLink = $el.find('.details .dataContainer a').first();
      }
      
      const title = titleLink.text().trim() || $el.find('h3').text().trim() || 'Titolo non disponibile';
      if (title === 'Titolo non disponibile' && titleLink.length === 0) return; // Skip empty rows

      let relativeLink = titleLink.attr('href');
      if (!relativeLink) {
        relativeLink = $el.find('a').first().attr('href');
      }
      
      // Resolve relative path
      if (relativeLink && relativeLink.startsWith('..')) {
        relativeLink = relativeLink.substring(2);
      }
      const absoluteLink = relativeLink ? 
        (relativeLink.startsWith('http') ? relativeLink : `https://jobroom.jobcourier.ch/job/${relativeLink.startsWith('/') ? relativeLink.substring(1) : relativeLink}`) 
        : 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1';

      const companyName = $el.find('.company, .firm, .details span:first-child, .companyLink span').first().text().trim() || 'Azienda Riservata';
      const location = $el.find('.location, .place, .details span:last-child, .detailsHead label:contains("Sede:")').next('span').text().trim() || 'Svizzera';
      
      // LOGO EXTRACTION: Look for JobRoom's specific logo containers
      let logoUrl = $el.find('img.companyImg, img.companyLogo, .moreDataContainer img').attr('src');
      
      // If not found in the list item, we could have a hidden one or need to resolve the path
      if (!logoUrl) {
        logoUrl = $el.find('.detailsHead img').attr('src');
      }

      let absoluteLogo = '';
      if (logoUrl) {
        // Resolve relative path
        if (logoUrl.startsWith('..')) {
          logoUrl = logoUrl.substring(2);
        }
        absoluteLogo = logoUrl.startsWith('http') ? logoUrl : `https://jobroom.jobcourier.ch/job/${logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl}`;
      } else {
        // Fallback to favicon if JobRoom doesn't provide a logo for this specific ad
        let domain = 'jobcourier.ch';
        if (companyName.toLowerCase().includes('randstad')) domain = 'randstad.ch';
        if (companyName.toLowerCase().includes('adecco')) domain = 'adecco.ch';
        if (companyName.toLowerCase().includes('manpower')) domain = 'manpower.ch';
        if (companyName.toLowerCase().includes('gi group')) domain = 'gigroup.com';
        absoluteLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      }

      jobs.push({
        id: i,
        title,
        link: absoluteLink,
        company: {
          name: companyName,
          logo: absoluteLogo,
          domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch'
        },
        location,
        image: `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop&sig=${i}`
      });
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
