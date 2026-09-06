// Has this <ins> actually been given an ad?
//
// Height alone does not answer that. A responsive unit in a wide column is sized
// by AdSense the moment it is claimed — measured on production 06.09: both offer-
// detail units stood at 280px with no iframe inside and no data-ad-status, i.e.
// reserved but not served. Treating that as "filled" draws the dashed frame and
// the ANNUNCIO label over 280px of nothing, which is the empty labelled frame
// fixed on 04.09, reappearing on a different path.
//
// So require positive proof, and read absence as absence:
//   - 'unfilled' is Google saying no. Believe it.
//   - 'filled' is Google saying yes.
//   - no verdict yet: only a rendered iframe with real height counts.
export const isAdFilled = (ins) => {
    if (!ins) return false;

    const status = typeof ins.getAttribute === 'function' ? ins.getAttribute('data-ad-status') : null;
    if (status === 'unfilled') return false;
    if (status === 'filled') return true;

    const iframe = typeof ins.querySelector === 'function' ? ins.querySelector('iframe') : null;
    return Boolean(iframe) && (iframe.offsetHeight || 0) > 20;
};
