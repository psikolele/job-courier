import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ExternalLink } from 'lucide-react';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

/**
 * Modal shown when user clicks "Candidati" on an external-redirect job.
 * Displays "Ti stiamo mandando su un altro sito" message, then opens external URL.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   externalUrl: string — destination
 *   companyName: string — for context
 *   autoRedirectMs: number — default 2500
 */
const ApplyRedirectModal = ({ isOpen, onClose, externalUrl, companyName = '', autoRedirectMs = 2500 }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isOpen && externalUrl) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
                gsap.fromTo(modalRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.05, ease: 'power3.out' });
            });

            timerRef.current = setTimeout(() => {
                window.open(externalUrl, '_blank', 'noopener,noreferrer');
                onClose();
            }, autoRedirectMs);

            return () => {
                ctx.revert();
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }
    }, [isOpen, externalUrl, autoRedirectMs, onClose]);

    const handleGoNow = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleCancel = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div ref={overlayRef} className="absolute inset-0 backdrop-blur-2xl" style={{ background: 'rgba(5,11,43,0.92)' }} onClick={handleCancel} />

            <div ref={modalRef} className="relative max-w-md w-full" style={{ background: '#FFFFFF', padding: '48px 40px' }}>
                <div className="flex flex-col items-center text-center">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: F, display: 'inline-block', marginBottom: 20 }} className="animate-pulse" />

                    <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F, marginBottom: 14 }}>
                        Reindirizzamento esterno
                    </p>

                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 26,
                        color: N, textTransform: 'uppercase',
                        letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 12
                    }}>
                        Ti stiamo mandando<br/>su un altro sito
                    </h2>

                    {companyName && (
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 18, color: GM, marginBottom: 16 }}>
                            {companyName}
                        </p>
                    )}

                    <p style={{ fontFamily: body, fontSize: 13, color: GM, marginBottom: 28, lineHeight: 1.6, maxWidth: 320 }}>
                        La candidatura per questa offerta è gestita esternamente. Verrai aperto in una nuova finestra a breve.
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button onClick={handleGoNow}
                            className="transition-opacity hover:opacity-80 w-full flex items-center justify-center gap-2"
                            style={{
                                background: F, color: '#FFFFFF', border: 'none',
                                padding: '15px 24px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                cursor: 'pointer', borderRadius: 0
                            }}>
                            Vai subito <ExternalLink size={13} />
                        </button>
                        <button onClick={handleCancel}
                            className="transition-opacity hover:opacity-60 w-full"
                            style={{
                                background: 'transparent', color: GM, border: '1.5px solid rgba(5,11,43,0.1)',
                                padding: '13px 24px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                cursor: 'pointer', borderRadius: 0
                            }}>
                            Annulla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyRedirectModal;
