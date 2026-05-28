import { useState, useEffect } from 'react';
import { AUTH_EVENT } from './useAuthPopup';

const STORAGE_KEY = 'jc_click_tracker';
const LIMIT = 3;
const EXPIRY_MS = 24 * 60 * 60 * 1000;

export const isUserLoggedIn = () => {
    if (typeof window === 'undefined') return false;

    // 1. Admin bypass via query string or localStorage
    if (localStorage.getItem('jc_admin_bypass') === 'true') return true;

    // 2. Control of the jobroom_session cookie (wildcard domain sharing in production)
    const hasSessionCookie = document.cookie.includes('jobroom_session');
    if (hasSessionCookie) return true;

    // 3. Control of local session persistence (synchronized from redirect callbacks)
    const hasLocalSession = localStorage.getItem('jc_user_session') === 'true';
    if (hasLocalSession) return true;

    return false;
};

export const checkClickLimit = () => {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin_bypass') === '1') {
        localStorage.setItem('jc_admin_bypass', 'true');
    }
    if (localStorage.getItem('jc_admin_bypass') === 'true') return false;

    // TOTAL BYPASS IF LOGGED IN
    if (isUserLoggedIn()) return false;

    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 1, expiry: now + EXPIRY_MS }));
        return false;
    }

    let data;
    try {
        data = JSON.parse(stored);
    } catch {
        data = null;
    }
    if (!data || typeof data.expiry !== 'number') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 1, expiry: now + EXPIRY_MS }));
        return false;
    }
    if (now > data.expiry) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 1, expiry: now + EXPIRY_MS }));
        return false;
    }

    if (data.count >= LIMIT) return true;

    data.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return false;
};

export const useRegistrationWall = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [authed, setAuthed] = useState(isUserLoggedIn());

    // React to login completion (popup-close event) and tab refocus
    useEffect(() => {
        const refresh = () => {
            const next = isUserLoggedIn();
            setAuthed(next);
            if (next) setIsOpen(false);
        };
        window.addEventListener(AUTH_EVENT, refresh);
        window.addEventListener('focus', refresh);
        return () => {
            window.removeEventListener(AUTH_EVENT, refresh);
            window.removeEventListener('focus', refresh);
        };
    }, []);

    const guard = (callback) => {
        // If already logged in, bypass limit immediately
        if (isUserLoggedIn()) {
            if (typeof callback === 'function') callback();
            return true;
        }

        if (checkClickLimit()) {
            setIsOpen(true);
            return false;
        }
        if (typeof callback === 'function') callback();
        return true;
    };

    return { isOpen, setIsOpen, guard, isAuthed: authed };
};

export default useRegistrationWall;
