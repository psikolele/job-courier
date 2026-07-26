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
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).json({ error: 'Missing job ID parameter' });
    return;
  }

  try {
    // 1. Fetch a latest-and-all-job-ads.php per estrarre i cookie di sessione reali del server
    const sessionUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?language=it&country=214&source=https%3A%2F%2Fwww.jobcourier.ch%2F';
    const sessionHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    let cookiesStr = '';
    try {
      const sessionResponse = await fetch(sessionUrl, { headers: sessionHeaders });
      const setCookieHeader = sessionResponse.headers.get('set-cookie') || '';
      const rawCookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_]+=)/) || [];
      cookiesStr = rawCookies.map(cookie => cookie.trim().split(';')[0]).join('; ');
    } catch (sessionErr) {
      console.warn('Session cookie fetch failed:', sessionErr.message);
    }

    // 2. Fetch a view-job.php passando i cookie estratti e il parametro source non vuoto
    const jobUrl = `https://jobroom.jobcourier.ch/job/view-job.php?id=${id}&lan=it&source=https%3A%2F%2Fwww.jobcourier.ch%2F`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php',
    };

    if (cookiesStr) {
      headers['Cookie'] = cookiesStr;
    }

    const response = await fetch(jobUrl, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch job details from JobRoom: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ESTRAZIONE DATI PRINCIPALI CON SELETTORI SEMANTICI
    const title = $('h1[itemprop="title"], .detailsHead h1, h1, .title, .job-title').first().text().replace(/\s+/g, ' ').trim() || 'Titolo Annuncio';
    
    const companyName = $('span[itemprop="name"], .companyLink h2, .companyLink span, .company, .firm').first().text().replace(/\s+/g, ' ').trim() || 
                        $('.company, .firm, .detailsHead label:contains("Azienda:")').next('span').text().trim() || 
                        'Azienda Riservata';
    
    // Estrazione potenziata del luogo completo (es. Svizzera, Ticino, Bellinzona)
    let location = '';
    const addressBlock = $('h2[itemprop="address"], div[itemprop="jobLocation"] h2').first();
    if (addressBlock.length > 0) {
      location = addressBlock.text().replace(/\s+/g, ' ').trim();
    } else {
      const labelSede = $('.detailsHead label:contains("Sede:"), div:contains("Sede:") label');
      if (labelSede.length > 0) {
        const parentDiv = labelSede.parent();
        const clone = parentDiv.clone();
        clone.find('label, span.glyphicon').remove();
        location = clone.text().replace(/\s+/g, ' ').trim().replace(/^[,\s-]+/, '').trim();
      }
    }
    if (!location) {
      location = $('span[itemprop="addressLocality"], .location, .place').first().text().replace(/\s+/g, ' ').trim() || 'Svizzera';
    }
    
    const sector = $('h2[itemprop="industry"], .sector, .category').first().text().replace(/\s+/g, ' ').trim() || 
                   $('.sector, .category, .detailsHead label:contains("Settore:")').next('span').text().trim() || 
                   'Non specificato';
    
    const role = $('h2[itemprop="occupationalCategory"], .role').first().text().replace(/\s+/g, ' ').trim() || 
                 $('.role, .detailsHead label:contains("Ruolo:")').next('span').text().trim() || 
                 'Non specificato';
    
    // Dettagli contrattuali aggiuntivi
    const duration = $('.detailsHead label:contains("Durata:")').next('span').text().trim() || '';
    const percentage = $('.detailsHead label:contains("Impiego:")').next('span').text().trim() || '';
    const entryDate = $('.detailsHead label:contains("Entrata:")').next('span').text().trim() || '';

    // ESTRAZIONE LOGO AZIENDA
    let logoUrl = $('.companyLogo, .detailsHead img, img.companyImg, img.companyLogo, .moreDataContainer img').first().attr('src');
    let absoluteLogo = '';
    if (logoUrl) {
      if (logoUrl.startsWith('..')) {
        logoUrl = logoUrl.substring(2);
      }
      absoluteLogo = logoUrl.startsWith('http') ? logoUrl : `https://jobroom.jobcourier.ch/job/${logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl}`;
    } else {
      let domain = 'jobcourier.ch';
      if (companyName.toLowerCase().includes('randstad')) domain = 'randstad.ch';
      if (companyName.toLowerCase().includes('adecco')) domain = 'adecco.ch';
      if (companyName.toLowerCase().includes('manpower')) domain = 'manpower.ch';
      if (companyName.toLowerCase().includes('gi group')) domain = 'gigroup.com';
      absoluteLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    // ESTRAZIONE DESCRIZIONE ESTESA (JOB DESCRIPTION)
    let descriptionHtml = '';
    const descContainer = $('div[itemprop="description"], .jobDescription, .vacancy-description, .description, .moreDataContainer, .dataContainer').first();
    
    if (descContainer.length > 0) {
      // Rimuoviamo elementi non necessari o bottoni, incluso il widget di compatibilità
      descContainer.find('button, script, style, a[href*="login"], .social-share, #compVerify, .thenApply').remove();
      descriptionHtml = descContainer.html().trim();
    } else {
      // Fallback: se non c'è un container specifico, prendiamo il blocco centrale del contenuto principale
      const mainContent = $('#content, .content, main').first();
      if (mainContent.length > 0) {
        mainContent.find('header, footer, nav, script, style').remove();
        descriptionHtml = mainContent.html().trim();
      } else {
        // Ultimo fallback: cerchiamo di prendere un div generico che contenga del testo lungo
        $('div').each((i, el) => {
          const textLength = $(el).text().trim().length;
          if (textLength > 600 && !$(el).find('header, footer, nav').length) {
            descriptionHtml = $(el).html().trim();
            return false; // Break
          }
        });
      }
    }

    if (!descriptionHtml || descriptionHtml.includes('localStorage.clear') || descriptionHtml.includes('window.location.reload')) {
      descriptionHtml = '<p>La descrizione dettagliata per questa offerta di lavoro è consultabile premendo il tasto "Candidati ora".</p>';
    }

    // RILEVAMENTO REDIRECT E CANDIDATURA ESTERNA
    let redirect = false;
    let external_url = null;
    
    const externalAnchor = $('a[href*="externalLink.php"]').first();
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

    // Link originale di candidatura diretta per gli annunci interni
    const apply_url = `https://jobroom.jobcourier.ch/job/view-job.php?id=${id}&language=it&lan=it`;

    res.status(200).json({
      id,
      title,
      company: {
        name: companyName,
        logo: absoluteLogo,
      },
      location,
      sector,
      role,
      details: {
        duration,
        percentage,
        entryDate
      },
      description: descriptionHtml,
      apply_url,
      redirect,
      external_url,
      original_link: jobUrl
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch job details data', details: error.message });
  }
}
