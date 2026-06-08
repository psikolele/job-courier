import React from 'react';
import { motion } from 'framer-motion';

const Vetrini = () => {
    const companies = [
        { name: "Orienta SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243388.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243388&company-name=orienta-sa" },
        { name: "Randstad Svizzera SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244729&company-name=randstad-svizzera-sa" },
        { name: "Manpower", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244661.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244661&company-name=manpower" },
        { name: "PKB Private Bank SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244624.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244624&company-name=pkb-private-bank-sa" },
        { name: "Finders SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243489.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243489&company-name=finders-sa" },
        { name: "FISIOTERAPIA IGEA SAGL", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244807.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244807&company-name=fisioterapia-igea-sagl" },
        { name: "Aposto Personal GmbH", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244399.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244399&company-name=aposto-personal-gmbh" },
        { name: "Approach People Recruitment", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244226.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244226&company-name=approach-people-recruitment" },
        { name: "Team Personnel Solutions SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243352.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243352&company-name=team-personnel-solutions-sa" },
        { name: "Work Selection AG", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243557.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243557&company-name=work-selection-ag" },
        { name: "4 U Consulting", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243389.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243389&company-name=4-u-consulting" },
        { name: "Rapelli - ORIOR Food AG", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244679.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244679&company-name=rapelli---orior-food-ag" },
        { name: "Lares Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244801.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244801&company-name=lares-sagl" },
        { name: "E-Work Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244738.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244738&company-name=e-work-sagl" },
        { name: "ER Services Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243694.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243694&company-name=er-services-sagl" }
    ];

    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GL = 'var(--brand-gray-light)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    return (
        <section className="py-20 md:py-28 px-6 md:px-12 w-full" id="vetrini" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto w-full">
                {/* Section label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                    <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                        Aziende Partner
                    </span>
                </div>
                <h2 style={{
                    fontFamily: editorial,
                    fontStyle: 'italic',
                    fontSize: 38,
                    color: N,
                    marginBottom: 8,
                    overflowWrap: 'break-word',
                    lineHeight: 1.2
                }}>
                    Aziende recruiter che si affidano a Job Courier
                </h2>
                <p style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: GM,
                    marginBottom: 48,
                    overflowWrap: 'break-word'
                }}>
                    Aziende e recruiter che si affidano a JobCourier.
                </p>

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
                                    Vedi Annunci
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
