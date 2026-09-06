import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AD_SLOTS } from '../config/ads';
import { isAdFilled } from '../utils/adFill';

const GM = 'var(--brand-gray-mid)';
const body = 'var(--font-body)';

/**
 * One AdSense display unit.
 *
 * This used to be a mockup that drew a box reading "AdSense Placeholder" — it
 * never carried an ad. It now renders a real `<ins class="adsbygoogle">`, and
 * only when the placement has an ad-unit id in config/ads.js. Without one it
 * renders nothing: an empty labelled box is a fake ad, and a fake ad shaped
 * like a job card is precisely what gets an account suspended.
 *
 * On placement inside the offer list (`variant="card"`) it takes the width and
 * rhythm of a card so the page still reads as one column, but never its skin:
 * grey ground instead of white, no left accent bar, no hover, and a permanent
 * "Annuncio" label above the unit. Google's policy is that an ad may sit near
 * content but must not be mistakable for it; matching a card exactly and
 * relying on the label alone is the arrangement they act on.
 *
 * Props:
 *   name: key into AD_SLOTS — the placement, not the unit id
 *   variant: 'card' (in the list) | 'banner' (page-width, short)
 */
const AdSlot = ({ name, variant = 'banner' }) => {
    const { t } = useTranslation();
    const slotRef = useRef(null);
    const insRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    // 'attesa' until we know whether Google actually returned an ad. Never assume
    // it will: the unit stays empty for anyone who refused marketing cookies, and
    // for any request Google chooses not to fill.
    const [stato, setStato] = useState('attesa');
    const adUnitId = AD_SLOTS[name] || '';

    // Mount the unit only once it is near the viewport: the list can hold
    // several of these, and requesting them all up front costs the candidate
    // bandwidth for ads they may never scroll to.
    useEffect(() => {
        if (!adUnitId) return undefined;
        const el = slotRef.current;
        if (!el) return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '200px' });

        observer.observe(el);
        return () => observer.disconnect();
    }, [adUnitId]);

    // Hand the unit to AdSense once, after it is in the DOM. The script itself
    // is loaded by AdsenseGate behind Cookiebot's marketing consent, so this
    // push can happen before the script exists — the queue is drained later.
    useEffect(() => {
        if (!isVisible || !insRef.current) return undefined;
        const ins = insRef.current;
        if (!ins.getAttribute('data-adsbygoogle-status')) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch {
                /* consent refused or the script was blocked — the poll below collapses the slot */
            }
        }

        // Collapse the frame unless an ad really arrived. Without this the page
        // shows an "Annuncio" label over 100px of nothing to every visitor who
        // declined marketing cookies — measured on production, 04.09. An empty
        // labelled frame is worse than no frame: it reads as a broken ad.
        //
        // 'vuoto' is a display state, never a verdict. Consent can be granted
        // minutes after load, and AdSense then fills the <ins> that is still
        // mounted: if we stopped watching at that point the ad would render with
        // no label and no border, which is precisely the unlabelled in-feed ad
        // this component exists to prevent.
        const valuta = () => setStato(isAdFilled(ins) ? 'pieno' : 'vuoto');

        const attributi = new MutationObserver(valuta);
        // childList matters as much as the attributes: AdSense signals a fill by
        // appending an iframe, sometimes before it writes data-ad-status.
        attributi.observe(ins, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-ad-status', 'data-adsbygoogle-status', 'style', 'class'] });
        const dimensione = typeof ResizeObserver === 'function' ? new ResizeObserver(valuta) : null;
        if (dimensione) dimensione.observe(ins);

        // The usual fill lands before either observer has anything to report, so
        // poll briefly as well — then stop polling, not watching.
        const sonda = setInterval(valuta, 400);
        const fineSonda = setTimeout(() => clearInterval(sonda), 6000);

        return () => {
            attributi.disconnect();
            if (dimensione) dimensione.disconnect();
            clearInterval(sonda);
            clearTimeout(fineSonda);
        };
    }, [isVisible]);

    if (!adUnitId) return null;

    const isCard = variant === 'card';

    const pieno = stato === 'pieno';

    return (
        <div
            ref={slotRef}
            aria-label={pieno ? t('ads.label') : undefined}
            aria-hidden={pieno ? undefined : true}
            style={pieno ? {
                // Deliberately not the card's white: an ad in the list has to be
                // visibly a different surface at a glance, before the label is
                // read. A dashed rule says "not a card" even in greyscale.
                background: 'rgba(5,11,43,0.045)',
                border: '1px dashed rgba(5,11,43,0.20)',
                padding: isCard ? '12px 24px 16px' : '12px 16px 16px',
                margin: isCard ? 0 : '24px 0'
            } : {
                // No ad (yet): no frame, no label, no reserved height. The <ins>
                // still has to be in the DOM and full-width for AdSense to fill it.
                background: 'none', border: 'none', padding: 0, margin: 0
            }}
        >
            {/* The label sits outside the unit — never inside, where the
                advertiser's own creative could cover it — and only once there is
                an ad to label. */}
            {pieno && <span style={{
                display: 'block',
                fontFamily: body,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: GM,
                marginBottom: 8
            }}>
                {t('ads.label')}
            </span>}

            {isVisible && (
                <ins
                    ref={insRef}
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', minHeight: pieno ? (isCard ? 100 : 90) : 0 }}
                    data-ad-client="ca-pub-4406252930350703"
                    data-ad-slot={adUnitId}
                    // Every unit is a responsive display unit ("Adattabile"), so
                    // the format is 'auto' for all three — matching the snippet
                    // AdSense generated. 'fluid' belongs to in-feed units, which
                    // we deliberately did not create: their whole purpose is to
                    // take on the surrounding cards' look.
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            )}
        </div>
    );
};

export default AdSlot;
