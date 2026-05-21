import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const STORAGE_KEY = 'jc_click_tracker';
const LIMIT = 3;
const EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns true if click should be blocked (limit reached, not authed, not admin).
 * Otherwise increments counter and returns false.
 */
export const checkClickLimit = () => {
    if (typeof window === 'undefined') return false;

    // Admin bypass via query string
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin_bypass') === '1') {
        localStorage.setItem('jc_admin_bypass', 'true');
    }
    if (localStorage.getItem('jc_admin_bypass') === 'true') return false;

    // TODO: replace with real session check (cookie jobroom_session or /api/check-auth)
    // if (isUserLoggedIn()) return false;

    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 1, expiry: now + EXPIRY_MS }));
        return false;
    }

    const data = JSON.parse(stored);
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

    /**
     * Guard an action — call before performing job click/navigation.
     * Returns true if allowed, false if blocked (modal opened).
     */
    const guard = (callback) => {
        if (checkClickLimit()) {
            setIsOpen(true);
            return false;
        }
        if (typeof callback === 'function') callback();
        return true;
    };

    return { isOpen, setIsOpen, guard };
};

export default useRegistrationWall;
