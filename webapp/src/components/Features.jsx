import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DiagnosticShuffler = () => {
    const baseItems = ['Ticino', 'Canton Ticino', 'Commerciale', 'Ingegneria', 'Medicina'];
    const [items, setItems] = useState([
        { id: 1, text: baseItems[0] },
        { id: 2, text: baseItems[1] },
        { id: 3, text: baseItems[2] }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setItems((prev) => {
                const next = [...prev];
                next.unshift({
                    id: Date.now(),
                    text: baseItems[Math.floor(Math.random() * baseItems.length)]
                });
                return next.slice(0, 3);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-48 w-full glass-dark rounded-[2rem] overflow-hidden p-6 shadow-2xl flex flex-col justify-between group">
            <div className="w-full h-[70px] relative mt-1">
                <AnimatePresence>
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -15, scale: 0.95 }}
                            animate={{ opacity: 1 - i * 0.35, y: i * 22, scale: 1 - i * 0.05, zIndex: 3 - i }}
                            exit={{ opacity: 0, y: 22 * 3, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="absolute left-0 right-0 mx-auto w-[85%] h-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center shadow-lg"
                        >
                            <span className="text-background text-[11px] font-semibold tracking-wide uppercase">{item.text}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="mt-auto text-left relative z-10 w-full mb-0 flex flex-col">
                <h3 className="text-xl font-bold font-sans text-white mb-1">Ricerca Dinamica</h3>
                <p className="text-sm text-gray-400 leading-tight">Esplora posizioni per settore e cantone istantaneamente.</p>
            </div>
        </div>
    );
};

const TelemetryTypewriter = () => {
    const [text, setText] = useState('');
    const fullText = "Invio notifica: 'Nuova posizione aperta come Software Engineer a Lugano.'";
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setText((prev) => prev + fullText.charAt(index));
                setIndex(index + 1);
            } else {
                setTimeout(() => { setText(''); setIndex(0); }, 3000);
            }
        }, 80);
        return () => clearInterval(interval);
    }, [index]);

    return (
        <div className="relative h-48 w-full glass-dark rounded-[2rem] overflow-hidden p-6 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-xs font-mono text-accent uppercase tracking-wider">Live Feed Alerts</span>
            </div>
            <div className="flex-grow">
                <p className="font-mono text-sm text-background/80 leading-relaxed">
                    {text}
                    <span className="inline-block w-2 bg-background h-4 ml-1 animate-pulse"></span>
                </p>
            </div>
            <div className="mt-4">
                <h3 className="text-xl font-bold font-sans text-white mb-2">Job Alert Personalizzati</h3>
                <p className="text-sm text-gray-400">Ricevi notifiche in tempo reale per le tue competenze.</p>
            </div>
        </div>
    );
};

const CursorScheduler = () => {
    return (
        <div className="relative h-48 w-full glass-dark rounded-[2rem] overflow-hidden p-6 shadow-2xl flex flex-col items-center group">
            {/* Griglia giorni finta */}
            <div className="flex justify-between w-full mt-2 space-x-2">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className={`h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 text-xs font-mono transition-colors duration-500 ${i === 2 ? 'bg-accent text-primary' : 'text-background'}`}>
                        {d}
                    </div>
                ))}
            </div>

            {/* SVG Animato Cursore */}
            <motion.svg
                animate={{
                    x: [-20, 60, 60, 120, -20],
                    y: [40, 0, -5, 20, 40],
                    scale: [1, 1, 0.8, 1, 1]
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute w-6 h-6 text-white drop-shadow-xl z-20 pointer-events-none"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M4 2.8C4 1.7 5.2 1 6.1 1.6l15.1 9c.9.5.8 1.9-.1 2.4l-5 2.5-3.1 7.2c-.4 1-.2 2.2-1.9 2.2-1 0-1.8-.8-2.2-1.7l-2.4-5.5-5.6 2.5C4.8 20.6 4 19.8 4 18.8V2.8z" />
            </motion.svg>

            <div className="mt-auto flex w-full flex-col align-start text-left">
                <h3 className="text-xl font-bold font-sans text-white mb-2">Candidatura in 1 Click</h3>
                <p className="text-sm text-gray-400">Pianifica e gestisci le tue candidature rapidamente.</p>
            </div>
        </div>
    );
};

const Features = () => {
    return (
        <section id="features" className="w-full py-32 px-6 md:px-12 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-sans tracking-tight font-bold text-primary mb-6">
                        Strumenti Digitali per il<br />
                        <span className="font-drama italic text-accent">Mercato del Lavoro</span>
                    </h2>
                    <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
                        Non siamo solo una bacheca annunci. Forniamo un ecosistema tecnologico avanzato costruito per accelerare il tuo percorso verso il posizionamento ideale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DiagnosticShuffler />
                    <TelemetryTypewriter />
                    <CursorScheduler />
                </div>
            </div>
        </section>
    );
};

export default Features;
