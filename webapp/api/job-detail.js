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

  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing job ID parameter' });
    return;
  }

  const jobUrl = `https://jobroom.jobcourier.ch/job/view-job.php?id=${id}&lan=it&language=it`;

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
      throw new Error(`Failed to fetch job details from JobRoom: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ESTRAZIONE DATI PRINCIPALI
    const title = $('.detailsHead h1, h1, .job-title').first().text().trim() || 'Titolo Annuncio';
    const companyName = $('.company, .firm, .detailsHead label:contains("Azienda:")').next('span').text().trim() || 
                        $('.companyLink span, .detailsHead img').prev('span').text().trim() || 
                        'Azienda Riservata';
    
    const location = $('.location, .place, .detailsHead label:contains("Sede:")').next('span').text().trim() || 'Svizzera';
    const sector = $('.sector, .category, .detailsHead label:contains("Settore:")').next('span').text().trim() || 'Non specificato';
    const role = $('.role, .detailsHead label:contains("Ruolo:")').next('span').text().trim() || 'Non specificato';
    
    // Dettagli contrattuali aggiuntivi
    const duration = $('.detailsHead label:contains("Durata:")').next('span').text().trim() || '';
    const percentage = $('.detailsHead label:contains("Impiego:")').next('span').text().trim() || '';
    const entryDate = $('.detailsHead label:contains("Entrata:")').next('span').text().trim() || '';

    // ESTRAZIONE LOGO AZIENDA
    let logoUrl = $('.detailsHead img, img.companyImg, img.companyLogo, .moreDataContainer img').first().attr('src');
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
    // Cerchiamo i container di descrizione comuni su JobRoom
    let descriptionHtml = '';
    const descContainer = $('.jobDescription, .vacancy-description, .description, .moreDataContainer, .dataContainer').first();
    
    if (descContainer.length > 0) {
      // Rimuoviamo elementi non necessari o bottoni
      descContainer.find('button, script, style, a[href*="login"], .social-share').remove();
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

    if (!descriptionHtml) {
      descriptionHtml = '<p>La descrizione dettagliata per questa offerta di lavoro è consultabile premendo il tasto "Candidati ora".</p>';
    }

    // Link esterno per la candidatura
    const apply_url = `https://jobroom.jobcourier.ch/job-seekers-login.php?job_post_id=${id}&skipAn24=1&lan=it&language=it`;

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
      original_link: jobUrl
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Failed to fetch job details data', details: error.message });
  }
}
