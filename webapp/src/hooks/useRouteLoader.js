import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Durata del loader di transizione (ms). Costante singola e facile da tarare.
 * NOTA: 2400ms a ogni cambio pagina è volutamente lento (salita testo + 2
 * battiti, come da design approvato). Ridurre qui se risulta troppo lungo.
 */
export const LOADER_DURATION_MS = 2400;

/**
 * Mostra il loader a ogni cambio di pathname (e al primo caricamento) per una
 * durata fissa, poi lo nasconde. Ritorna un booleano di visibilità.
 */
export default function useRouteLoader(duration = LOADER_DURATION_MS) {
  const { pathname } = useLocation();
  // `hiddenPath` = ultimo pathname per cui il loader ha finito. La visibilità
  // è derivata (pathname !== hiddenPath): così non chiamiamo setState in modo
  // sincrono dentro l'effect. Lo setState avviene solo async nel timer.
  const [hiddenPath, setHiddenPath] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHiddenPath(pathname), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, duration]);

  return pathname !== hiddenPath;
}
