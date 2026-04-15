import React from 'react';

const Blog = () => {
    const cards = [
        {
            target: 'Candidati',
            targetType: 'candidate',
            title: 'Come superare il colloquio tecnico nel 2026',
            description: 'Scopri le strategie migliori per affrontare le technical interviews...',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'
        },
        {
            target: 'Aziende',
            targetType: 'company',
            title: 'I trend del remote working in Svizzera',
            description: 'Come attrarre talenti da tutta la confederazione offrendo flessibilità...',
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop'
        },
        {
            target: 'Istituzioni',
            targetType: 'institution',
            title: 'Partnership pubblico-privato per il lavoro',
            description: 'Il ruolo delle istituzioni nella digitalizzazione del mercato del lavoro svizzero.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
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
                                <div className="absolute top-4 left-4">
                                    <span className="inline-block px-4 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 shadow-lg">
                                        {card.target}
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
