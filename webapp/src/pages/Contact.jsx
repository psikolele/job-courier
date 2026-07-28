import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Send, ArrowRight, Check, X, BookOpen, Headphones } from 'lucide-react';
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

    const requiredMark = <span style={{ color: F }}> *</span>;

    // Interim delivery: no mail backend exists yet, so the form opens the user's
    // mail client with a prefilled message addressed to JobCourier.
    const CONTACT_EMAIL = 'laura@jobcourier.ch';

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', company: '', subject: '', message: ''
    });

    const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const subjectLabels = {
        info: t('contact.subject_info'),
        support: t('contact.subject_support'),
        collaboration: t('contact.subject_collab'),
        other: t('contact.subject_other')
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const subjectLabel = subjectLabels[form.subject] || form.subject;
        const mailSubject = `JobCourier — ${subjectLabel}`;
        const mailBody = [
            `${t('contact.name_label')}: ${form.firstName}`,
            `${t('contact.lastname_label')}: ${form.lastName}`,
            `${t('contact.email_label')}: ${form.email}`,
            `${t('contact.company_label')}: ${form.company}`,
            `${t('contact.subject_label')}: ${subjectLabel}`,
            '',
            form.message
        ].join('\n');
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
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

            {/* SEZIONE CANDIDATI */}
            <section className="py-24 px-6 md:px-12 container mx-auto section-trigger">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT: info candidati */}
                    <div className="section-reveal" style={{ borderRight: '1px solid rgba(5,11,43,0.1)', paddingRight: 0 }}>
                        <SectionLabel>{t('contact.candidates_label')}</SectionLabel>
                        <h2 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 24
                        }}>{t('contact.candidates_title')}</h2>
                        <p style={{ fontFamily: body, fontSize: 15, color: GM, lineHeight: 1.7, marginBottom: 16 }}>
                            {t('contact.candidates_intro')}
                        </p>
                        <p style={{ fontFamily: body, fontSize: 15, color: GM, lineHeight: 1.7, marginBottom: 20 }}>
                            {t('contact.candidates_selection_intro')}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {['candidates_no1', 'candidates_no2', 'candidates_no3'].map((key) => (
                                <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <X size={16} style={{ color: F, flexShrink: 0 }} />
                                    <span style={{ fontFamily: body, fontSize: 15, color: N }}>{t(`contact.${key}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* RIGHT: dos/donts + FAQ box */}
                    <div className="section-reveal space-y-8">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${F}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Check size={18} style={{ color: F }} />
                            </div>
                            <p style={{ fontFamily: body, fontSize: 15, color: N, lineHeight: 1.6, paddingTop: 10 }}>
                                {t('contact.candidates_yes')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${F}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <X size={18} style={{ color: F }} />
                            </div>
                            <p style={{ fontFamily: body, fontSize: 15, color: N, lineHeight: 1.6, paddingTop: 10 }}>
                                {t('contact.candidates_no_cv')}
                            </p>
                        </div>

                        <div style={{ background: 'rgba(226,32,109,0.08)', padding: '32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', background: 'rgba(226,32,109,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <BookOpen size={20} style={{ color: F }} />
                            </div>
                            <div>
                                <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 18, color: N, marginBottom: 8 }}>
                                    {t('contact.faq_box_title')}
                                </h3>
                                <p style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.6, marginBottom: 16 }}>
                                    {t('contact.faq_box_text')}
                                </p>
                                <Link to="/faq" style={{
                                    fontFamily: brand, fontWeight: 700, fontSize: 12,
                                    letterSpacing: '0.1em', textTransform: 'uppercase', color: F,
                                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8
                                }}>
                                    {t('contact.faq_cta')} <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEZIONE AZIENDE / FORM */}
            <section className="py-24 px-6 md:px-12 section-trigger" style={{ background: '#FFFFFF' }}>
                <div className="container mx-auto section-reveal" style={{ maxWidth: 900 }}>
                    <SectionLabel>{t('contact.companies_label')}</SectionLabel>
                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                        color: N, textTransform: 'uppercase',
                        letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16
                    }}>{t('contact.companies_title')}</h2>
                    <p style={{ fontFamily: body, fontSize: 15, color: GM, lineHeight: 1.7, marginBottom: 40, maxWidth: 640 }}>
                        {t('contact.companies_intro')}
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contact-first-name" style={labelStyle}>{t('contact.name_label')}{requiredMark}</label>
                                <input id="contact-first-name" name="firstName" type="text" required value={form.firstName} onChange={updateField('firstName')} placeholder={t('contact.name_placeholder')} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="contact-last-name" style={labelStyle}>{t('contact.lastname_label')}{requiredMark}</label>
                                <input id="contact-last-name" name="lastName" type="text" required value={form.lastName} onChange={updateField('lastName')} placeholder={t('contact.lastname_placeholder')} style={inputStyle} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contact-email" style={labelStyle}>{t('contact.email_label')}{requiredMark}</label>
                                <input id="contact-email" name="email" type="email" required value={form.email} onChange={updateField('email')} placeholder={t('contact.email_placeholder')} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="contact-company" style={labelStyle}>{t('contact.company_label')}</label>
                                <input id="contact-company" name="company" type="text" value={form.company} onChange={updateField('company')} placeholder={t('contact.company_placeholder')} style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contact-subject" style={labelStyle}>{t('contact.subject_label')}{requiredMark}</label>
                            <select id="contact-subject" name="subject" required value={form.subject} onChange={updateField('subject')} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                                <option value="" disabled>{t('contact.subject_placeholder')}</option>
                                <option value="info">{t('contact.subject_info')}</option>
                                <option value="support">{t('contact.subject_support')}</option>
                                <option value="collaboration">{t('contact.subject_collab')}</option>
                                <option value="other">{t('contact.subject_other')}</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="contact-message" style={labelStyle}>{t('contact.message_label')}{requiredMark}</label>
                            <textarea id="contact-message" name="message" rows="5" required value={form.message} onChange={updateField('message')} placeholder={t('contact.message_placeholder')} style={{ ...inputStyle, resize: 'none' }} />
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

                        <p style={{ fontFamily: body, fontSize: 12, color: GM }}>
                            {t('contact.gdpr_prefix')} <Link to="/cookie-policy" style={{ color: F, textDecoration: 'underline' }}>{t('contact.gdpr_link')}</Link>
                        </p>
                    </form>
                </div>
            </section>

            {/* FOOTER CTA */}
            <section className="px-6 md:px-12 section-reveal" style={{ background: 'rgba(226,32,109,0.08)' }}>
                <div className="container mx-auto py-12" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', background: 'rgba(226,32,109,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Headphones size={24} style={{ color: F }} />
                        </div>
                        <div>
                            <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 20, color: N, marginBottom: 4 }}>
                                {t('contact.final_title')}
                            </h3>
                            <p style={{ fontFamily: body, fontSize: 14, color: GM }}>
                                {t('contact.final_text')}
                            </p>
                        </div>
                    </div>
                    <Link to="/faq" style={{
                        background: 'transparent', color: N, border: `1.5px solid ${N}`,
                        padding: '14px 28px',
                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        textDecoration: 'none', flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', gap: 8
                    }} className="hover:opacity-70 transition-opacity">
                        {t('contact.final_cta')} <ArrowRight size={14} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Contact;
