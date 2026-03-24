import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Vetrini = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated JSON feed fetch for featured jobs
        setTimeout(() => {
            setJobs([
                { id: 1, title: 'Senior React Developer', company: 'TechCorp SA', location: 'Zurigo', type: 'Full-time' },
                { id: 2, title: 'Marketing Manager', company: 'Global Vision', location: 'Ginevra', type: 'Part-time' },
                { id: 3, title: 'Data Scientist', company: 'DataLabs CH', location: 'Berna', type: 'Remote' }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <section className="py-20 bg-background text-foreground relative z-10 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold font-sans">
                        Offerte in <span className="text-accent italic font-drama">Vetrina</span>
                    </h2>
                    <a href="#tutte" className="mt-4 md:mt-0 text-accent hover:underline font-mono uppercase text-sm tracking-wider">
                        Vedi tutte &rarr;
                    </a>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-surface border border-white/5 shadow-2xl rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                    {job.type}
                                </span>
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{job.title}</h3>
                                <p className="text-foreground/70 mb-6">{job.company} • {job.location}</p>
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium text-sm">
                                    Candidati Ora
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Vetrini;
