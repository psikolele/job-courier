import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log("🚀 Avvio scraping Jobs...");
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: 'new'
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const targetUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&utm_source=homepage';
        
        console.log("Navigazione in corso...");
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Aspetta che il JS faccia il reload e mostri i job reali (aspettiamo l'apparizione del container)
        try {
            await page.waitForSelector('.dataContainer.inline', { timeout: 10000 });
        } catch (e) {
            console.log("Timeout in attesa dei container: il redirect potrebbe non essere fuzionato o ci sono 0 job.");
        }
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const jobs = [];
        $('.dataContainer.inline').slice(0, 12).each((i, el) => {
            const $el = $(el);
            const title = $el.find('h3').text().trim();
            const link = $el.find('a').first().attr('href') || '#';
            const detailsText = $el.find('.detailsHead').text();
            
            // Clean up details
            const locationMatch = detailsText.match(/Sede:\s*([^-]+)/i);
            const sectorMatch = detailsText.match(/Settore:\s*([^\n]+)/i);
            const companyMatch = $el.find('.companyLink span').text().trim();
            
            if (title) {
                jobs.push({
                    id: i,
                    title: title,
                    location: locationMatch ? locationMatch[1].trim() : 'Svizzera',
                    sector: sectorMatch ? sectorMatch[1].trim() : 'Generale',
                    company: companyMatch || 'Azienda Riservata',
                    link: link.replace('../', 'https://jobroom.jobcourier.ch/job/')
                });
            }
        });

        console.log(`✅ Estratti ${jobs.length} annunci reali.`);
        
        if (jobs.length > 0) {
            // Seleziona la cartella di output (nel runner CI sarà './output')
            const outDir = path.join(__dirname, '..', 'output');
            await fs.mkdir(outDir, { recursive: true });
            
            const outFile = path.join(outDir, 'latest_jobs.json');
            await fs.writeFile(outFile, JSON.stringify(jobs, null, 2));
            console.log(`💾 Salvato in ${outFile}`);
        } else {
            console.error("❌ Nessun job estratto. Impossibile sovrascrivere i dai con lista vuota.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Errore durante lo scraping:", error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

run();
