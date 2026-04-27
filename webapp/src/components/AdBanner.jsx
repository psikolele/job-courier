import React from 'react';

const AdBanner = () => {
    return (
        <div className="w-[98%] mx-auto flex flex-col md:flex-row gap-4 mb-14 mt-4 px-2">
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-white">
                <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 uppercase z-10 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">Advertisement</span>
                <a href="https://www.blc-sa.ch" target="_blank" rel="noopener noreferrer" className="block w-full h-[150px] md:h-[200px] relative">
                    <img src="/img/Gemini_Generated_Image_ape98sape98sape9.png" alt="Business Learning Centre SA" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] opacity-95 hover:opacity-100" />
                </a>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-white">
                <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 uppercase z-10 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">Advertisement</span>
                <a href="https://www.wallmoss.ch/" target="_blank" rel="noopener noreferrer" className="block w-full h-[150px] md:h-[200px] relative">
                    <img src="/img/Gemini_Generated_Image_lw18o4lw18o4lw18.png" alt="Wallmoss Interior Design" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] opacity-95 hover:opacity-100" />
                </a>
            </div>
        </div>
    );
};

export default AdBanner;
