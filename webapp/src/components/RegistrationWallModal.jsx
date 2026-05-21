import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, UserPlus } from 'lucide-react';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const body = 'var(--font-body)';

const RegistrationWallModal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                gsap.fromTo(modalRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.05, ease: 'power3.out' });
            });
            return () => ctx.revert();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div ref={overlayRef} className="absolute inset-0 backdrop-blur-2xl" style={{ background: 'rgba(5,11,43,0.92)' }} onClick={onClose} />

            <div ref={modalRef} className="relative max-w-md w-full" style={{ background: '#FFFFFF', padding: '48px 40px' }}>
                <button onClick={onClose} className="absolute top-5 right-5 transition-opacity hover:opacity-60" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <X className="w-5 h-5" style={{ color: GM }} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: F, display: 'inline-block', marginBottom: 24 }} />

                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 28,
                        color: N, textTransform: 'uppercase',
                        letterSpacing: '-0.02em', marginBottom: 12
                    }}>
                        Accesso Limitato
                    </h2>

                    <p style={{
                        fontFamily: body, fontSize: 14, color: GM,
                        marginBottom: 32, lineHeight: 1.6, maxWidth: 320
                    }}>
                        Per continuare a visualizzare gli annunci, iscriviti gratuitamente al portale.
                    </p>

                    <a href="https://jobroom.jobcourier.ch/job-seekers-login.php?lan=it&language=it"
                        className="transition-opacity hover:opacity-80 w-full flex items-center justify-center gap-3"
                        style={{
                            background: F, color: '#FFFFFF',
                            padding: '15px 24px',
                            fontFamily: brand, fontWeight: 700, fontSize: 11,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            textDecoration: 'none', display: 'flex',
                            borderRadius: 0
                        }}>
                        Iscriviti Ora →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RegistrationWallModal;
