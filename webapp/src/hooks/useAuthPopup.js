export const AUTH_EVENT = 'jc-auth-changed';

const JOBROOM_REGISTER = 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it';
const JOBROOM_LOGIN = 'https://jobroom.jobcourier.ch/job-seekers-login.php?language=it';

const markLoggedIn = () => {
    localStorage.setItem('jc_user_session', 'true');
    window.dispatchEvent(new Event(AUTH_EVENT));
};

/**
 * Opens a JobRoom auth page in a popup window and polls for its closure.
 * Cross-domain: cookie is not shared, so we treat popup close as login completion,
 * mark the local session, and notify the app so the UI becomes authenticated.
 *
 * @param {string} url - JobRoom auth URL
 * @param {string} name - window name
 */
const MAX_WATCH_MS = 15 * 60 * 1000; // stop polling after 15 min to avoid leaked timers

export const openAuthPopup = (url, name = 'jobroom-auth') => {
    const popup = window.open(
        url,
        name,
        'width=640,height=760,left=300,top=80,resizable=yes,scrollbars=yes'
    );

    // Popup blocked → fall back to same-tab navigation (App.jsx referrer flow handles return)
    if (!popup) {
        window.location.href = url;
        return null;
    }

    let done = false;
    const stop = () => {
        if (done) return;
        done = true;
        clearInterval(timer);
        clearTimeout(safety);
    };

    const timer = setInterval(() => {
        if (popup.closed) {
            stop();
            markLoggedIn();
        }
    }, 500);

    // Safety net: never poll forever
    const safety = setTimeout(stop, MAX_WATCH_MS);

    return popup;
};

export const openRegisterPopup = () => openAuthPopup(JOBROOM_REGISTER, 'jobroom-register');
export const openLoginPopup = () => openAuthPopup(JOBROOM_LOGIN, 'jobroom-login');
