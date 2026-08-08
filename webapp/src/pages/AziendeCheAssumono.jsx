import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SectionLabel from '../components/ui/SectionLabel.jsx';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

// jobroom serves a shared placeholder image for companies without a logo — show the name instead.
const hasRealLogo = (logo) => Boolean(logo) && !/genericLogo/i.test(logo);

// Case- and accent-insensitive normalization for client-side name search.
const normalize = (str) =>
    (str || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

const AziendeCheAssumono = () => {
    const { t } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/companies');
                if (!res.ok) throw new Error('Impossibile recuperare le aziende');
                const data = await res.json();
                setCompanies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filtered = useMemo(() => {
        const q = normalize(query);
        if (!q) return companies;
        return companies.filter((c) => normalize(c.name).includes(q));
    }, [companies, query]);

    return (
        <div className="pt-24 min-h-screen" style={{ background: '#FFFFFF' }}>
            <Helmet>
                <title>{t('companies_list.meta_title')}</title>
                <meta
                    name="description"
                    content="Scopri le aziende con un profilo attivo su JobCourier e trova quelle che stanno cercando personale in Svizzera."
                />
                {/* main.jsx strips index.html's generic Open Graph set once the app boots. */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={t('companies_list.meta_title')} />
                <meta
                    property="og:description"
                    content="Scopri le aziende con un profilo attivo su JobCourier e trova quelle che stanno cercando personale in Svizzera."
                />
                <meta property="og:image" content="https://www.jobcourier.ch/logo-square.png" />
            </Helmet>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-16">
                {/* Header */}
                <div className="mb-10 md:mb-12 text-left max-w-3xl">
                    <SectionLabel>{t('companies_list.title')}</SectionLabel>
                    {/* An h2, before: this is the page's own heading, and the page had no
                        h1 at all — one of the "H1 tag missing or empty" errors. */}
                    <h1 style={{
                        fontFamily: editorial,
                        fontStyle: 'italic',
                        fontSize: 'clamp(26px, 4vw, 40px)',
                        color: N,
                        lineHeight: 1.15,
                        marginBottom: 12
                    }}>
                        {t('companies_list.subtitle')}
                    </h1>
                    <p style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.6 }}>
                        {t('companies_list.intro')}
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8 md:mb-10 max-w-md">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('companies_list.search_placeholder')}
                            className="w-full pl-10 pr-4 py-3.5 border-0 border-b font-mono text-sm outline-none transition-colors"
                            style={{
                                borderRadius: 0,
                                borderBottom: `1px solid ${F}`,
                                color: N,
                                background: 'transparent'
                            }}
                        />
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GM }} />
                    </div>
                    {!loading && !error && (
                        <p style={{ fontFamily: body, fontSize: 12, color: GM, marginTop: 10 }}>
                            {filtered.length} {filtered.length === 1 ? 'azienda trovata' : 'aziende trovate'}
                        </p>
                    )}
                </div>

                {/* Content states */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="animate-pulse aspect-square" style={{ background: GL }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ padding: 24, background: '#FFF0F0', color: '#C00', fontFamily: body, fontSize: 13 }}>
                        {t('companies_list.load_error')}
                    </div>
                ) : companies.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: GM, fontFamily: body, fontSize: 14 }}>
                        {t('companies_list.none_available')}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: GM, fontFamily: body, fontSize: 14 }}>
                        Nessuna azienda trovata per «{query}».
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                        {filtered.map((company, idx) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(idx, 20) * 0.03 }}
                            >
                                <Link
                                    to={`/azienda/${company.slug || company.id}`}
                                    // Hand the name and logo to the detail page so its
                                    // header is real while the portal answers.
                                    state={{ name: company.name, logo: company.logo }}
                                    className="group relative aspect-square flex flex-col items-center justify-center p-6 transition-colors duration-200"
                                    style={{ background: '#FFFFFF', borderRadius: 0 }}
                                >
                                    <div className="w-full flex-1 flex items-center justify-center mb-3">
                                        {hasRealLogo(company.logo) ? (
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                className="max-w-full max-h-[80px] object-contain transition-all duration-300 mix-blend-multiply grayscale group-hover:grayscale-0"
                                            />
                                        ) : (
                                            <span style={{
                                                fontFamily: brand, fontWeight: 700, fontSize: 13,
                                                color: GM, textAlign: 'center', textTransform: 'uppercase',
                                                letterSpacing: '0.04em'
                                            }}>{company.name}</span>
                                        )}
                                    </div>
                                    <span style={{
                                        fontFamily: body,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        lineHeight: 1.3,
                                        color: N,
                                        textAlign: 'center',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>{company.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span style={{ width: 6, height: 6, background: F, display: 'inline-block' }} />
                                        <span style={{
                                            fontFamily: body,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            letterSpacing: '0.18em',
                                            textTransform: 'uppercase',
                                            color: GM
                                        }}>
                                            {t('companies_list.discover_more')}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AziendeCheAssumono;
