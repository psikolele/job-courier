import React, { useState, useEffect } from 'react';
import { fetchCantons, fetchSectors } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase } from 'lucide-react';

const Filters = () => {
    const { t } = useTranslation();
    const [cantons, setCantons] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

    useEffect(() => {
        // Simulated API data fetch
        setTimeout(() => {
            setCantons(['Zurigo', 'Ginevra', 'Berna', 'Lugano', 'Basilea']);
            setSectors(['Informatica', 'Finanza', 'Risorse Umane', 'Marketing', 'Sanità']);
            setLoading(false);
        }, 800);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', { keyword, selectedCanton, selectedSector });
        // Call API here...
    };

    return (
        <div className="w-full max-w-5xl mx-auto -mt-8 relative z-20 px-4">
            <div className="bg-surface/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-4 md:p-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative flex items-center">
                        <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={t('filters.keywordPlaceholder') || "Qualifica, keyword o azienda"}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    
                    <div className="md:w-64 relative flex items-center">
                        <Briefcase className="absolute left-4 w-5 h-5 text-gray-400" />
                        <select 
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-gray-200 focus:border-accent appearance-none outline-none transition-all"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                        >
                            <option value="">{t('filters.sectorPlaceholder') || "Tutti i settori"}</option>
                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="md:w-64 relative flex items-center">
                        <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
                        <select 
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-gray-200 focus:border-accent appearance-none outline-none transition-all"
                            value={selectedCanton}
                            onChange={(e) => setSelectedCanton(e.target.value)}
                        >
                            <option value="">{t('filters.cantonPlaceholder') || "Tutta la Svizzera"}</option>
                            {cantons.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap">
                        {t('filters.searchButton') || "Cerca Lavori"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Filters;
