import i18n from '../i18n';

/**
 * Porta la lingua corrente del sito sui link verso il portale jobroom.
 *
 * Gli URL nel codice sono scritti con `lan=it&language=it`; questo helper
 * sostituisce i due codici con la lingua attiva, così chi naviga in tedesco
 * non atterra sul portale in italiano.
 *
 * jobroom accetta it | en | de | fr su entrambi i parametri (verificato il
 * 30.07.2026 caricando job-seekers.php con lan=de: risponde in tedesco).
 *
 * Legge `i18n.language` alla chiamata, quindi va invocato durante il render:
 * i componenti che usano useTranslation si ri-renderizzano al cambio lingua
 * e l'href viene ricalcolato.
 */
export const jobroomLang = (url) => {
  const lang = (i18n.language || 'it').slice(0, 2);
  const supported = ['it', 'en', 'de', 'fr'];
  const target = supported.includes(lang) ? lang : 'it';
  return url.replace('lan=it&language=it', `lan=${target}&language=${target}`);
};

export default jobroomLang;
