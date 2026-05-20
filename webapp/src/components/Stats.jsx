import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats = () => {
    const { t } = useTranslation();
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';

    const kpis = [
        ['100K+', t('hero.kpi.candidates') || 'Candidati attivi', 'nel database'],
        ['2.400', t('hero.kpi.jobs') || 'Annunci live', 'aggiornati ogni giorno'],
        ['500+', t('hero.kpi.companies') || 'Aziende', 'partner svizzere'],
    ];

    return (
        <section style={{ background: N, padding: '56px 40px' }}>
            <p style={{
                fontFamily: editorial,
                fontStyle: 'italic',
                fontSize: 20,
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                marginBottom: 48
            }}>
                La piattaforma di riferimento per il lavoro in Svizzera
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                borderLeft: '1px solid rgba(255,255,255,0.06)'
            }}>
                {kpis.map(([num, label, sub], i) => (
                    <div key={i} style={{
                        padding: '0 32px',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        textAlign: i === 1 ? 'center' : (i === 2 ? 'right' : 'left')
                    }}>
                        <div style={{
                            fontFamily: brand,
                            fontWeight: 900,
                            fontSize: 60,
                            color: F,
                            letterSpacing: '-0.03em',
                            lineHeight: 1
                        }}>{num}</div>
                        <div style={{
                            fontFamily: brand,
                            fontWeight: 600,
                            fontSize: 12,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: '#FFFFFF',
                            marginTop: 10,
                            marginBottom: 4
                        }}>{label}</div>
                        <div style={{
                            fontFamily: body,
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.3)'
                        }}>{sub}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Stats;
