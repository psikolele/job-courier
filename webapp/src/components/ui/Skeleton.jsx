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
