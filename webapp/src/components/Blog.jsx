import React from 'react';

const Blog = () => {
    const cards = [
        {
            target: 'Candidati',
            targetType: 'candidate',
            title: 'Come superare il colloquio tecnico nel 2026',
            description: 'Scopri le strategie migliori per affrontare le technical interviews...',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600'
        },
        {
            target: 'Aziende',
            targetType: 'company',
            title: 'I trend del remote working in Svizzera',
            description: 'Come attrarre talenti da tutta la confederazione offrendo flessibilità...',
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=600'
        },
        {
            target: 'Istituzioni',
            targetType: 'institution',
            title: 'Partnership pubblico-privato per il lavoro',
            description: 'Il ruolo delle istituzioni nella digitalizzazione del mercato del lavoro svizzero.',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
        }
    ];

    return (
        <section id="blog" className="py-24 bg-surface text-foreground relative z-10 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 md:text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-sans">
                        Risorse & <span className="text-accent italic font-drama">Blog</span>
                    </h2>
                    <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
                        Approfondimenti e notizie dal mercato del lavoro, pensati su misura per te.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-background border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden hover:-translate-y-2 transition-transform duration-300 group cursor-pointer shadow-xl">
                            <div className="h-48 overflow-hidden relative">
                                <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-block px-3 py-1 bg-background/90 backdrop-blur text-accent text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                                        {card.target}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors leading-snug">{card.title}</h3>
                                <p className="text-foreground/70 text-sm mb-6">{card.description}</p>
                                <button className="text-sm font-semibold text-accent group-hover:underline">
                                    Leggi l'articolo &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
