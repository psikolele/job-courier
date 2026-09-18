import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLocalizedPath from '../hooks/useLocalizedPath';

// 15 was the length of the old hardcoded list, and it silently truncated the real one:
// 16 employers are hiring as of 07.08, so the cap alone dropped the last one alphabetically
// (Work Selection AG) right after the roster fix had gone to the trouble of finding it.
// 20 leaves headroom and fills whole rows at the 2- and 4- and 5-column breakpoints.
const MAX_TILES = 20;

const Vetrini = () => {
    const lp = useLocalizedPath();
    const { t } = useTranslation();

    // The showcase was a hardcoded list of fifteen employers, written before the Arca24
    // migration and never revisited. By August it showed six who had no open position and
    // left out Adecco and Gi Group, both hiring — a wall of logos that says "these are the
    // companies on JobCourier" while contradicting the offers page. It now reads the live
    // roster and keeps only employers with something to apply to.
    //
    // The link stays on our own company page rather than going out to the portal, which
    // answers 404 for an employer between openings. Its old `employer/view-company.php`
    // links were worse still: Arca24 serves those as `localStorage.clear();
    // location.reload(true)` — an endless reload loop.
    const [companies, setCompanies] = useState([]);
    const [failedLogos, setFailedLogos] = useState({});

    // Mirrors the grid's own grid-cols-2/3/4/5 breakpoints (Tailwind's default
    // sm/md/lg) so the CTA tile below can span exactly the columns the last row
    // has left, at whatever width the browser currently is.
    const [cols, setCols] = useState(() =>
        typeof window === 'undefined' ? 5
            : window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2
    );
    useEffect(() => {
        const compute = () => {
            const w = window.innerWidth;
            setCols(w >= 1024 ? 5 : w >= 768 ? 4 : w >= 640 ? 3 : 2);
        };
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);

    // Sharing a row with real tiles gives the CTA the exact same stretched height
    // for free (grid's own align-items: stretch), no measuring needed. But when the
    // roster count divides evenly into the current column count, the CTA lands
    // alone in a fresh row with no tile to stretch to match — its own text-and-arrow
    // content would size that row to a fraction of the others'. Measuring an actual
    // tile and applying it as an explicit height covers that one case.
    const firstTileRef = useRef(null);
    const [tileHeight, setTileHeight] = useState(null);
    useEffect(() => {
        const el = firstTileRef.current;
        if (!el) return;
        const measure = () => setTileHeight(el.getBoundingClientRect().height);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [companies]);

    // One request, and only employers with open positions are painted.
    //
    // This used to load in two phases: paint the plain roster immediately, then narrow it
    // to who is hiring when the slower `withJobs` answer arrived, keeping the roster if it
    // never did. That fallback is what the client saw. Whenever the second call was slow,
    // failed, or was swallowed by a preview gate, the unfiltered roster stayed on screen —
    // which is how Betacom, Blackpoints, Arca24.com, ated and Banca Credinvest, none of
    // them with a single open position, ended up in a wall of logos that claims to be the
    // companies hiring on JobCourier. A hole below the fold for a second is cheaper than
    // advertising employers who have nothing to apply to, so the roster phase is gone.
    //
    // One shot was not enough. The endpoint walks the portal and probes every employer, so
    // a cold instance can answer slowly, fail, or come back with nobody flagged as hiring —
    // and a single attempt turns any of those into a section that stays hidden for the whole
    // page view. Retrying costs nothing when the first answer is good (it is not sent) and
    // is the difference between a hole and a showcase when it is not.
    useEffect(() => {
        let cancelled = false;
        const timers = [];

        const attempt = (n) => {
            fetch('/api/companies?withJobs=1')
                .then((res) => (res.ok ? res.json() : null))
                .then((list) => {
                    if (cancelled) return;
                    // Strictly true: `null` means the probe failed, and a tile that opens on
                    // "nessuna offerta attiva" is what this section was fixed to stop showing.
                    const hiring = Array.isArray(list) ? list.filter((c) => c.has_jobs === true) : [];
                    if (hiring.length === 0) { retry(n); return; }
                    setCompanies(hiring.slice(0, MAX_TILES).map((c) => ({ ...c, link: `/azienda/${c.id}` })));
                })
                .catch(() => retry(n));
        };

        // Spaced out enough for the degraded answer's own 30s edge cache to expire between
        // tries, so the second and third attempts can reach a fresh run rather than re-read
        // the same empty one.
        const DELAYS_MS = [4000, 35000];
        const retry = (n) => {
            if (cancelled || n >= DELAYS_MS.length) return;
            timers.push(setTimeout(() => attempt(n + 1), DELAYS_MS[n]));
        };

        attempt(0);

        return () => { cancelled = true; timers.forEach(clearTimeout); };
    }, []);

    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GL = 'var(--brand-gray-light)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    // Nothing to show yet, or the roster came back empty: no heading over an empty grid.
    if (companies.length === 0) return null;

    return (
        <section className="py-16 md:py-20 px-6 md:px-12 w-full" id="vetrini" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto w-full">
                {/* Header Sezione Aziende Partner */}
                <div className="mb-8 md:mb-10 text-left">
                    <div className="flex items-center gap-3">
                        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                        <span style={{
                            fontFamily: brand,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: F
                        }}>
                            {t('showcase.label')}
                        </span>
                    </div>
                    <h2 style={{
                        fontFamily: editorial,
                        fontStyle: 'italic',
                        fontSize: 'clamp(24px, 3.5vw, 36px)',
                        color: N,
                        lineHeight: 1.2,
                        marginTop: 8
                    }}>
                        {t('showcase.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                    {companies.map((company, idx) => (
                        <motion.div
                            key={idx}
                            ref={idx === 0 ? firstTileRef : undefined}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <Link
                                to={company.link}
                                // Hand the name and logo to the detail page so its header
                                // is real while the portal answers.
                                state={{ name: company.name, logo: company.logo }}
                                className="group relative aspect-square flex flex-col items-center justify-center p-6 transition-colors duration-200 hover:bg-[var(--brand-gray-light)]"
                                style={{ background: '#FFFFFF', borderRadius: 0 }}
                            >
                            <div className="w-full h-full flex items-center justify-center mb-2">
                                {/* Five of the roster's employers have no logo on the portal;
                                    the name carries the tile for those. */}
                                {failedLogos[company.id] || !company.logo ? (
                                    <span style={{
                                        fontFamily: brand, fontWeight: 700, fontSize: 13,
                                        color: GM, textAlign: 'center', textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                    }}>{company.name}</span>
                                ) : (
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        onError={() => setFailedLogos((f) => ({ ...f, [company.id]: true }))}
                                        className="max-w-full max-h-[70%] object-contain transition-all duration-300 mix-blend-multiply grayscale group-hover:grayscale-0"
                                    />
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 6, height: 6, background: F, display: 'inline-block' }} />
                                <span style={{
                                    fontFamily: body,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: GM
                                }}>
                                    {t('showcase.see_jobs')}
                                </span>
                            </div>
                            </Link>
                        </motion.div>
                    ))}
                    {/* Always the last tile: turns an incomplete final row (a lone logo
                        the grid can't help but leave stranded, since the roster count
                        changes daily and never lines up with every breakpoint's column
                        count) into a deliberate CTA instead of an accident. Spans
                        exactly the columns the last row has left — a full row of its
                        own when the count divides evenly.

                        Two different shapes depending on which of those it is (client,
                        18/09): sharing a row with real tiles, it inherits their grid-
                        stretched height like any other cell here — no explicit height
                        needed, grid does that for free. Alone across the full row it
                        used to ALSO match the square tiles' height (a talker box the
                        client found oversized and inelegant for a single line of text);
                        now it gets its own short fixed height instead. */}
                    <motion.div
                        key="cta"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -3 }}
                        transition={{ delay: companies.length * 0.03 }}
                        style={{
                            gridColumn: `span ${cols - (companies.length % cols)}`,
                            ...(companies.length % cols === 0 ? { height: 72 } : {})
                        }}
                    >
                        <Link
                            to={lp("/aziende-che-assumono")}
                            className="group relative flex flex-row items-center justify-center gap-3 w-full h-full p-6 transition-shadow duration-300 ease-out shadow-[0_0_0_rgba(5,11,43,0)] hover:shadow-[0_16px_28px_-12px_rgba(5,11,43,0.45)]"
                            style={{ background: N }}
                        >
                            {/* color lives in className, not style: an inline `color` would
                                out-specificity `group-hover:text-[...]` no matter what, and
                                the hover would silently never fire. */}
                            <span
                                className="text-white transition-colors duration-300 group-hover:text-[var(--brand-fuchsia)]"
                                style={{
                                    fontFamily: brand,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                }}>
                                {t('showcase.see_all')}
                            </span>
                            <span
                                className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                                style={{ color: F, fontSize: 18, lineHeight: 1 }}
                            >→</span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Vetrini;
