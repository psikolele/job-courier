import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { saveReturnUrl } from '../hooks/useReturnUrl';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const body = 'var(--font-body)';

const RegistrationWallModal = ({ isOpen, onClose, onOpenLogin }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                gsap.fromTo(modalRef.current, { y: 16, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, delay: 0.05, ease: 'power3.out' });
            });
            return () => ctx.revert();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
            {/* Premium backdrop-blur overlay */}
            <div 
                ref={overlayRef} 
                className="absolute inset-0 backdrop-blur-md" 
                style={{ background: 'rgba(15, 23, 42, 0.6)' }} 
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div 
                ref={modalRef} 
                className="bg-white shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col p-8 md:p-10 rounded-none border border-slate-200 z-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm rounded-none border border-slate-200 cursor-pointer"
                    aria-label="Chiudi"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                    {/* Fuchsia icon circle */}
                    <div className="w-12 h-12 bg-[var(--brand-fuchsia)]/10 flex items-center justify-center mb-6 text-[var(--brand-fuchsia)] rounded-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-[0.15em] uppercase font-sans">
                        Accedi o Registrati
                    </h2>
                    
                    {/* Copy */}
                    <p 
                        className="text-slate-500 text-sm mb-8 max-w-sm" 
                        style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
                    >
                        Crea subito il tuo account gratuito per candidarti in un click, impostare alert personalizzati e monitorare lo stato delle tue ricerche sul mercato elvetico.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        {/* REGISTRATI (Sign Up) — popup so user never leaves Job Courier */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="w-full bg-[var(--brand-fuchsia)] text-white font-bold py-4 transition-all text-center rounded-none tracking-[0.1em] text-xs uppercase cursor-pointer"
                            onClick={() => {
                                saveReturnUrl();
                                window.open(
                                    'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it',
                                    'jobroom-register',
                                    'width=640,height=760,left=300,top=80,resizable=yes,scrollbars=yes'
                                );
                                onClose();
                            }}
                        >
                            Iscriviti Ora
                        </motion.button>

                        {/* ACCEDI (Login) — popup via Navbar modal or direct popup */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            onClick={() => {
                                saveReturnUrl();
                                onClose();
                                if (onOpenLogin) {
                                    onOpenLogin();
                                } else {
                                    window.open(
                                        'https://jobroom.jobcourier.ch/job-seekers-login.php?language=it',
                                        'jobroom-login',
                                        'width=620,height=720,left=300,top=100,resizable=yes,scrollbars=yes'
                                    );
                                }
                            }}
                            className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 transition-all hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)] text-center rounded-none tracking-[0.1em] text-xs uppercase cursor-pointer"
                        >
                            Accedi al Profilo
                        </motion.button>
                    </div>
                </div>

                {/* Fuchsia bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--brand-fuchsia)]" />
            </div>
        </div>
    );
};

export default RegistrationWallModal;
