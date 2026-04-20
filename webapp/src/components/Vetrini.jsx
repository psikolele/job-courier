import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Vetrini = () => {
    const { t } = useTranslation();
    const iframeRef = useRef(null);
    const [iframeHeight, setIframeHeight] = useState(300);

    useEffect(() => {
        const company_type = '';
        let checkInterval = null;

        const handleMessage = (event) => {
            // Check if event data contains height and matching company type
            if (event.data && !isNaN(event.data.height) && event.data.company_type === company_type) {
                setIframeHeight(event.data.height);
                
                // Clear polling interval once we successfully establish connection
                if (checkInterval) {
                    clearInterval(checkInterval);
                    checkInterval = null;
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Polling to ask for initial height
        checkInterval = setInterval(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                try {
                    iframeRef.current.contentWindow.postMessage(
                        { 'giveMeYourHeight': true, 'company_type': company_type }, 
                        '*'
                    );
                } catch (e) {
                    console.error("Iframe communication error:", e);
                }
            }
        }, 100);

        // Ping iframe when window resizes to recalculate height
        const handleResize = () => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { 'giveMeYourHeight': true, 'company_type': company_type }, 
                    '*'
                );
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('resize', handleResize);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, []);

    return (
        <section className="py-16 md:py-24 bg-white relative z-10 px-4 md:px-12 w-full" id="vetrini">
            <div className="max-w-[1400px] mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-slate-900 mb-6 tracking-tight">
                        Aziende e società di selezione in vetrina
                    </h2>
                    <div className="w-24 h-1 bg-[#0038A5] mx-auto rounded-full"></div>
                </div>

                <div 
                    className="w-full relative rounded-3xl overflow-hidden p-2 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover-lift transition-all duration-500"
                    style={{
                        background: 'rgba(142, 132, 200, 0.2)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        border: '1px solid rgba(142, 132, 200, 0.3)',
                        borderRadius: '16px'
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        src="https://jobroom.jobcourier.ch/job/jobsShowcase.php?company_type=&emp_job_type=JOB&language=it&limit="
                        width="100%"
                        height={iframeHeight}
                        style={{ border: 0, overflow: 'hidden', transition: 'height 0.3s ease-out' }}
                        frameBorder="0"
                        scrolling="no"
                        title="Aziende in Vetrina"
                    />
                </div>
            </div>
        </section>
    );
};

export default Vetrini;
