import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const SectionLabel = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const faqs = [
    {
        q: "Cos'è JobCourier e come può aiutarmi a trovare lavoro?",
        a: "JobCourier è un portale svizzero di ricerca lavoro progettato per facilitare gli incontri tra candidati e aziende. È uno strumento gratuito per i cercatori di lavoro che permette di: caricare e aggiornare il proprio CV, cercare offerte di lavoro, creare alert personalizzati per ricevere notifiche sulle nuove offerte pertinenti, candidarsi con un singolo click direttamente alle offerte pubblicate, gestire e monitorare le proprie candidature da un'unica area personale. La missione di JobCourier è semplice: aiutarti a trovare il lavoro giusto nel modo più rapido e intuitivo possibile."
    },
    {
        q: "JobCourier è gratuito per i candidati?",
        a: "Sì, la registrazione e l'utilizzo delle funzionalità del sito sono completamente gratuiti per i candidati."
    },
    {
        q: "Come trovo le offerte di lavoro su JobCourier?",
        a: "Per trovare offerte di lavoro compatibili con il tuo profilo, utilizza la barra di ricerca in homepage inserendo la professione e/o un'area geografica. In alternativa, puoi visualizzare tutti gli annunci online sul portale nella sezione \"Vedi tutte le offerte\". È inoltre possibile attivare notifiche automatiche per ricevere offerte compatibili con il tuo profilo."
    },
    {
        q: "Come mi candido a un'offerta di lavoro su JobCourier?",
        a: "Per candidarti a un'offerta di lavoro, devi essere registrato su JobCourier. Se sei già registrato, basta cliccare sul tasto \"Candidati\" all'interno dell'annuncio — la candidatura avviene con un semplice click. Se non sei ancora registrato, cliccando su \"Candidati\" ti verrà richiesto di creare un profilo per procedere."
    },
    {
        q: "Come posso creare un Account JobCourier?",
        a: "Per creare un profilo personale, clicca su \"Carica il CV\", seleziona la lingua in cui è scritto il tuo CV, carica il documento e l'AI estrarrà automaticamente tutti i dati necessari per la creazione del tuo profilo in pochi secondi. Puoi modificare o integrare queste informazioni in qualsiasi momento."
    },
    {
        q: "Posso nascondere i miei dati sensibili alle aziende?",
        a: "Sì, su JobCourier puoi controllare la privacy del tuo profilo come desideri. Hai la possibilità di esprimere la tua preferenza prima di salvare il tuo profilo, autorizzando o meno la visibilità dei tuoi dati personali. Una volta registrato, puoi sempre modificare questa scelta nella tua area personale."
    },
    {
        q: "Posso inviare il mio CV direttamente a JobCourier?",
        a: "JobCourier è una piattaforma che mette in contatto candidati e aziende, ma non gestisce direttamente le candidature. Per questo motivo, non è possibile inviare il proprio CV direttamente al team di JobCourier. Ti invitiamo a registrarti gratuitamente, creare il tuo profilo e caricare il tuo CV nell'area personale."
    },
    {
        q: "Posso vedere le offerte di lavoro per le quali mi sono candidato?",
        a: "Sì, accedendo alla sezione \"I miei annunci\" nel tuo profilo personale, puoi vedere tutti gli annunci a cui ti sei candidato, mentre nella home del tuo profilo puoi visualizzare messaggi e aggiornamenti sullo stato delle tue candidature."
    },
    {
        q: "Cosa trovo all'interno del mio profilo?",
        a: "La tua area personale include: CV Digitale e ricerca lavoro, Home con richieste e aggiornamenti dalle aziende, I miei annunci con tutte le candidature effettuate, Job agent per alert automatici, Video curriculum per una presentazione video, Job test psicoattitudinale, e Attività con i log completi delle operazioni sul profilo."
    },
    {
        q: "Come posso aggiornare i miei dati o il mio CV?",
        a: "Puoi modificare o aggiornare le informazioni del tuo profilo in qualsiasi momento cliccando su \"Gestione Account\". Qui puoi modificare i dettagli di registrazione, i dati di accesso, le notifiche, il CV, le esperienze professionali, la lettera di presentazione, ed eliminare il profilo."
    },
    {
        q: "Posso ricevere notifiche per nuove offerte di lavoro?",
        a: "Puoi impostare job alert personalizzati accedendo alla sezione \"Job agent\". Il portale crea automaticamente il primo alert utilizzando il titolo professionale con cui ti sei registrato. Riceverai un'email settimanale con i link alle nuove offerte corrispondenti ai tuoi alert."
    },
    {
        q: "Come posso sapere se un'offerta è ancora attiva?",
        a: "Le offerte visibili sulla piattaforma sono generalmente attive. La data di pubblicazione è indicata in ogni annuncio."
    },
    {
        q: "JobCourier verifica le aziende che pubblicano gli annunci?",
        a: "Sì, viene effettuato un controllo per garantire che gli annunci provengano da aziende affidabili e reali."
    },
    {
        q: "Ho dimenticato la password. Come posso recuperarla?",
        a: "Clicca su \"Password dimenticata?\" nella pagina di login e inserisci l'indirizzo email associato al tuo account. In pochi secondi riceverai le istruzioni per reimpostare la tua nuova password."
    },
    {
        q: "Come posso eliminare il mio Account su JobCourier?",
        a: "Puoi richiedere la cancellazione dell'account in qualsiasi momento. Accedi alla tua area personale, apri \"Gestione Account\" e seleziona \"Elimina account\". Tieni presente che questa azione è irreversibile."
    },
    {
        q: "Cosa posso fare se ho una domanda non elencata qui?",
        a: "Se hai bisogno di assistenza per un problema tecnico o una richiesta specifica, puoi contattare direttamente il nostro team di supporto scrivendo a support@jobcourier.ch. Ti consigliamo di indicare chiaramente l'oggetto della tua segnalazione."
    },
];

const FAQItem = ({ q, a, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            style={{ borderBottom: '1px solid rgba(5,11,43,0.07)', cursor: 'pointer' }}
            onClick={() => setOpen(o => !o)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <span style={{ fontFamily: brand, fontWeight: 900, fontSize: 11, color: F, letterSpacing: '0.15em', flexShrink: 0 }}>
                        {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 15, color: N, lineHeight: 1.3 }}>{q}</span>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, color: F }}>
                    <ChevronDown size={18} />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.7, paddingBottom: 20, paddingLeft: 40 }}>
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => (
    <div className="min-h-screen overflow-x-hidden" style={{ background: GL }}>
        {/* HERO */}
        <section className="relative min-h-[40vh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
            <div className="container mx-auto w-full">
                <div className="max-w-3xl">
                    <SectionLabel>FAQ Candidati</SectionLabel>
                    <h1 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                        color: 'var(--brand-white)', textTransform: 'uppercase',
                        letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24
                    }}>
                        Domande<br /><span style={{ color: F }}>Frequenti.</span>
                    </h1>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                        Tutto quello che devi sapere su JobCourier.
                    </p>
                </div>
            </div>
        </section>

        {/* FAQ LIST */}
        <section className="py-20 px-6 md:px-12" style={{ background: 'var(--brand-white)' }}>
            <div className="container mx-auto max-w-3xl">
                {faqs.map((item, i) => (
                    <FAQItem key={i} q={item.q} a={item.a} index={i} />
                ))}
            </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 md:px-12" style={{ background: GL }}>
            <div className="container mx-auto max-w-3xl text-center">
                <p style={{ fontFamily: body, fontSize: 14, color: GM, marginBottom: 8 }}>
                    Non hai trovato risposta alla tua domanda?
                </p>
                <a
                    href="mailto:support@jobcourier.ch"
                    style={{
                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: F, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                >
                    Contatta il supporto →
                </a>
            </div>
        </section>
    </div>
);

export default FAQ;
