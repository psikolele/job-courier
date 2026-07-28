import React, { useEffect, useRef } from 'react';

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
    <h2 style={{
        fontFamily: brand, fontWeight: 800, fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
        color: N, textTransform: 'uppercase', letterSpacing: '-0.01em',
        marginTop: 48, marginBottom: 16
    }}>{children}</h2>
);

const H3 = ({ children }) => (
    <h3 style={{
        fontFamily: brand, fontWeight: 700, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
        color: N, marginTop: 28, marginBottom: 10
    }}>{children}</h3>
);

const P = ({ children }) => (
    <p style={{
        fontFamily: body, fontSize: '1rem', lineHeight: 1.75,
        color: GM, marginBottom: 16
    }}>{children}</p>
);

const Ul = ({ children }) => (
    <ul style={{
        fontFamily: body, fontSize: '1rem', lineHeight: 1.75,
        color: GM, marginBottom: 16, paddingLeft: 24
    }}>{children}</ul>
);

const Li = ({ children }) => (
    <li style={{ marginBottom: 6, listStyleType: 'disc', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{children}</li>
);

const FuchsiaLine = () => (
    <div style={{ width: 48, height: 3, background: F, marginBottom: 32, marginTop: 8 }} />
);

const CookieDeclaration = () => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || el.querySelector('script')) return;
        const script = document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = 'https://consent.cookiebot.com/29601bde-40d6-45d8-be15-4b7bdef2d50c/cd.js';
        script.type = 'text/javascript';
        script.async = true;
        el.appendChild(script);
    }, []);
    return <div ref={ref} />;
};

const CookiePolicy = () => {
    return (
        <div className="min-h-screen overflow-x-hidden" style={{ background: GL }}>
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
                            Cookie<br /><span style={{ color: F }}>Policy.</span>
                        </h1>
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                            Informativa sull'utilizzo dei cookie su jobcourier.ch
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <section className="py-20 px-6 md:px-12" style={{ background: 'var(--brand-white)' }}>
                <div className="container mx-auto max-w-3xl">

                    <P>
                        Ultimo aggiornamento: giugno 2026. La presente Cookie Policy descrive come <strong>JobCourier Sagl</strong>,
                        con sede in Via delle Fornaci 6 - 6826 Riva San Vitale, utilizza i cookie e tecnologie simili sul sito web{' '}
                        <strong>jobcourier.ch</strong>. La policy è redatta in conformità al Regolamento UE 2016/679 (GDPR),
                        alla Legge federale svizzera sulla protezione dei dati (nLPD) e alle disposizioni applicabili in materia
                        di comunicazioni elettroniche.
                    </P>
                    <FuchsiaLine />

                    <H2>1. Cosa sono i cookie</H2>
                    <P>
                        I cookie sono piccoli file di testo che vengono depositati sul dispositivo dell'utente (computer, tablet,
                        smartphone) quando visita un sito web. Consentono al sito di riconoscere il dispositivo durante la
                        navigazione corrente o nelle visite successive, migliorando l'esperienza d'uso e raccogliendo informazioni
                        statistiche sull'utilizzo delle pagine.
                    </P>
                    <P>
                        I cookie non contengono programmi eseguibili e non possono accedere ad altri dati presenti sul dispositivo.
                        Oltre ai cookie tradizionali, possono essere utilizzate tecnologie simili come web beacon, pixel tag e
                        localStorage, che svolgono funzioni analoghe.
                    </P>

                    <H2>2. Tipologie di cookie utilizzati</H2>

                    <H3>2.1 Cookie tecnici e funzionali</H3>
                    <P>
                        Sono strettamente necessari al funzionamento del sito e all'erogazione dei servizi richiesti
                        dall'utente. Senza di essi alcune funzionalità — come il login, la navigazione sicura o la
                        memorizzazione delle preferenze — non sarebbero disponibili. Non richiedono il consenso dell'utente
                        ai sensi della normativa vigente.
                    </P>

                    <H3>2.2 Cookie analitici</H3>
                    <P>
                        Raccolgono informazioni aggregate e anonime su come gli utenti interagiscono con il sito (pagine
                        visitate, tempo di permanenza, provenienza del traffico). Vengono utilizzati per migliorare le
                        prestazioni e i contenuti del portale. Quando gestiti direttamente da JobCourier o con IP
                        anonimizzato, sono assimilabili ai cookie tecnici; in caso contrario, richiedono il consenso.
                    </P>

                    <H3>2.3 Cookie di profilazione e marketing</H3>
                    <P>
                        Tracciano le abitudini di navigazione dell'utente per mostrare pubblicità personalizzata e offerte
                        di lavoro rilevanti, sia su jobcourier.ch sia su siti terzi. Sono utilizzati solo previo consenso
                        esplicito dell'utente, che può essere revocato in qualsiasi momento.
                    </P>

                    <H3>2.4 Cookie di terze parti</H3>
                    <P>
                        Alcuni cookie vengono impostati da servizi di terze parti integrati nel sito (es. Google Analytics,
                        LinkedIn, Meta). Questi soggetti operano come responsabili autonomi del trattamento e applicano le
                        proprie policy sulla privacy. JobCourier non ha controllo diretto su tali cookie e invita gli utenti
                        a consultare le informative dei rispettivi fornitori.
                    </P>

                    <H2>3. Cookie specifici utilizzati su jobcourier.ch</H2>

                    <P>
                        L'elenco aggiornato dei cookie effettivamente rilevati sul sito, generato automaticamente da
                        Cookiebot tramite scansione periodica, è riportato di seguito:
                    </P>
                    <div style={{ marginBottom: 24 }}>
                        <CookieDeclaration />
                    </div>

                    <P>
                        Google Analytics viene utilizzato con la funzione di anonimizzazione dell'indirizzo IP attivata
                        (<code style={{ background: GL, padding: '1px 5px', borderRadius: 3, fontSize: '0.9em' }}>anonymizeIp: true</code>).
                        I dati raccolti non consentono l'identificazione diretta degli utenti. Per l'informativa completa di
                        Google Analytics consultare:{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: F, textDecoration: 'underline' }}>
                            policies.google.com/privacy
                        </a>.
                    </P>

                    <H2>4. Come gestire e disabilitare i cookie</H2>
                    <P>
                        L'utente può in qualsiasi momento modificare le proprie preferenze sui cookie direttamente dal proprio
                        browser. La disabilitazione dei soli cookie tecnici potrebbe compromettere il corretto funzionamento
                        di alcune sezioni del sito.
                    </P>
                    <P>Di seguito le istruzioni per i browser più diffusi:</P>
                    <Ul>
                        <Li>
                            <strong>Google Chrome:</strong>{' '}
                            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                                support.google.com/chrome/answer/95647
                            </a>
                        </Li>
                        <Li>
                            <strong>Mozilla Firefox:</strong>{' '}
                            <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                                support.mozilla.org — Protezione antitracciamento
                            </a>
                        </Li>
                        <Li>
                            <strong>Apple Safari:</strong>{' '}
                            <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                                support.apple.com — Gestione cookie in Safari
                            </a>
                        </Li>
                        <Li>
                            <strong>Microsoft Edge:</strong>{' '}
                            <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                                support.microsoft.com — Cookie in Microsoft Edge
                            </a>
                        </Li>
                    </Ul>
                    <P>
                        Per quanto riguarda i cookie di profilazione di terze parti, l'utente può esercitare il diritto di
                        opposizione visitando:{' '}
                        <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                            www.youronlinechoices.eu
                        </a>{' '}(iniziativa IAB Europe).
                    </P>
                    <P>
                        Per disattivare il tracciamento di Google Analytics in modo permanente è disponibile il componente
                        aggiuntivo per browser:{' '}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: F }}>
                            tools.google.com/dlpage/gaoptout
                        </a>.
                    </P>

                    <H2>5. Base giuridica del trattamento</H2>
                    <P>
                        Il trattamento tramite cookie tecnici e funzionali si basa sul <strong>legittimo interesse</strong> del
                        titolare (art. 6 par. 1 lett. f GDPR; art. 31 nLPD) in quanto necessario all'erogazione del servizio
                        richiesto. Il trattamento tramite cookie analitici non essenziali e cookie di profilazione si basa sul{' '}
                        <strong>consenso</strong> dell'utente (art. 6 par. 1 lett. a GDPR), espresso al momento del primo
                        accesso al sito attraverso il banner di gestione dei cookie.
                    </P>

                    <H2>6. Trasferimento dei dati</H2>
                    <P>
                        Alcuni fornitori di servizi terzi (es. Google LLC) hanno sede negli Stati Uniti. Il trasferimento
                        avviene nel rispetto delle garanzie previste dalla normativa applicabile, incluse le clausole
                        contrattuali tipo approvate dalla Commissione Europea e, ove pertinente, il Data Privacy Framework
                        UE–USA. Per i trasferimenti verso paesi terzi ai sensi della nLPD, JobCourier adotta le medesime
                        garanzie appropriate richieste dalla legge svizzera.
                    </P>

                    <H2>7. Aggiornamenti alla cookie policy</H2>
                    <P>
                        JobCourier si riserva il diritto di aggiornare la presente Cookie Policy per riflettere modifiche
                        tecniche, normative o operative. In caso di modifiche sostanziali, l'utente verrà informato tramite
                        un avviso visibile sul sito o, se registrato, via e-mail. La data dell'ultimo aggiornamento è
                        indicata in cima alla presente pagina.
                    </P>
                    <P>
                        Si consiglia di consultare periodicamente questa pagina per restare informati su eventuali
                        aggiornamenti.
                    </P>

                    <H2>8. Diritti degli interessati</H2>
                    <P>
                        In qualità di interessato, l'utente ha il diritto di: accedere ai propri dati, richiederne la
                        rettifica o la cancellazione, opporsi al trattamento per finalità di marketing, richiedere la
                        limitazione del trattamento, esercitare il diritto alla portabilità dei dati. Tali diritti possono
                        essere esercitati contattando il titolare ai recapiti indicati di seguito. L'utente ha inoltre il
                        diritto di presentare reclamo all'Incaricato federale della protezione dei dati e della trasparenza
                        (IFPDT) o all'autorità di controllo competente nello Stato membro UE di residenza abituale.
                    </P>

                    <H2>9. Contatti</H2>
                    <P>
                        Per qualsiasi domanda relativa alla presente Cookie Policy o all'esercizio dei diritti sopra indicati,
                        è possibile contattare JobCourier ai seguenti recapiti:
                    </P>
                    <Ul>
                        <Li><strong>E-mail:</strong> <a href="mailto:privacy@jobcourier.ch" style={{ color: F }}>privacy@jobcourier.ch</a></Li>
                        <Li><strong>Indirizzo:</strong> JobCourier Sagl - Via delle Fornaci 6 - 6826 Riva San Vitale</Li>
                    </Ul>

                </div>
            </section>
        </div>
    );
};

export default CookiePolicy;
