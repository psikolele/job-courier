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

  const url = new URL('https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php');
  url.searchParams.set('language', 'it');
  url.searchParams.set('country', '214');
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
        url.searchParams.set(key, req.query[key]);
    });
  }
  
  const jobUrl = url.toString();
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
      
      // Resolve link logic: robustly handle relative and absolute paths
      let absoluteLink = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1';
      
      if (relativeLink) {
        // Remove leading dots or slashes for consistent processing
        let cleanPath = relativeLink.replace(/^(\.\.\/|\.\/|\/)/, '');
        
        // If the path already starts with 'job/', don't prepend another 'job/'
        if (cleanPath.startsWith('job/')) {
          absoluteLink = `https://jobroom.jobcourier.ch/${cleanPath}`;
        } else if (cleanPath.startsWith('http')) {
          absoluteLink = cleanPath;
        } else {
          absoluteLink = `https://jobroom.jobcourier.ch/job/${cleanPath}`;
        }
      }

      // Ensure Italian language parameters are correctly set and not duplicated
      if (!absoluteLink.includes('language=')) {
        const separator = absoluteLink.includes('?') ? '&' : '?';
        absoluteLink += `${separator}lan=it&language=it`;
      } else {
        // Force replace any language param with Italian to be sure
        absoluteLink = absoluteLink.replace(/language=[a-z]{2}/, 'language=it').replace(/lan=[a-z]{2}/, 'lan=it');
        if (!absoluteLink.includes('lan=it')) absoluteLink += '&lan=it';
      }

      const companyName = $el.find('.company, .firm, .details span:first-child, .companyLink span').first().text().trim() || 'Azienda Riservata';
      
      // Estrazione potenziata del luogo completo (es. Svizzera, Ticino, Bellinzona)
      let location = '';
      const labelSede = $el.find('.detailsHead label:contains("Sede:")');
      if (labelSede.length > 0) {
        const parentSpan = labelSede.parent();
        const clone = parentSpan.clone();
        clone.find('label').remove();
        location = clone.text().replace(/\s+/g, ' ').trim().replace(/^[,\s-]+/, '').trim();
      }
      if (!location) {
        location = $el.find('.location, .place, .details span:last-child').first().text().trim() || 'Svizzera';
      }
      
      // SECTOR & ROLE EXTRACTION
      let sector = $el.find('.sector, .category, .details span:contains("Settore"), .detailsHead label:contains("Settore:")').next('span').text().trim();
      if (!sector) {
          const text = $el.text().toLowerCase();
          if (text.includes('trasporti')) sector = 'Trasporti';
          else if (text.includes('logistica')) sector = 'Logistica';
          else if (text.includes('amministrazione')) sector = 'Amministrazione';
          else if (text.includes('vendita')) sector = 'Vendita';
          else sector = 'Non specificato';
      }

      let role = $el.find('.role, .details span:contains("Ruolo"), .detailsHead label:contains("Ruolo:")').next('span').text().trim();
      if (!role) role = 'Non specificato';

      // ─── REDIRECT DETECTION (meeting 2026-05-20) ───
      // Look for externalLink.php anchors on listing row → indicates external ATS (Randstad, GiGroup, etc.)
      let redirect = false;
      let external_url = null;
      const externalAnchor = $el.find('a[href*="externalLink.php"]').first();
      if (externalAnchor.length > 0) {
        const externalHref = externalAnchor.attr('href') || '';
        try {
          const u = new URL(externalHref, 'https://jobroom.jobcourier.ch/job/');
          const target = u.searchParams.get('redirect');
          if (target) {
            redirect = true;
            external_url = decodeURIComponent(target);
          }
        } catch (e) {
          redirect = false;
        }
      }

      // Default apply URL → JobRoom view-job page (internal flow is now direct as requested)
      const jobIdMatch = absoluteLink.match(/[?&]id=([^&]+)/) || absoluteLink.match(/view-job\.php\?id=([^&]+)/);
      const jobRoomId = jobIdMatch ? jobIdMatch[1] : null;
      const apply_url = absoluteLink;

      // Published date — try common selectors, else today as fallback
      let published_at = $el.find('.publishedDate, .date, time, .details .data').first().text().trim();
      if (!published_at) {
        const dateMatch = $el.text().match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
        published_at = dateMatch ? dateMatch[1] : null;
      }

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
        jobroom_id: jobRoomId,
        title,
        link: absoluteLink,
        apply_url,
        redirect,
        external_url,
        published_at,
        sector,
        role,
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
