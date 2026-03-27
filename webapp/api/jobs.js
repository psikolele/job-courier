import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    // This is the Vercel Serverless Function to bypass CORS and SSR HTML restriction
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

    try {
        const targetUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&role=logistica-2fmagazzino&role_id=224&source=https%3A%2F%2Fwww.jobcourier.ch%2F';
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const jobs = [];
        $('.dataContainer.inline').slice(0, 4).each((i, el) => {
            const $el = $(el);
            const title = $el.find('h3').text().trim();
            const link = $el.find('a').first().attr('href') || '#';
            const detailsText = $el.find('.detailsHead').text();
            
            // Clean up details
            const locationMatch = detailsText.match(/Sede:\s*([^-]+)/i);
            const sectorMatch = detailsText.match(/Settore:\s*([^\n]+)/i);
            const companyMatch = $el.find('.companyLink span').text().trim();
            
            jobs.push({
                id: i,
                title: title,
                location: locationMatch ? locationMatch[1].trim() : 'Svizzera',
                sector: sectorMatch ? sectorMatch[1].trim() : 'Generale',
                company: companyMatch || 'Azienda Riservata',
                link: link.replace('../', 'https://jobroom.jobcourier.ch/')
            });
        });

        // Se lo scraping fallisce (bot detection), forniamo dei mock realistici per la UI
        if(jobs.length === 0) {
            return res.status(200).json([
                { id: 1, title: 'Specialista in Logistica e Supply Chain', location: 'Svizzera, Milano, Zurigo', sector: 'Trasporti e logistica', company: 'Global Transport SA', link: '#' },
                { id: 2, title: 'Magazziniere Carrellista', location: 'Canton Ticino, Lugano', sector: 'Logistica', company: 'LogiSwiss SA', link: '#' },
                { id: 3, title: 'Responsabile Magazzino (100%)', location: 'Berno, Svizzera', sector: 'Logistica E-commerce', company: 'TechSwiss Distribution', link: '#' }
            ]);
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error("API Jobs Error:", error);
        res.status(500).json({ error: 'Failed to scrape jobs from jobroom' });
    }
}
