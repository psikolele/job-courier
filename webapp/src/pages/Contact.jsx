import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, ArrowRight, Check, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const SectionLabel = ({ children, color = F }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: color, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color }}>{children}</span>
    </div>
);

const Contact = () => {
    const containerRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
            gsap.from('.section-reveal', { y: 30, opacity: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '.section-trigger', start: 'top 80%' } });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const inputStyle = {
        width: '100%',
        background: '#FFFFFF',
        border: '1.5px solid rgba(5,11,43,0.1)',
        borderRadius: 0,
        padding: '14px 18px',
        fontFamily: body,
        fontSize: 14,
        outline: 'none',
        color: N
    };

    const labelStyle = {
        display: 'block',
        fontFamily: brand,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: F,
        marginBottom: 8
    };

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-x-hidden" style={{ background: GL }}>

            {/* HERO */}
            <section className="relative pt-40 pb-24 overflow-hidden px-6 md:px-12 flex flex-col justify-center" style={{ background: N, minHeight: '60vh' }}>
                <div className="container mx-auto relative z-10 w-full">
                    <div className="max-w-5xl">
                        <div className="hero-line"><SectionLabel>{t('contact.protocol_label')}</SectionLabel></div>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 10vw, 5.25rem)',
                            color: '#FFFFFF', textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24
                        }}>{t('contact.hero_title')}<br /><span style={{ color: F }}>{t('contact.hero_em')}</span></h1>
                        <p className="hero-line" style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                            color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, maxWidth: 680
                        }}>{t('contact.hero_sub')}</p>
                    </div>
                </div>
            </section>

            {/* CONTACT INTERFACE */}
            <section className="py-24 px-6 md:px-12 container mx-auto section-trigger">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT */}
                    <div className="lg:col-span-5 space-y-1 section-reveal" style={{ background: 'rgba(5,11,43,0.06)' }}>
                        <div style={{ background: '#FFFFFF', padding: '48px 40px' }}>
                            <SectionLabel>{t('contact.connection_label')}</SectionLabel>
                            <p style={{
                                fontFamily: body, fontSize: 15, color: GM, lineHeight: 1.7, marginTop: 16
                            }}>
                                {t('contact.service_desc')}
                            </p>
                        </div>

                        {/* CANDIDATE BLOCK */}
                        <div style={{ background: N, padding: '48px 40px', color: '#FFFFFF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: F, display: 'inline-block' }} className="animate-pulse" />
                                <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                    {t('contact.candidate_status')}
                                </span>
                            </div>
                            <h3 style={{
                                fontFamily: brand, fontWeight: 900, fontSize: 28,
                                textTransform: 'uppercase', letterSpacing: '-0.02em',
                                color: '#FFFFFF', marginBottom: 16
                            }}>{t('contact.candidate_title')}</h3>
                            <p style={{
                                fontFamily: body, fontSize: 14,
                                color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28
                            }}>
                                {t('contact.candidate_desc')}
                            </p>
                            <a href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it"
                                style={{
                                    background: F, color: '#FFFFFF', border: 'none',
                                    padding: '14px 28px',
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer', borderRadius: 0,
                                    textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 8
                                }} className="hover:opacity-80 transition-opacity">
                                <Upload size={14} /> {t('contact.candidate_cta')}
                            </a>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="lg:col-span-7 section-reveal">
                        <div className="md:sticky md:top-32" style={{ background: '#FFFFFF', padding: '48px 40px', border: '1px solid rgba(5,11,43,0.07)' }}>
                            <SectionLabel>{t('contact.form_title')}</SectionLabel>
                            <h2 style={{
                                fontFamily: brand, fontWeight: 900, fontSize: 36,
                                color: N, textTransform: 'uppercase',
                                letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 12
                            }}>{t('contact.form_heading')}</h2>
                            <p style={{ fontFamily: body, fontSize: 13, color: GM, marginBottom: 32 }}>{t('contact.form_sub')}</p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label style={labelStyle}>{t('contact.name_label')}</label>
                                        <input type="text" placeholder="Mario Rossi" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('contact.email_label')}</label>
                                        <input type="email" placeholder="mario@azienda.ch" style={inputStyle} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label style={labelStyle}>{t('contact.company_label')}</label>
                                        <input type="text" placeholder="Azienda SA" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('contact.sector_label')}</label>
                                        <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                                            <option>{t('contact.sector_hr')}</option>
                                            <option>{t('contact.sector_dev')}</option>
                                            <option>{t('contact.sector_marketing')}</option>
                                            <option>{t('contact.sector_other')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>{t('contact.message_label')}</label>
                                    <textarea rows="5" placeholder={t('contact.message_placeholder')} style={{ ...inputStyle, resize: 'none' }} />
                                </div>

                                <button type="submit" style={{
                                    background: F, color: '#FFFFFF', border: 'none',
                                    padding: '18px', width: '100%',
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer', borderRadius: 0,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                }} className="hover:opacity-80 transition-opacity">
                                    {t('contact.submit')} <Send size={14} />
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(5,11,43,0.07)' }}>
                                    <Check size={12} style={{ color: F }} />
                                    <p style={{ fontFamily: body, fontSize: 11, color: GM }}>{t('contact.gdpr')}</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINALE */}
            <section className="py-24 px-6 md:px-12 section-reveal" style={{ background: N }}>
                <div className="container mx-auto text-center" style={{ maxWidth: 720 }}>
                    <SectionLabel color={F}><span style={{ color: F }}>{t('contact.cta_label')}</span></SectionLabel>
                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4rem)',
                        color: '#FFFFFF', textTransform: 'uppercase',
                        letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 8
                    }}>{t('contact.cta_title')}</h2>
                    <p style={{
                        fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                        color: F, lineHeight: 1.2, marginBottom: 24
                    }}>{t('contact.cta_em')}</p>
                    <p style={{
                        fontFamily: body, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6
                    }}>{t('contact.cta_sub')}</p>
                </div>
            </section>
        </div>
    );
};

export default Contact;
