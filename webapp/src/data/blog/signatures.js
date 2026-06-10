// Frasi di chiusa "firma" articolo (mail Gabriele 09/06/2026, Frasi finali Articoli.docx).
// Variante az alternativa: "Le persone giuste fanno la differenza. Se le cerchi, le trovi su JobCourier."
export const SIGNATURES = {
  cand: {
    it: ['Il prossimo lavoro potrebbe essere più vicino di quanto pensi.', 'Se lo cerchi, lo trovi su JobCourier.'],
    en: ['Your next job could be closer than you think.', 'If you look for it, you will find it on JobCourier.'],
    de: ['Ihr nächster Job könnte näher sein, als Sie denken.', 'Wer sucht, findet ihn auf JobCourier.'],
    fr: ['Votre prochain emploi est peut-être plus proche que vous ne le pensez.', 'Si vous le cherchez, vous le trouverez sur JobCourier.'],
  },
  az: {
    it: ['I candidati giusti fanno la differenza.', 'Se li cerchi, li trovi su JobCourier.'],
    en: ['The right candidates make all the difference.', 'If you look for them, you will find them on JobCourier.'],
    de: ['Die richtigen Kandidaten machen den Unterschied.', 'Wer sie sucht, findet sie auf JobCourier.'],
    fr: ['Les bons candidats font toute la différence.', 'Si vous les cherchez, vous les trouverez sur JobCourier.'],
  },
};

export function getSignature(kind, lang) {
  const s = SIGNATURES[kind];
  if (!s) return null;
  return s[lang] || s.it;
}
