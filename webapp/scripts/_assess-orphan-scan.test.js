import { describe, it, expect } from 'vitest';

import { assessScan, MAX_FAILED_RATIO, CLEAN_ZERO_THRESHOLD } from './_assess-orphan-scan.mjs';
import { DEFAULT_PAGES } from '../api/_orphan-employers.js';

/** Una corsa sana: budget pagine consumato per intero, nessuna perdita, sei datori. */
const healthy = (overrides = {}) => ({
  names: ['dinamic hub', 'er services', 'finders', 'gi group', 'michael bailey', 'team personnel'],
  pagesRequested: DEFAULT_PAGES,
  pagesFailed: 0,
  detailsRequested: 6,
  detailsFailed: 0,
  truncated: false,
  ...overrides,
});

/** Assert helpers so each test reads as "reject with this reason" / "accept". */
const reject = (scan, committed = [], streak = 0) => {
  const verdict = assessScan(scan, committed, streak);
  expect(verdict.reason).not.toBeNull();
  return verdict;
};
const accept = (scan, committed = [], streak = 0) => {
  const verdict = assessScan(scan, committed, streak);
  expect(verdict.reason).toBeNull();
  return verdict;
};

describe('assessScan', () => {
  it('accetta una corsa sana', () => {
    const verdict = accept(healthy(), healthy().names);
    expect(verdict.pending).toBe(false);
    expect(verdict.consecutiveCleanZero).toBe(0);
  });

  it('rifiuta una scansione che non ha consumato il budget di pagine', () => {
    const verdict = reject(healthy({ pagesRequested: 12 }), []);
    expect(verdict.reason).toMatch(/listing non sta rispondendo/);
    expect(verdict.pending).toBe(false);
    expect(verdict.consecutiveCleanZero).toBe(0);
  });

  it('rifiuta quando troppe pagine sono fallite', () => {
    expect(reject(healthy({ pagesFailed: 25 }), []).reason).toMatch(/pagine fallite/);
  });

  it('rifiuta quando troppi dettagli sono falliti', () => {
    expect(reject(healthy({ detailsRequested: 10, detailsFailed: 3 }), []).reason).toMatch(/dettagli falliti/);
  });

  // La soglia è "oltre", non "a partire da". Un rapporto esattamente a 0.2 è il confine
  // atteso in una corsa che ha perso qualcosa senza essere degradata, e bocciarlo
  // congelerebbe il file per un guasto che non c'è.
  it('lascia passare un rapporto esattamente alla soglia', () => {
    accept(healthy({ pagesFailed: DEFAULT_PAGES * MAX_FAILED_RATIO }), []);
    accept(healthy({ detailsRequested: 10, detailsFailed: 10 * MAX_FAILED_RATIO }), []);
  });

  // `0/0` è `NaN`, e ogni confronto con `NaN` è falso: senza la guardia sul budget pagine
  // una scansione che non ha chiesto niente supererebbe entrambi i rapporti indisturbata.
  it('non lascia passare una scansione che non ha chiesto nulla', () => {
    const verdict = reject(
      healthy({ pagesRequested: 0, detailsRequested: 0, names: [] }),
      []
    );
    expect(verdict.reason).toMatch(/listing non sta rispondendo/);
  });

  it('rifiuta una lista troncata dal tetto sui dettagli', () => {
    expect(reject(healthy({ truncated: true }), []).reason).toMatch(/troncata/);
  });

  it('rifiuta subito una lista vuota non pulita, senza far crescere il conteggio', () => {
    // Fallimenti presenti insieme allo zero: nessun credito di serie, è esattamente la
    // forma che una scansione rotta produrrebbe.
    const verdict = reject(healthy({ names: [], pagesFailed: 1 }), [], 1);
    expect(verdict.reason).toMatch(/sospetto scansione fallita/);
    expect(verdict.pending).toBe(false);
    expect(verdict.consecutiveCleanZero).toBe(0);
  });

  // L'ordine conta: una lista vuota è il sintomo comune di tutti i guasti sopra, quindi se
  // fosse controllata per prima maschererebbe la diagnosi vera.
  it('diagnostica il portale muto, non la lista vuota', () => {
    const verdict = reject(healthy({ names: [], pagesRequested: 12 }), []);
    expect(verdict.reason).toMatch(/listing non sta rispondendo/);
  });

  describe('serie di zeri puliti (CLEAN_ZERO_THRESHOLD)', () => {
    // Una corsa pulita: budget pieno, zero pagine fallite, zero dettagli falliti, non
    // troncata — esattamente le condizioni per cui una scansione rotta non è una spiegazione
    // plausibile.
    const cleanZero = () => healthy({ names: [] });

    it('la prima corsa pulita a zero resta in attesa, non accettata', () => {
      const verdict = assessScan(cleanZero(), ['finders sa'], 0);
      expect(verdict.reason).not.toBeNull();
      expect(verdict.pending).toBe(true);
      expect(verdict.consecutiveCleanZero).toBe(1);
      expect(verdict.reason).toMatch(/1\/3/);
    });

    it('la seconda corsa pulita a zero di fila resta in attesa', () => {
      const verdict = assessScan(cleanZero(), ['finders sa'], 1);
      expect(verdict.pending).toBe(true);
      expect(verdict.consecutiveCleanZero).toBe(2);
      expect(verdict.reason).toMatch(/2\/3/);
    });

    it('la terza corsa pulita a zero di fila viene accettata e il contatore torna a 0', () => {
      const verdict = assessScan(cleanZero(), ['finders sa'], 2);
      expect(verdict.reason).toBeNull();
      expect(verdict.pending).toBe(false);
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('accetta oltre soglia e riazzera comunque il contatore (nessuna crescita infinita)', () => {
      const verdict = assessScan(cleanZero(), ['finders sa'], CLEAN_ZERO_THRESHOLD + 5);
      expect(verdict.reason).toBeNull();
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('un risultato non vuoto azzera un conteggio di zeri puliti in corso', () => {
      const verdict = assessScan(healthy({ names: ['finders sa'] }), ['finders sa'], 2);
      expect(verdict.reason).toBeNull();
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('uno zero sporco (pagine fallite) azzera un conteggio di zeri puliti in corso', () => {
      const verdict = assessScan(healthy({ names: [], pagesFailed: 1 }), ['finders sa'], 2);
      expect(verdict.reason).toMatch(/sospetto scansione fallita/);
      expect(verdict.pending).toBe(false);
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('uno zero sporco (dettagli falliti) azzera un conteggio di zeri puliti in corso', () => {
      const verdict = assessScan(
        healthy({ names: [], detailsRequested: 2, detailsFailed: 1 }),
        ['finders sa'],
        2
      );
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('uno zero troncato azzera un conteggio di zeri puliti in corso', () => {
      const verdict = assessScan(healthy({ names: [], truncated: true }), ['finders sa'], 2);
      expect(verdict.consecutiveCleanZero).toBe(0);
    });

    it('una scansione che non consuma il budget pagine azzera un conteggio in corso', () => {
      const verdict = assessScan(healthy({ names: [], pagesRequested: 12 }), ['finders sa'], 2);
      expect(verdict.consecutiveCleanZero).toBe(0);
    });
  });

  describe('calo rispetto ai datori già committati', () => {
    const committed = ['alpha', 'beta', 'gamma', 'delta'];

    it('rifiuta un calo su una corsa che ha perso qualcosa', () => {
      const verdict = reject(
        healthy({ names: ['alpha', 'beta'], detailsRequested: 10, detailsFailed: 1 }),
        committed
      );
      expect(verdict.reason).toMatch(/calo non distinguibile dalle perdite/);
    });

    // Un calo su una corsa pulita è una notizia vera: qualcuno ha agganciato i suoi annunci
    // all'anagrafica, oppure ha smesso di pubblicare. Bocciarlo terrebbe in vetrina un
    // datore che non assume più.
    it('accetta un calo su una corsa senza perdite', () => {
      accept(healthy({ names: ['alpha', 'beta'] }), committed);
    });

    it('accetta una lista che cresce anche se la corsa ha perso qualcosa', () => {
      const scan = healthy({
        names: [...committed, 'epsilon'],
        detailsRequested: 10,
        detailsFailed: 1,
      });
      accept(scan, committed);
    });

    // Il caso che una misura sulla sola lunghezza non vede: un datore esce, un altro entra,
    // il conto torna. Su una corsa con perdite l'uscita è indistinguibile da una perdita.
    it('rifiuta un ricambio a somma zero su una corsa con perdite', () => {
      const scan = healthy({ names: ['alpha', 'beta', 'gamma', 'nuovo'], pagesFailed: 1 });
      expect(reject(scan, committed).reason).toMatch(/1 datori spariti/);
    });

    it('non ha nulla da confrontare alla prima esecuzione', () => {
      accept(healthy({ names: ['alpha'], pagesFailed: 1 }), []);
      accept(healthy({ names: ['alpha'], pagesFailed: 1 }), undefined);
    });
  });
});
