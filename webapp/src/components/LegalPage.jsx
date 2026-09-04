import React from 'react';
import { useTranslation } from 'react-i18next';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

/**
 * Shell for the two legal pages. Their copy used to be hardcoded Italian JSX,
 * so switching language left the whole terms/cookie body untranslated. The copy
 * now lives in the locale files as a list of blocks, which is the only shape
 * that survives translation: paragraph counts and headings differ per language,
 * and one key per <P> would have frozen the Italian structure into the others.
 *
 * Block text is rendered as HTML because the legal copy carries inline links,
 * <strong> and <code>. The source is our own bundled locale JSON — never user
 * input, never fetched — so there is nothing here for an injection to come from.
 * Anything dynamic (the Cookiebot declaration) is a `widget` block resolved
 * through `widgets`, not markup in a string.
 */
// createElement rather than JSX: the tag varies per block, and the repo's lint
// config does not count a JSX-only reference as a use of the variable.
const Html = ({ tag, style, html }) =>
    React.createElement(tag, { style, dangerouslySetInnerHTML: { __html: html } });

const Block = ({ block, widgets }) => {
    switch (block.type) {
        case 'h2':
            return <Html tag="h2" html={block.text} style={{
                fontFamily: brand, fontWeight: 900, fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', color: N,
                textTransform: 'uppercase', letterSpacing: '-0.01em', marginTop: 48, marginBottom: 16
            }} />;
        case 'h3':
            return <Html tag="h3" html={block.text} style={{
                fontFamily: brand, fontWeight: 700, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: N, marginTop: 28, marginBottom: 10
            }} />;
        case 'rule':
            return <div style={{ width: 48, height: 3, background: F, marginBottom: 32, marginTop: 8 }} />;
        case 'ul':
        case 'ol': {
            const List = block.type === 'ol' ? 'ol' : 'ul';
            return (
                <List style={{
                    fontFamily: body, fontSize: '1rem', lineHeight: 1.75, color: GM,
                    marginBottom: 16, paddingLeft: 24,
                    listStyleType: block.type === 'ol' ? 'decimal' : 'disc'
                }}>
                    {(block.items || []).map((item, i) => (
                        <Html key={i} tag="li" html={item}
                            style={{ marginBottom: 6, overflowWrap: 'break-word', wordBreak: 'break-word' }} />
                    ))}
                </List>
            );
        }
        case 'widget':
            return <div style={{ marginBottom: 24 }}>{widgets?.[block.name] ?? null}</div>;
        default:
            return <Html tag="p" html={block.text} style={{
                fontFamily: body, fontSize: '1rem', lineHeight: 1.75, color: GM, marginBottom: 16
            }} />;
    }
};

const LegalPage = ({ contentKey, seo, widgets }) => {
    const { t } = useTranslation();
    const blocks = t(`${contentKey}.blocks`, { returnObjects: true });
    const list = Array.isArray(blocks) ? blocks : [];

    return (
        <div className="min-h-screen overflow-x-hidden legal-page" style={{ background: GL }}>
            {seo}
            <section className="relative min-h-[40vh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
                <div className="container mx-auto w-full">
                    <div className="max-w-3xl">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                            <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                {t('legal.eyebrow')}
                            </span>
                        </div>
                        <h1 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                            color: 'var(--brand-white)', textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24
                        }}>
                            {t(`${contentKey}.title_top`)}<br />
                            <span style={{ color: F }}>{t(`${contentKey}.title_accent`)}</span>
                        </h1>
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                            {t(`${contentKey}.subtitle`)}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12" style={{ background: 'var(--brand-white)' }}>
                <div className="container mx-auto max-w-3xl">
                    {list.map((block, i) => <Block key={i} block={block} widgets={widgets} />)}
                    {/* The Italian text is the one the company is bound by; the other
                        three are a courtesy translation and say so. */}
                    <p style={{ fontFamily: body, fontSize: 13, lineHeight: 1.7, color: GM, marginTop: 48, opacity: 0.8 }}>
                        {t('legal.prevailing')}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default LegalPage;
