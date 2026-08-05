/**
 * Loading placeholders for the offer surfaces.
 *
 * Shaped like the content they stand in for, so the layout does not jump when
 * the real data lands, and so a slow feed reads as "loading" rather than as
 * "there are no offers" — which is what a blank card looked like while the
 * upstream took several seconds to answer.
 *
 * The sweep animation lives in `index.css` as `.jc-skeleton`.
 */

export function SkeletonBar({ width = '100%', height = 12, style }) {
    return <div className="jc-skeleton" style={{ width, height, ...style }} />;
}

/**
 * "Sto caricando" as a line of text, in the same vocabulary as SectionLabel.
 *
 * Skeleton shapes alone say "something is coming" but not "we are working on it", and
 * on a slow upstream that difference is what separates waiting from leaving. The ink is
 * navy at 0.7 rather than the mid grey used for secondary text: at 11px the grey lands
 * near 3.4:1, under the 4.5:1 that small text needs.
 */
export function LoadingLabel({ children, style }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }} role="status" aria-live="polite">
            <span className="jc-loading-dot" />
            <span style={{
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(5,11,43,0.7)',
            }}>{children}</span>
        </div>
    );
}

/** One card of the home showcase slider. Mirrors the real card's layout. */
export function ShowcaseCardSkeleton() {
    return (
        <div
            className="w-[290px] md:w-[340px] shrink-0 flex-none snap-center md:h-[235px]"
            style={{
                background: '#FFFFFF',
                borderBottom: '2.5px solid var(--brand-fuchsia)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <SkeletonBar height={15} width="85%" style={{ marginBottom: 8 }} />
                    <SkeletonBar height={12} width="55%" style={{ marginBottom: 10 }} />
                    <SkeletonBar height={20} width="70%" />
                </div>
                <SkeletonBar width={64} height={64} style={{ borderRadius: 6, flexShrink: 0 }} />
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SkeletonBar height={18} width="60%" />
                <SkeletonBar height={18} width="45%" />
            </div>
        </div>
    );
}

/** One row of the offers list on `/offerte`. */
export function JobListItemSkeleton() {
    return (
        <div style={{ background: '#FFFFFF', padding: '20px 24px' }}>
            <SkeletonBar height={14} width="80%" style={{ marginBottom: 10 }} />
            <SkeletonBar height={11} width="45%" style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 6 }}>
                <SkeletonBar height={16} width={110} />
                <SkeletonBar height={16} width={80} />
            </div>
        </div>
    );
}

/**
 * The company profile on `/azienda/:id`, before the portal has answered.
 *
 * It used to be three white blocks on a `#FEFEFE` page — 1.01:1, invisible, so the page
 * read as blank and people took it for an error. This mirrors the real layout instead:
 * same 32px/36px card padding, same 84px logo tile, same row rhythm in the listings, so
 * nothing moves when the data lands.
 *
 * `name` and `logo` are passed by the pages that already know them — the company grid
 * and the home showcase both hold both. When they are there the header is real from the
 * first frame and only the listings are placeholders. Arriving from a direct URL or from
 * Google there is nothing to pass, and the header falls back to bars.
 */
export function CompanyDetailSkeleton({ labels, name, logo }) {
    const card = { background: '#FFFFFF', padding: '32px 36px' };
    const known = Boolean(name);
    const eyebrow = {
        fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
        letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)',
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6" style={card}>
                <div style={{
                    width: 84, height: 84, flexShrink: 0,
                    border: '1px solid rgba(5,11,43,0.07)', padding: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {logo
                        ? <img src={logo} alt={name} className="max-w-full max-h-full object-contain" />
                        : <SkeletonBar width="100%" height="100%" />}
                </div>

                <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                    {/* Real text, not a bar: the page should be recognisable as itself
                        while it loads, not a wall of grey rectangles. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)', display: 'inline-block' }} />
                        <span style={eyebrow}>{labels?.profile}</span>
                    </div>

                    {known ? (
                        <h1 style={{
                            fontFamily: 'var(--font-brand)', fontWeight: 900,
                            fontSize: 'clamp(22px, 4vw, 34px)',
                            color: 'var(--brand-navy)', textTransform: 'uppercase',
                            letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16,
                            wordBreak: 'break-word',
                        }}>{name}</h1>
                    ) : (
                        <>
                            <SkeletonBar height={26} width="62%" style={{ marginBottom: 10 }} />
                            <SkeletonBar height={26} width="38%" style={{ marginBottom: 18 }} />
                        </>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <SkeletonBar height={22} width={150} />
                        <SkeletonBar height={22} width={120} />
                    </div>
                </div>
            </div>

            {labels?.status && <LoadingLabel style={{ marginBottom: 24 }}>{labels.status}</LoadingLabel>}

            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)', display: 'inline-block' }} />
                    <span style={eyebrow}>{labels?.listings}</span>
                </div>

                <div className="flex flex-col" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                    {['72%', '58%', '65%'].map((w, i) => (
                        <div key={i} style={{ background: '#FFFFFF', padding: '20px 24px' }}>
                            <SkeletonBar height={14} width={w} style={{ marginBottom: 10 }} />
                            <SkeletonBar height={11} width="40%" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/** The detail pane on `/offerte`, before an offer has resolved. */
export function JobDetailSkeleton() {
    return (
        <div style={{ padding: '36px 40px' }}>
            <SkeletonBar height={11} width={140} style={{ marginBottom: 18 }} />
            <SkeletonBar height={26} width="70%" style={{ marginBottom: 12 }} />
            <SkeletonBar height={26} width="45%" style={{ marginBottom: 26 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                <SkeletonBar height={20} width={150} />
                <SkeletonBar height={20} width={120} />
                <SkeletonBar height={20} width={100} />
            </div>
            <SkeletonBar height={44} width={200} style={{ marginBottom: 36 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['100%', '96%', '88%', '94%', '70%', '92%', '60%'].map((w, i) => (
                    <SkeletonBar key={i} height={11} width={w} />
                ))}
            </div>
        </div>
    );
}
