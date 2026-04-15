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
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.jobcourier.ch/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs = [];

    $('.singleResult').each((i, el) => {
      if (i >= 8) return; // Fetch a few more to have enough for both sections

      const $el = $(el);
      
      // Selectors based on live inspection
      const titleLink = $el.find('.details .dataContainer a[href*="view-job.php"]');
      const title = titleLink.text().trim() || $el.find('h3').text().trim();
      
      let relativeLink = titleLink.attr('href') || $el.find('a').first().attr('href');
      // Resolve relative path (removing ../ if present)
      if (relativeLink && relativeLink.startsWith('..')) {
        relativeLink = relativeLink.substring(2);
      }
      const absoluteLink = relativeLink ? (relativeLink.startsWith('http') ? relativeLink : `https://jobroom.jobcourier.ch/job/${relativeLink.startsWith('/') ? relativeLink.substring(1) : relativeLink}`) : '#';

      const companyName = $el.find('.companyLink span').text().trim() || 'Azienda Riservata';
      
      let logoUrl = $el.find('img.companyImg').attr('src');
      if (logoUrl && logoUrl.startsWith('..')) {
        logoUrl = logoUrl.substring(2);
      }
      const absoluteLogo = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `https://jobroom.jobcourier.ch/job/${logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl}`) : '';

      // Extract Sede (Location)
      const location = $el.find('.detailsHead label:contains("Sede:")').next('span').text().trim() || 'Svizzera';
      
      // Extract Settore (Sector)
      const sector = $el.find('.detailsHead label:contains("Settore:")').next('span').text().trim() || 'Generale';

      // Extract Ruolo (Role)
      const role = $el.find('.detailsHead label:contains("Ruolo:")').next('span').text().trim() || 'Professional';

      // Extract Description
      const description = $el.find('.detailsData .descriptionContainer p').text().trim() || '';

      jobs.push({
        id: i,
        title,
        link: absoluteLink,
        description,
        company: {
          name: companyName,
          logo: absoluteLogo,
          domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch' // Fallback domain for favicon
        },
        location,
        sector,
        role,
        image: `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop&sig=${i}`
      });
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
