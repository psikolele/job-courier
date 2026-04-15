import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, Building2, Loader2 } from 'lucide-react';
import { fetchLatestJobs } from '../services/api';

const Blog = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial mock data as fallback
    const mockCards = [
        {
            role: 'Validation Engineer',
            location: 'Mezzovico TI, Svizzera',
            title: 'Lavoratore edile cat. B',
            description: 'Per solida azienda del settore edile del Luganese cerchiamo un lavoratore edile...',
            image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'Randstad Svizzera SA',
                logo: 'https://www.google.com/s2/favicons?domain=randstad.ch&sz=128'
            }
        },
        {
            role: 'Parchettista',
            location: 'Bellinzona, Svizzera',
            title: 'Esperto Posatore di Parquet',
            description: 'Importante azienda attiva nel settore delle finiture cerca parchettista esperto...',
            image: 'https://images.unsplash.com/photo-1581858726780-7d022df583a0?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'Gi Group SA',
                logo: 'https://www.google.com/s2/favicons?domain=gigroup.com&sz=128'
            }
        },
        {
            role: 'Tecnico Metalcostruzioni',
            location: 'Mendrisio, Svizzera',
            title: 'Progettista Metalcostruttore',
            description: 'Sei un professionista delle costruzioni metalliche? Abbiamo la posizione per te...',
            image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'Adecco Svizzera',
                logo: 'https://www.google.com/s2/favicons?domain=adecco.ch&sz=128'
            }
        }
    ];

    useEffect(() => {
        const loadJobs = async () => {
            setIsLoading(true);
            const data = await fetchLatestJobs();
            if (data && data.length > 0) {
                // Map API data to UI structure
                const formattedJobs = data.map(job => ({
                    ...job,
                    // Use the real description from API, or a fallback if empty
                    description: job.description || `Scopri questa opportunità come ${job.title} in zona ${job.location}.`,
                    company: {
                        ...job.company,
                        // Prioritize real logo from API, fallback to favicon
                        logo: job.company.logo || `https://www.google.com/s2/favicons?domain=${job.company.domain}&sz=128`
                    }
                }));
                // Only take the first 3-4 for the main slider to preserve design balance
                setJobs(formattedJobs.slice(0, 3));
            } else {
                setJobs(mockCards);
            }
            setIsLoading(false);
        };
        loadJobs();
    }, []);

    const cardsToDisplay = jobs.length > 0 ? jobs : mockCards;

    return (
        <section id="blog" className="py-24 bg-surface text-background relative z-10 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 md:text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-sans text-white">
                        Ultime <span className="text-accent italic font-drama">Offerte</span>
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                        Le migliori opportunità lavorative selezionate dai nostri partner in Svizzera.
                    </p>
                </div>

                {isLoading && jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Loader2 className="animate-spin" size={40} />
                        <span className="font-bold uppercase tracking-widest text-xs">Caricamento offerte live...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cardsToDisplay.map((card, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 group cursor-pointer shadow-2xl backdrop-blur-sm">
                                <div className="h-56 overflow-hidden relative">
                                    <img 
                                        src={card.image} 
                                        alt={card.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 origin-center" 
                                        loading="lazy"
                                    />
                                    {/* Role & Location chips — premium overlay */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xl border border-white/20">
                                            <Briefcase size={10} strokeWidth={3} />
                                            Role: {card.role}
                                        </span>
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xl border border-white/10">
                                            <MapPin size={10} strokeWidth={3} />
                                            {card.location}
                                        </span>
                                    </div>
                                    {/* Elegant Company Logo Badge */}
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2.5 p-2.5 bg-white rounded-2xl shadow-2xl border border-white/40 ring-4 ring-black/5 group-hover:scale-105 transition-transform">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1">
                                            <img
                                                src={card.company.logo}
                                                alt={card.company.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => { e.target.parentElement.innerHTML = '<div class="text-gray-400"><Building2 size={16}/></div>'; }}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-0.5">Partner</span>
                                            <span className="text-[11px] font-extrabold text-[#26367b] leading-none truncate max-w-[100px]">
                                                {card.company.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent transition-colors leading-tight line-clamp-2">{card.title}</h3>
                                    <p className="text-gray-400 text-sm mb-8 line-clamp-2 leading-relaxed">{card.description}</p>
                                    <a 
                                        href={card.link || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-tighter group-hover:gap-4 transition-all"
                                    >
                                        <span>Vedi i dettagli</span>
                                        <span className="text-lg">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Blog;
