const STORAGE_KEY = 'jc_return_url';
const JOBROOM_HOST = 'jobroom.jobcourier.ch';

export function saveReturnUrl() {
  const url = window.location.pathname + window.location.search + window.location.hash;
  sessionStorage.setItem(STORAGE_KEY, url);
}

export function consumeReturnUrl() {
  const url = sessionStorage.getItem(STORAGE_KEY);
  if (url) sessionStorage.removeItem(STORAGE_KEY);
  return url;
}

export function cameFromJobRoom() {
  try {
    const ref = new URL(document.referrer);
    return ref.hostname === JOBROOM_HOST;
  } catch {
    return false;
  }
}
