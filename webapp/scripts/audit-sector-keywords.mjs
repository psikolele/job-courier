// Coverage report for src/utils/jobTaxonomy.js against live job titles.
//
// Arca24's list scrape never carries real sector/role (see api/_arca24.js), so job
// cards guess both from the title via keyword regex. That regex can't reach 100%
// coverage — synonyms and ambiguous abbreviations keep showing up in new ads — so
// this script is the review loop: it fetches live titles, runs them through the
// exact same rules the site uses, and reports which ones still fall through to
// "Altro/Altro" plus the most common words among them, so a human can decide which
// ones are worth adding to jobTaxonomy.js.
//
// Usage: npm run audit:keywords
// Scheduled weekly by .github/workflows/keyword-coverage-report.yml, which opens a
// PR with the refreshed report for review — it never edits jobTaxonomy.js itself.

import { fetchJobs } from '../api/_arca24.js';
import { deriveSector, deriveRoleFromTitle } from '../src/utils/jobTaxonomy.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, '..', 'docs', 'keyword-coverage-report.md');
const STOPWORDS = new Set([
    'cdi', 'für', 'und', 'oder', 'avec', 'dans', 'pour', 'della', 'delle', 'degli',
    'con', 'per', 'una', 'temporaire', 'temporaires', 'missions', 'region', 'einsatz',
]);

async function main() {
    const jobs = await fetchJobs({ pages: 20, maxJobs: 600 });
    if (jobs.length < 100) {
        console.error(`Solo ${jobs.length} offerte lette — feed probabilmente degradato, report non generato.`);
        process.exit(1);
    }

    const uncovered = [];
    for (const job of jobs) {
        const sector = deriveSector(job.title, job.sector);
        const role = deriveRoleFromTitle(job.title);
        if (!sector && !role) uncovered.push(job.title);
    }

    const wordFreq = new Map();
    for (const title of uncovered) {
        const words = title
            .toLowerCase()
            .replace(/[/(),.\-?%]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 3 && !/^\d+$/.test(w) && !STOPWORDS.has(w));
        const seen = new Set();
        for (const w of words) {
            if (seen.has(w)) continue;
            seen.add(w);
            wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
        }
    }
    const topWords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 40);

    const coveragePct = (((jobs.length - uncovered.length) / jobs.length) * 100).toFixed(1);
    const today = new Date().toISOString().slice(0, 10);

    const lines = [
        '# Copertura keyword settore/ruolo',
        '',
        `Generato automaticamente da \`npm run audit:keywords\` — ultimo run: ${today}.`,
        '',
        `**${jobs.length} offerte lette, ${uncovered.length} ancora "Altro/Altro" (copertura ${coveragePct}%).**`,
        '',
        'Non aggiungere queste parole a occhio: alcune sono sigle ambigue (es. "MPA", "CDI")',
        'o termini troppo generici per un settore/ruolo affidabile. Verificare il senso prima',
        `di estenderle in \`src/utils/jobTaxonomy.js\`.`,
        '',
        '## Parole più frequenti tra i titoli non coperti',
        '',
        '| Parola | Occorrenze |',
        '|---|---|',
        ...topWords.map(([w, c]) => `| ${w} | ${c} |`),
        '',
        '## Esempio di titoli non coperti (max 40)',
        '',
        ...uncovered.slice(0, 40).map((t) => `- ${t}`),
        '',
    ];

    writeFileSync(REPORT_PATH, lines.join('\n'));
    console.log(`Report scritto in ${REPORT_PATH} — copertura ${coveragePct}% (${uncovered.length}/${jobs.length} non coperti).`);
}

main().catch((err) => {
    console.error('Audit fallito:', err);
    process.exit(1);
});
