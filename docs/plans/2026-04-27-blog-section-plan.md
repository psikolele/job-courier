# Blog Section Split Redesign Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Completely overhaul the Blog section to feature a 50/50 split layout (Candidates vs Companies) with white backgrounds and independent, automated dual sliders using pill-style dots.

**Architecture:** We will replace the entire contents of `webapp/src/components/Blog.jsx`. The new component will utilize React state (`useState`, `useEffect`) to manage two separate slider indices and timers. Framer Motion can be used for smooth sliding animations, or standard CSS transitions on a flex container.

**Tech Stack:** React, Tailwind CSS

---

### Task 1: Rewrite Blog Component Structure

**Files:**
- Modify: `webapp/src/components/Blog.jsx`

**Step 1: Write the minimal implementation**

Replace the current dark-themed static grid with the new split slider structure.

```jsx
// In webapp/src/components/Blog.jsx
// Replace entire file contents with:
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const candidateArticles = [
    { id: 1, title: 'Come superare il colloquio tecnico nel 2026', description: 'Scopri le strategie migliori per affrontare le technical interviews nelle top tech companies svizzere...', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Il formato CV perfetto per il mercato svizzero', description: 'Cosa guardano i recruiter nei primi 6 secondi? La guida definitiva per strutturare il tuo curriculum...', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Negoziare lo stipendio: errori da evitare', description: 'Le tre frasi da non dire mai quando si parla di compensation package durante l\'ultimo round...', image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=800&auto=format&fit=crop' }
];

const companyArticles = [
    { id: 1, title: 'I trend del remote working in Svizzera', description: 'Come attrarre talenti da tutta la confederazione offrendo flessibilità garantendo la produttività...', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Employer Branding: perché i candidati vi scartano', description: 'Analisi sui dati di rimbalzo: cosa cercano veramente i top performer quando leggono i vostri annunci...', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Intelligenza Artificiale nello screening', description: 'Come implementare soluzioni AI nel processo di recruiting senza perdere il tocco umano essenziale...', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop' }
];

const BlogCard = ({ article }) => (
    <div className="w-full shrink-0 px-2 md:px-4">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#01498C]/30 hover:shadow-lg transition-all duration-300 group flex flex-col h-[380px]">
            <div className="h-48 overflow-hidden relative">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-[#01498C] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 flex-1">{article.description}</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#01498C] uppercase tracking-wider mt-4 group-hover:gap-2 transition-all">
                    <span>Leggi l'articolo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    </div>
);

const BlogSlider = ({ title, articles, intervalMs }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timerKey, setTimerKey] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, intervalMs);
        return () => clearInterval(interval);
    }, [timerKey, articles.length, intervalMs, isPaused]);

    const handleDotClick = (idx) => {
        setCurrentIndex(idx);
        setTimerKey(prev => prev + 1);
    };

    return (
        <div 
            className="flex-1 flex flex-col pt-16 pb-24 px-6 md:px-12 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 mb-8 px-2 tracking-tight">
                {title}
            </h2>
            
            <div className="relative overflow-hidden w-full">
                <motion.div 
                    className="flex w-full"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {articles.map((article) => (
                        <BlogCard key={article.id} article={article} />
                    ))}
                </motion.div>
            </div>

            {/* Pill Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-2">
                {articles.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className="rounded-full bg-slate-300 transition-all duration-300 focus:outline-none"
                        style={{
                            width: currentIndex === idx ? '24px' : '6px',
                            height: '6px',
                            backgroundColor: currentIndex === idx ? '#01498C' : '#CBD5E1',
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                        aria-label={`Vai all'articolo ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

const Blog = () => {
    return (
        <section id="blog" className="w-full bg-white relative z-10 border-t border-slate-100">
            <div className="w-full flex flex-col lg:flex-row">
                {/* Candidates Left Half */}
                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 bg-[#FAFAFA]/50">
                    <BlogSlider 
                        title="Suggerimenti per la Carriera" 
                        articles={candidateArticles} 
                        intervalMs={5000} 
                    />
                </div>

                {/* Companies Right Half */}
                <div className="w-full lg:w-1/2 bg-white">
                    <BlogSlider 
                        title="Suggerimenti per il Recruiting" 
                        articles={companyArticles} 
                        intervalMs={5300} // Offset timer slightly to prevent synchronized sliding
                    />
                </div>
            </div>
        </section>
    );
};

export default Blog;
```

**Step 2: Commit**

```bash
git add webapp/src/components/Blog.jsx
git commit -m "feat: redesign blog section with 50/50 split and dual automated sliders"
```
