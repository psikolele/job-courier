import { describe, it, expect } from 'vitest';

import { assessScan, countRemoved, MAX_FAILED_RATIO } from './_assess-orphan-scan.mjs';
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

describe('assessScan', () => {
  it('accetta una corsa sana', () => {
    expect(assessScan(healthy(), healthy().names)).toBeNull();
  });

  it('rifiuta una scansione che non ha consumato il budget di pagine', () => {
    const reason = assessScan(healthy({ pagesRequested: 12 }), []);
    expect(reason).toMatch(/listing non sta rispondendo/);
  });

  it('rifiuta quando troppe pagine sono fallite', () => {
    const reason = assessScan(healthy({ pagesFailed: 25 }), []);
    expect(reason).toMatch(/pagine fallite/);
  });

  it('rifiuta quando troppi dettagli sono falliti', () => {
    const reason = assessScan(healthy({ detailsRequested: 10, detailsFailed: 3 }), []);
    expect(reason).toMatch(/dettagli falliti/);
  });

  // La soglia è "oltre", non "a partire da". Un rapporto esattamente a 0.2 è il confine
  // atteso in una corsa che ha perso qualcosa senza essere degradata, e bocciarlo
  // congelerebbe il file per un guasto che non c'è.
  it('lascia passare un rapporto esattamente alla soglia', () => {
    expect(assessScan(healthy({ pagesFailed: DEFAULT_PAGES * MAX_FAILED_RATIO }), [])).toBeNull();
    expect(assessScan(healthy({ detailsRequested: 10, detailsFailed: 10 * MAX_FAILED_RATIO }), [])).toBeNull();
  });

  // `0/0` è `NaN`, e ogni confronto con `NaN` è falso: senza la guardia sul budget pagine
  // una scansione che non ha chiesto niente supererebbe entrambi i rapporti indisturbata.
  it('non lascia passare una scansione che non ha chiesto nulla', () => {
    const reason = assessScan(
      healthy({ pagesRequested: 0, detailsRequested: 0, names: [] }),
      []
    );
    expect(reason).toMatch(/listing non sta rispondendo/);
  });

  it('rifiuta una lista troncata dal tetto sui dettagli', () => {
    expect(assessScan(healthy({ truncated: true }), [])).toMatch(/troncata/);
  });

  it('rifiuta una lista vuota', () => {
    expect(assessScan(healthy({ names: [] }), [])).toMatch(/sospetto scansione fallita/);
  });

  // L'ordine conta: una lista vuota è il sintomo comune di tutti i guasti sopra, quindi se
  // fosse controllata per prima maschererebbe la diagnosi vera.
  it('diagnostica il portale muto, non la lista vuota', () => {
    const reason = assessScan(healthy({ names: [], pagesRequested: 12 }), []);
    expect(reason).toMatch(/listing non sta rispondendo/);
  });

  describe('calo rispetto ai datori già committati', () => {
    const committed = ['alpha', 'beta', 'gamma', 'delta'];

    it('rifiuta un calo su una corsa che ha perso qualcosa', () => {
      const reason = assessScan(
        healthy({ names: ['alpha', 'beta'], detailsRequested: 10, detailsFailed: 1 }),
        committed
      );
      expect(reason).toMatch(/calo non distinguibile dalle perdite/);
    });

    // Un calo su una corsa pulita è una notizia vera: qualcuno ha agganciato i suoi annunci
    // all'anagrafica, oppure ha smesso di pubblicare. Bocciarlo terrebbe in vetrina un
    // datore che non assume più.
    it('accetta un calo su una corsa senza perdite', () => {
      expect(assessScan(healthy({ names: ['alpha', 'beta'] }), committed)).toBeNull();
    });

    it('accetta una lista che cresce anche se la corsa ha perso qualcosa', () => {
      const scan = healthy({
        names: [...committed, 'epsilon'],
        detailsRequested: 10,
        detailsFailed: 1,
      });
      expect(assessScan(scan, committed)).toBeNull();
    });

    // Il caso che una misura sulla sola lunghezza non vede: un datore esce, un altro entra,
    // il conto torna. Su una corsa con perdite l'uscita è indistinguibile da una perdita.
    it('rifiuta un ricambio a somma zero su una corsa con perdite', () => {
      const scan = healthy({ names: ['alpha', 'beta', 'gamma', 'nuovo'], pagesFailed: 1 });
      expect(assessScan(scan, committed)).toMatch(/1 datori spariti/);
    });

    it('non ha nulla da confrontare alla prima esecuzione', () => {
      expect(assessScan(healthy({ names: ['alpha'], pagesFailed: 1 }), [])).toBeNull();
      expect(assessScan(healthy({ names: ['alpha'], pagesFailed: 1 }), undefined)).toBeNull();
    });
  });
});
