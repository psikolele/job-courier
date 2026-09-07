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
    // The polling window below has closed without an ad arriving. Until it does,
    // the unit keeps the height AdSense reserved for it: collapsing a slot that
    // is still being decided would hand Google a zero-height target, and it does
    // not fill what nobody can see. After it, the reserved height is just a hole
    // in the page — measured on production 07.09, 280px of nothing at the foot
    // of the offer list, on a unit that never received an ad.
    const [scaduto, setScaduto] = useState(false);
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
        // appending an iframe, sometimes before it writes data-ad-status. That
        // iframe is a direct child, so no subtree — with it every animation and
        // lazy asset inside the creative would re-run this check for the life of
        // the unit, for nothing.
        attributi.observe(ins, { attributes: true, childList: true, attributeFilter: ['data-ad-status', 'data-adsbygoogle-status', 'style', 'class'] });
        const dimensione = typeof ResizeObserver === 'function' ? new ResizeObserver(valuta) : null;
        if (dimensione) dimensione.observe(ins);

        // The usual fill lands before either observer has anything to report, so
        // poll briefly as well — then stop polling, not watching.
        const sonda = setInterval(valuta, 400);
        const fineSonda = setTimeout(() => {
            clearInterval(sonda);
            // Stop polling, keep watching, and let the frame collapse if nothing
            // came. The observers above stay connected, so an ad that lands late
            // still reopens it.
            setScaduto(true);
        }, 6000);

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

    // The frame carries no side padding, and that is deliberate. AdSense sizes a
    // creative from the *container's* width and pays no attention to the padding
    // inside it, so any horizontal padding here comes back as overflow of twice
    // its width. Measured on production 07.09: 16px a side gave a 773px creative
    // in a 742px unit, hanging over the dashed rule and out to the column edge —
    // which is what made the ad look misaligned against the cards above it.
    // Reserving the padding in both states did not help either, for the same
    // reason: it is the container AdSense reads, not the <ins>. With no side
    // padding the width it measures is the width the unit keeps. The label below
    // carries its own inset instead, and `overflow` is the backstop.
    const scatola = {
        boxSizing: 'border-box',
        border: '1px dashed transparent',
        overflow: 'hidden',
    };

    return (
        <div
            ref={slotRef}
            aria-label={pieno ? t('ads.label') : undefined}
            aria-hidden={pieno ? undefined : true}
            style={pieno ? {
                ...scatola,
                // Deliberately not the card's white: an ad in the list has to be
                // visibly a different surface at a glance, before the label is
                // read. A dashed rule says "not a card" even in greyscale.
                background: 'rgba(5,11,43,0.045)',
                borderColor: 'rgba(5,11,43,0.20)',
                paddingTop: 12,
                paddingBottom: 16,
                // In the list the only thing between an ad and the cards either
                // side of it was the column's 4px gap, which read as one more
                // card in the stack. A little air is what separates "next in the
                // list" from "not part of the list".
                margin: isCard ? '8px 0' : '24px 0'
            } : {
                ...scatola,
                // No ad (yet): no frame, no label. The <ins> still has to be in
                // the DOM and full width for AdSense to fill it, so the height it
                // reserved for itself is clipped away rather than removed — and
                // only once the window above has closed.
                //
                // The collapse is deliberately instant. Animating it would mean
                // starting from a concrete max-height, and a unit AdSense
                // reserved taller than that guess would be cropped while it is
                // still live. One reflow inside the first seconds, on a slot
                // most readers have not scrolled to, is the cheaper trade.
                background: 'none', paddingTop: 0, paddingBottom: 0, margin: 0,
                maxHeight: scaduto ? 0 : undefined
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
                marginBottom: 8,
                // The frame has no side padding — see `scatola` — so the label
                // insets itself rather than sitting against the dashed rule.
                paddingLeft: isCard ? 24 : 16,
                paddingRight: isCard ? 24 : 16
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
