import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Impostiamo l'header per simulare un browser reale
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  try {
      console.log("Navigando verso JobRoom...");
      await page.goto('https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php', { waitUntil: 'networkidle2' });
      
      const regions = await page.evaluate(() => {
          const select = document.querySelector('select[name="region"]');
          if (!select) return null;
          return Array.from(select.querySelectorAll('option')).map(o => ({ value: o.value, text: o.textContent.trim() }));
      });
      
      if (regions) {
          console.log("=== REGIONS ===");
          regions.forEach(r => {
             if(r.value) console.log(`${r.value}: ${r.text}`);
          });
      } else {
          console.log("Variabile select non trovata.");
      }
      
  } catch (error) {
      console.error(error);
  } finally {
      await browser.close();
  }
})();
