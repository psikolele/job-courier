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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.jobcourier.ch/'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs = [];

    $('.singleResult').each((i, el) => {
      if (i >= 6) return; // Limit to 6 latest jobs for the slider

      const $el = $(el);
      const title = $el.find('h3').text().trim();
      const link = $el.find('h3').closest('a').attr('href');
      const company = $el.find('.companyLink').text().trim();
      
      // Extract from text nodes for Sede, Settore, Ruolo
      const fullText = $el.text();
      const locationMatch = fullText.match(/Sede:\s*([\s\S]*?)\s*-\s*/);
      const sectorMatch = fullText.match(/Settore:\s*([\s\S]*?)\s*(Ruolo:|Per |$)/);
      const roleMatch = fullText.match(/Ruolo:\s*([\s\S]*?)\s*(Per |$)/);

      jobs.push({
        id: i,
        title,
        link: link ? (link.startsWith('http') ? link : `https://jobroom.jobcourier.ch${link}`) : '#',
        company: {
          name: company || 'Azienda Riservata',
          domain: company ? company.toLowerCase().replace(/\s+/g, '') + '.ch' : 'jobcourier.ch'
        },
        location: locationMatch ? locationMatch[1].trim() : 'Svizzera',
        sector: sectorMatch ? sectorMatch[1].trim() : 'General',
        role: roleMatch ? roleMatch[1].trim() : 'Incarico',
        // Mock image as we don't have it in the feed, using architectural/construction themes
        image: `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop&sig=${i}`
      });
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
