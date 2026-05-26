import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send, ArrowRight, Check } from 'lucide-react';
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

    const contactInfo = [
        { icon: <Phone size={18} />, label: t('contact.phone_label'), value: '+41 91 210 89 92', sub: t('contact.phone_hours') },
        { icon: <Mail size={18} />, label: t('contact.email_label'), value: 'sales@jobcourier.ch', sub: t('contact.email_sub') },
        { icon: <MapPin size={18} />, label: t('contact.hq_label'), value: 'Via delle Fornaci, 6', sub: '6826 Riva San Vitale, CH' }
    ];

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
                        <p className="hero-line" style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 28,
                            color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.2
                        }}>{t('contact.hero_sub')}</p>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 10vw, 5.25rem)',
                            color: '#FFFFFF', textTransform: 'uppercase',
                            letterSpacing: '-0.03em', lineHeight: 0.88, marginBottom: 6
                        }}>{t('contact.hero_title')}</h1>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 10vw, 5.25rem)',
                            color: F, textTransform: 'uppercase',
                            letterSpacing: '-0.03em', lineHeight: 0.88
                        }}>{t('contact.hero_em')}</h1>
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

                            <div className="space-y-10 mt-8">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="group flex items-start gap-5">
                                        <div className="flex items-center justify-center transition-colors" style={{
                                            width: 40, height: 40,
                                            background: GL,
                                            color: F,
                                            flexShrink: 0
                                        }}>
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: GM, marginBottom: 4 }}>{info.label}</p>
                                            <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 18, color: N, marginBottom: 2 }}>{info.value}</p>
                                            <p style={{ fontFamily: body, fontSize: 12, color: GM }}>{info.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(5,11,43,0.07)' }}>
                                <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 16, color: GM, lineHeight: 1.5 }}>
                                    {t('contact.service_quote')}
                                </p>
                            </div>
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
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.16em', textTransform: 'uppercase',
                                    color: F, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 8
                                }} className="hover:opacity-80 transition-opacity">
                                {t('contact.register_portal')} →
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
                            }}>Scrivici.</h2>
                            <p style={{ fontFamily: body, fontSize: 13, color: GM, marginBottom: 32 }}>{t('contact.form_sub')}</p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label style={labelStyle}>{t('contact.name_label')}</label>
                                        <input type="text" placeholder="John Doe" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('contact.email_label')}</label>
                                        <input type="email" placeholder="john@company.ch" style={inputStyle} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label style={labelStyle}>{t('contact.company_label')}</label>
                                        <input type="text" placeholder="Your Co. Ltd" style={inputStyle} />
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

            {/* LOCATION */}
            <section className="py-24 px-6 md:px-12 section-reveal" style={{ background: '#FFFFFF' }}>
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
                        <div>
                            <SectionLabel>{t('contact.hq_label')}</SectionLabel>
                            <h2 style={{
                                fontFamily: brand, fontWeight: 900, fontSize: 64,
                                color: N, textTransform: 'uppercase',
                                letterSpacing: '-0.03em', lineHeight: 0.9, marginBottom: 8
                            }}>{t('contact.location_title')}</h2>
                            <p style={{
                                fontFamily: editorial, fontStyle: 'italic', fontSize: 32,
                                color: F, lineHeight: 1.1, marginBottom: 28
                            }}>{t('contact.location_em')}</p>
                            <p style={{ fontFamily: body, fontSize: 16, color: GM, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
                                {t('contact.location_sub')}
                            </p>
                            <a href="https://www.google.com/maps/search/Via+delle+Fornaci+6+6826+Riva+San+Vitale" target="_blank" rel="noreferrer"
                                style={{
                                    background: N, color: '#FFFFFF', border: 'none',
                                    padding: '14px 28px',
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer', borderRadius: 0,
                                    textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 8
                                }} className="hover:opacity-80 transition-opacity">
                                {t('contact.open_map')} →
                            </a>
                        </div>
                        <div className="relative aspect-video overflow-hidden group" style={{ border: '1px solid rgba(5,11,43,0.07)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2670"
                                alt="Location"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
