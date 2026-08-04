import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Vetrini = () => {
    const { t } = useTranslation();
    // Both the logo and the profile link are keyed by the employer's portal id, so the
    // showcase holds ids and builds the URLs. Previously each entry carried a full
    // `employer/view-company.php` link, which the Arca24 portal answers with a page whose
    // only content is `localStorage.clear(); location.reload(true)` — an endless reload
    // loop. Its logo path (`custom_jobcourier/`) is the retired one and is on borrowed time.
    const PORTAL = 'https://jobroom.jobcourier.ch';
    const logoUrl = (id) => `${PORTAL}/custom_visojobcourier/media/logo/logo_company_${id}.jpg`;
    const profileUrl = (id) => `${PORTAL}/it/careers/company/profile?uiid=${id}`;

    const companies = [
        { name: "Orienta SA", id: 3243388 },
        { name: "Randstad Svizzera SA", id: 3244729 },
        { name: "Manpower", id: 3244661 },
        { name: "PKB Private Bank SA", id: 3244624 },
        { name: "Finders SA", id: 3243489 },
        { name: "FISIOTERAPIA IGEA SAGL", id: 3244807 },
        { name: "Aposto Personal GmbH", id: 3244399 },
        { name: "Approach People Recruitment", id: 3244226 },
        { name: "Team Personnel Solutions SA", id: 3243352 },
        { name: "Work Selection AG", id: 3243557 },
        { name: "4 U Consulting", id: 3243389 },
        { name: "Rapelli - ORIOR Food AG", id: 3244679 },
        { name: "Lares Sagl", id: 3244801 },
        { name: "E-Work Sagl", id: 3244738 },
        { name: "ER Services Sagl", id: 3243694 }
    ].map((c) => ({ ...c, logo: logoUrl(c.id), link: profileUrl(c.id) }));

    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GL = 'var(--brand-gray-light)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

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
                        <motion.a
                            key={idx}
                            href={company.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.03 }}
                            className="group relative aspect-square flex flex-col items-center justify-center p-6 transition-colors duration-200"
                            style={{ background: '#FFFFFF', borderRadius: 0 }}
                            whileHover={{ backgroundColor: GL }}
                        >
                            <div className="w-full h-full flex items-center justify-center mb-2">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    className="max-w-full max-h-[70%] object-contain transition-all duration-300 mix-blend-multiply grayscale group-hover:grayscale-0"
                                />
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
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Vetrini;
