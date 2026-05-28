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
export const openAuthPopup = (url, name = 'jobroom-auth') => {
    const popup = window.open(
        url,
        name,
        'width=640,height=760,left=300,top=80,resizable=yes,scrollbars=yes'
    );

    // Popup blocked → fall back to same-tab navigation
    if (!popup) {
        window.location.href = url;
        return null;
    }

    const timer = setInterval(() => {
        if (popup.closed) {
            clearInterval(timer);
            markLoggedIn();
        }
    }, 500);

    return popup;
};

export const openRegisterPopup = () => openAuthPopup(JOBROOM_REGISTER, 'jobroom-register');
export const openLoginPopup = () => openAuthPopup(JOBROOM_LOGIN, 'jobroom-login');
