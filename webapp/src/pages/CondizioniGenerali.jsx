import React from 'react';
import PageSeo from '../components/PageSeo';

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

const H2 = ({ children }) => (
    <h2 style={{ fontFamily: brand, fontWeight: 900, fontSize: 18, color: N, textTransform: 'uppercase', letterSpacing: '-0.01em', marginTop: 40, marginBottom: 12 }}>
        {children}
    </h2>
);

const H3 = ({ children }) => (
    <h3 style={{ fontFamily: brand, fontWeight: 700, fontSize: 14, color: N, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 24, marginBottom: 8 }}>
        {children}
    </h3>
);

const P = ({ children }) => (
    <p style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.75, marginBottom: 14 }}>
        {children}
    </p>
);

const Li = ({ children }) => (
    <li style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.75, marginBottom: 6, paddingLeft: 8 }}>
        {children}
    </li>
);

const CondizioniGenerali = () => (
    <div className="min-h-screen overflow-x-hidden" style={{ background: GL }}>
        <PageSeo page="condizioni" />
        {/* HERO */}
        <section className="relative min-h-[40vh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
            <div className="container mx-auto w-full">
                <div className="max-w-3xl">
                    <SectionLabel>Area Legale</SectionLabel>
                    <h1 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                        color: 'var(--brand-white)', textTransform: 'uppercase',
                        letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24
                    }}>
                        Condizioni<br /><span style={{ color: F }}>Generali.</span>
                    </h1>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                        Condizioni generali di vendita e utilizzo di JobCourier.
                    </p>
                </div>
            </div>
        </section>

        {/* CONTENT */}
        <section className="py-20 px-6 md:px-12" style={{ background: 'var(--brand-white)' }}>
            <div className="container mx-auto max-w-3xl">

                <H2>1. Ambito di applicazione</H2>
                <P>Le presenti Condizioni Generali disciplinano le relazioni reciproche tra JobCourier e i suoi clienti/utenti e sono valide per tutti i servizi e le offerte proposte da JobCourier esplicitati al successivo punto 2.1, fatta eccezione per eventuali accordi specifici conclusi per iscritto tra le parti.</P>
                <P>JobCourier si riserva sempre la possibilità di non accettare l'Ordine di Acquisto che si viene a creare nella sezione "Carrello".</P>

                <H2>2. Offerta, prezzi, condizioni di pagamento</H2>
                <H3>2.1. Servizi offerti</H3>
                <P>Si intendono esclusi dai servizi elencati tutti i soggetti operanti sul territorio del Principato del Liechtenstein o che operano in settori o professioni quali sportivi, persone alla pari ed artisti.</P>
                <P>JobCourier fornisce ai suoi clienti/utenti i seguenti servizi:</P>
                <ul style={{ paddingLeft: 20, marginBottom: 14, listStyleType: 'decimal' }}>
                    <Li>Pubblicare offerte di lavoro per gli utenti aziende: un annuncio di lavoro è valido per un'unica posizione d'impiego.</Li>
                    <Li>Ricercare CV nel database JobCourier per gli utenti aziende.</Li>
                    <Li>Inserire il proprio CV nel database di JobCourier per gli utenti candidati.</Li>
                </ul>
                <P>Per tutti i Servizi on demand previsti dal Sito valgono le presenti Condizioni Generali. Per tutti i Servizi è d'obbligo una registrazione. La registrazione ha carattere personale e non deve essere ceduta, prestata o affittata.</P>
                <P>JobCourier si riserva di sospendere o interrompere i propri Servizi qualora i dati ivi inseriti non risultino essere compatibili con il Servizio e/o contrari alle presenti Condizioni Generali e/o alla Legge.</P>

                <H3>Pubblicare offerte di lavoro per gli utenti aziende</H3>
                <P>Il servizio permette la pubblicazione di offerte di lavoro in modo trasparente, cioè con i dati e il logo dell'azienda, o in modo anonimo. La lista delle offerte di lavoro pubblicate rimarrà online per 30 giorni ed è, in qualsiasi momento e per un numero illimitato di volte, consentito il rinnovo delle stesse. Il cliente potrà pubblicare un numero illimitato di offerte di lavoro.</P>
                <P>È proibito l'uso errato del sito, pubblicare testi non direttamente correlati alla pubblicazione di un'offerta di lavoro o testi discriminatori o dannosi dell'immagine di terzi o di JobCourier. All'interno del testo delle offerte di lavoro non è permesso l'inserimento di indirizzi mail o di link a cui rimandare le candidature.</P>
                <P>L'accesso al database dei CV è illimitato sia a livello temporale che per numeri di accesso o visualizzazioni. I candidati potranno essere contattati solo per delle proposte di lavoro.</P>

                <H3>Inserire il proprio CV nel database JobCourier per gli utenti candidati</H3>
                <P>Ogni utente candidato può registrare gratuitamente il proprio CV senza nessun addebito. Il form per registrare il CV è diviso in due sezioni: i dati pubblici (competenze accademiche e lavorative), consultabili dalle aziende registrate, e i dati privati (nome, cognome, numeri di contatto, e-mail), consultabili solo su espressa volontà del candidato.</P>
                <P>La registrazione del proprio CV per l'utente è completamente gratuita.</P>

                <H3>2.2. Prezzi e condizioni di pagamento</H3>
                <P>I prezzi in vigore per i servizi prestati, le modalità di pagamento, nonché i contenuti e la durata dei Servizi sono pubblicati nel Sito. JobCourier si riserva il diritto di modificare i prezzi pubblicati per offerte online in qualunque momento.</P>
                <P>Salvo diverso specifico accordo scritto tra le parti, per i pacchetti flat si chiede il pagamento anticipato mediante bonifico bancario. Per tutti gli altri Servizi, è possibile effettuare pagamento tramite Paypal o sistemi equivalenti. Tutti i prezzi indicati per i Servizi online si intendono IVA esclusa.</P>

                <H3>2.3. Mancato uso</H3>
                <P>I Servizi verranno attivati soltanto alla effettiva ricezione del pagamento. Il mancato uso (totale o parziale) delle prestazioni di JobCourier da parte del cliente/utente non determina alcuna deduzione dall'importo dovuto ad JobCourier, che resta integralmente dovuto.</P>

                <H2>3. Diritti e doveri di JobCourier</H2>
                <H3>3.1. Servizi</H3>
                <P>JobCourier si premura di migliorare continuamente i Servizi per adeguarli alle necessità e alle esigenze degli utenti. JobCourier si riserva il diritto di modificare o eliminare talune funzioni dai Servizi in qualsiasi momento e senza preannunciarlo.</P>
                <P>I Servizi e tutti i loro contenuti vengono messi a disposizione senza garanzia di assenza di difetti. Il Sito o parti dei Servizi possono essere temporaneamente non disponibili per svariati motivi, senza che per questa ragione JobCourier si assuma alcuna responsabilità.</P>

                <H3>3.2. Responsabilità</H3>
                <P>JobCourier non si assume alcuna responsabilità in merito all'accuratezza, ai contenuti, all'integrità, alla legalità, all'affidabilità, alla funzionalità o alla disponibilità delle informazioni o del materiale che può essere visualizzato utilizzando i Servizi.</P>
                <P>I Servizi vengono forniti "come tali" senza altra forma di garanzia. In nessun caso JobCourier sarà responsabile per i danni provocati dall'uso improprio dei Servizi o derivanti da rivendicazioni connesse allo stesso.</P>

                <H3>3.3. Contenuti e comportamenti degli utenti</H3>
                <P>JobCourier non è obbligata ma è autorizzata a verificare e/o controllare le informazioni inserite, trasmesse o messe a disposizione nel Servizio da parte degli utenti.</P>
                <P>JobCourier si riserva in ogni caso il diritto, a sua esclusiva discrezione, di condurre indagini in relazione all'utilizzo del Servizio e di prendere provvedimenti adeguati contro tutti gli utenti che violano le presenti Condizioni Generali, le leggi vigenti, o partecipano a comportamenti scandalosi o illegali.</P>

                <H2>4. Diritti e doveri degli utenti</H2>
                <H3>4.1. Dati completi e attuali</H3>
                <P>L'utente si impegna a fornire tutti i dati relativi alla sua persona aggiornati, corretti e completi. L'utente deve avere almeno l'età minima stabilita per legge per la fruizione del Servizio.</P>

                <H3>4.2. Contenuti degli utenti</H3>
                <P>Ogni utente risponde personalmente ed esclusivamente dell'inserimento, della trasmissione e/o della fornitura di notizie, comunicazioni, testi, informazioni e altri contenuti all'interno del Servizio.</P>

                <H3>4.3. Salvataggio di copie</H3>
                <P>È vietato il salvataggio di copie dei contenuti raccolti tramite il Servizio. In ogni caso, è espressamente esclusa qualsiasi responsabilità di JobCourier per trattamenti di dati da essa non autorizzati.</P>

                <H3>4.4. Norme di comportamento</H3>
                <P>L'utente assicura e garantisce di non violare le leggi svizzere in materia e in generale tutta la normativa applicabile (LPD e GDPR) e in particolare di non mettere a disposizione contenuti di qualsiasi tipo che violano i diritti di terzi o contengono materiale illegale e/o contrario al buon costume.</P>

                <H3>4.5. Comportamento con altri utenti</H3>
                <P>Gli utenti sono personalmente ed esclusivamente responsabili del loro comportamento nei confronti di altri utenti. JobCourier non ha l'onere di vigilare su quanto pubblicato dagli utenti nell'utilizzo del Servizio.</P>

                <H3>4.6. Responsabilità</H3>
                <P>Ciascun utente è personalmente responsabile dell'utilizzo che fa del Servizio e di tutte le sue azioni a ciò connesse, e manleva JobCourier da qualsivoglia responsabilità in merito.</P>

                <H2>5. Diritti di proprietà</H2>
                <P>Nel Sito e nei Servizi sono presenti contenuti e tecnologie di JobCourier protetti da diritti di tutela industriale, come i diritti d'autore. L'utente riconosce che tutti i diritti derivanti dal Sito e dai suoi contenuti sono e rimangono di proprietà di JobCourier.</P>

                <H2>6. Protezione dei dati personali</H2>
                <P>Per quanto riguarda il rilevamento, la memorizzazione e l'impiego di dati personali, JobCourier si attiene alle disposizioni e alle norme vigenti in materia di protezione dei dati personali (Legge Federale sulla protezione dei dati LPD e GDPR).</P>
                <P>La registrazione del candidato e dell'azienda è sempre volontaria, previa accettazione delle presenti condizioni generali e dell'informativa al trattamento dati personali.</P>

                <H2>7. Disdette e modifiche</H2>
                <P>Il rapporto contrattuale tra JobCourier e l'utente può essere disdetto in qualsiasi momento da ognuna delle parti, a libera discrezione, con effetto immediato. I Prezzi dei Servizi a pagamento non vengono restituiti in nessun caso all'utente.</P>
                <P>JobCourier si riserva il diritto di interrompere temporaneamente, togliere o sostituire tutti i servizi del Sito o alcuni di essi, nonché di modificare i prezzi dei Servizi in qualsiasi momento.</P>

                <H2>8. Diritto applicabile / Foro competente</H2>
                <P>Il rapporto contrattuale tra JobCourier e il cliente/utente è disciplinato dalle leggi della Confederazione Svizzera, che prevarranno in caso di conflitto con le altre leggi in vigore.</P>
                <P>Competente in caso di controversie è esclusivamente la Pretura di Lugano con facoltà di ricorso alle istanze giudiziarie superiori.</P>

            </div>
        </section>
    </div>
);

export default CondizioniGenerali;
