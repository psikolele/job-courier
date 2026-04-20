import React from 'react';
import { motion } from 'framer-motion';

const Vetrini = () => {
    const companies = [
        { name: "FISIOTERAPIA IGEA SAGL", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244807.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244807&company-name=fisioterapia-igea-sagl" },
        { name: "Orienta SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243388.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243388&company-name=orienta-sa" },
        { name: "PKB Private Bank SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244624.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244624&company-name=pkb-private-bank-sa" },
        { name: "Aposto Personal GmbH", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244399.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244399&company-name=aposto-personal-gmbh" },
        { name: "Finders SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243489.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243489&company-name=finders-sa" },
        { name: "Randstad Svizzera SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244729&company-name=randstad-svizzera-sa" },
        { name: "Approach People Recruitment", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244226.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244226&company-name=approach-people-recruitment" },
        { name: "Team Personnel Solutions SA", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243352.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243352&company-name=team-personnel-solutions-sa" },
        { name: "Manpower", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244661.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244661&company-name=manpower" },
        { name: "Work Selection AG", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243557.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243557&company-name=work-selection-ag" },
        { name: "4 U Consulting", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243389.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243389&company-name=4-u-consulting" },
        { name: "Rapelli - ORIOR Food AG", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244679.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244679&company-name=rapelli---orior-food-ag" },
        { name: "Lares Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244801.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244801&company-name=lares-sagl" },
        { name: "E-Work Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244738.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3244738&company-name=e-work-sagl" },
        { name: "ER Services Sagl", logo: "https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3243694.jpg", link: "https://jobroom.jobcourier.ch/employer/view-company.php?id=3243694&company-name=er-services-sagl" }
    ];

    return (
        <section className="py-16 md:py-24 bg-white relative z-10 px-4 md:px-12 w-full" id="vetrini">
            <div className="max-w-[1400px] mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-[#01498C] mb-6 tracking-tight italic font-display">
                        Aziende e società di selezione in vetrina
                    </h2>
                    <div className="w-24 h-1 bg-[#01498C] mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {companies.map((company, idx) => (
                        <motion.a
                            key={idx}
                            href={company.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative aspect-square flex flex-col items-center justify-center p-8 transition-all duration-500 hover-lift"
                            style={{
                                background: 'rgba(142, 132, 200, 0.12)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(142, 132, 200, 0.2)',
                                borderRadius: '2.5rem',
                                boxShadow: '0 8px 32px 0 rgba(142, 132, 200, 0.05)'
                            }}
                        >
                            <div className="w-full h-full flex items-center justify-center mb-2">
                                <img 
                                    src={company.logo} 
                                    alt={company.name} 
                                    className="max-w-full max-h-[70%] object-contain filter group-hover:drop-shadow-lg transition-all duration-500"
                                />
                            </div>
                            <span className="text-[10px] font-normal uppercase tracking-[0.25em] text-[#01498C] opacity-40 group-hover:opacity-100 transition-opacity font-mono">
                                Vedi Annunci
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Vetrini;
