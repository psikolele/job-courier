import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';

const Blog = () => {
    const cards = [
        {
            sector: 'Technology',
            location: 'Zurigo, CH',
            title: 'Come superare il colloquio tecnico nel 2026',
            description: 'Scopri le strategie migliori per affrontare le technical interviews nel panorama tech svizzero...',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'Google Switzerland',
                logo: 'https://www.google.com/s2/favicons?domain=google.com&sz=64'
            }
        },
        {
            sector: 'Finance',
            location: 'Ginevra, CH',
            title: 'I trend del remote working in Svizzera',
            description: 'Come attrarre talenti da tutta la confederazione offrendo flessibilità e bilanciamento vita-lavoro...',
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'UBS Group',
                logo: 'https://www.google.com/s2/favicons?domain=ubs.com&sz=64'
            }
        },
        {
            sector: 'Public Sector',
            location: 'Berna, CH',
            title: 'Partnership pubblico-privato per il lavoro',
            description: 'Il ruolo delle istituzioni nella digitalizzazione del mercato del lavoro svizzero.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
            company: {
                name: 'SECO',
                logo: 'https://www.google.com/s2/favicons?domain=admin.ch&sz=64'
            }
        }
    ];

    return (
        <section id="blog" className="py-24 bg-surface text-background relative z-10 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 md:text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-sans text-white">
                        Risorse & <span className="text-accent italic font-drama">Blog</span>
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                        Approfondimenti e notizie dal mercato del lavoro, pensati su misura per te.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 group cursor-pointer shadow-2xl backdrop-blur-sm">
                            <div className="h-56 overflow-hidden relative">
                                <img 
                                    src={card.image} 
                                    alt={card.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 origin-center" 
                                    loading="lazy"
                                />
                                {/* Metadata chips — top left */}
                                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-widest rounded-full border border-white/15 shadow-lg">
                                        <Briefcase size={9} className="shrink-0" />
                                        {card.sector}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-widest rounded-full border border-white/15 shadow-lg">
                                        <MapPin size={9} className="shrink-0" />
                                        {card.location}
                                    </span>
                                </div>
                                {/* Company logo badge — bottom right */}
                                <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                                    <img
                                        src={card.company.logo}
                                        alt={card.company.name}
                                        className="w-5 h-5 rounded-sm object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span className="text-[10px] font-bold text-gray-700 leading-none tracking-tight max-w-[80px] truncate">
                                        {card.company.name}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent transition-colors leading-tight">{card.title}</h3>
                                <p className="text-gray-400 text-sm mb-8 line-clamp-2 leading-relaxed">{card.description}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-tighter group-hover:gap-4 transition-all">
                                    <span>Leggi l'articolo</span>
                                    <span className="text-lg">&rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
