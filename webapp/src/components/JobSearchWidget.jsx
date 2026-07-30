import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Briefcase, MapPin, ChevronRight } from 'lucide-react';
import { CANTONS, SECTORS, buildSearchParams } from '../utils/searchData';

const JobSearchWidget = ({ onSearch, initialKeyword = '', initialSector = '', initialCanton = '' }) => {
    const { t } = useTranslation();
    const [keyword, setKeyword] = useState(initialKeyword);
    const [selectedSector, setSelectedSector] = useState(initialSector);
    const [selectedCanton, setSelectedCanton] = useState(initialCanton);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(buildSearchParams({ keyword, selectedSector, selectedCanton }));
    };

    const fieldStyle = {
        flex: 1,
        position: 'relative',
        borderBottom: '1px solid var(--brand-fuchsia)',
        borderRight: '1px solid rgba(5,11,43,0.07)',
    };

    const inputBase = {
        width: '100%',
        paddingLeft: 40, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
        border: 'none',
        fontFamily: 'var(--font-body)', fontSize: 13,
        outline: 'none', background: 'transparent',
        borderRadius: 0,
        color: 'var(--brand-navy)',
        height: '100%',
    };

    const selectBase = {
        ...inputBase,
        paddingRight: 36,
        appearance: 'none',
        cursor: 'pointer',
    };

    const iconStyle = {
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none',
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', width: '100%' }}>
            {/* Keyword */}
            <div style={{ ...fieldStyle, flex: 2 }}>
                <Search style={iconStyle} />
                <input
                    type="text"
                    placeholder={t('hero.candidates.search_placeholder')}
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    style={inputBase}
                />
            </div>

            {/* Sector */}
            <div style={fieldStyle}>
                <Briefcase style={iconStyle} />
                <select
                    value={selectedSector}
                    onChange={e => setSelectedSector(e.target.value)}
                    style={{ ...selectBase, color: selectedSector ? 'var(--brand-navy)' : '#8B8FA8' }}
                >
                    <option value="">{t('jobs.any_sector')}</option>
                    {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronRight style={{ ...iconStyle, left: 'auto', right: 10, transform: 'translateY(-50%) rotate(90deg)' }} />
            </div>

            {/* Canton */}
            <div style={{ ...fieldStyle, borderRight: 'none' }}>
                <MapPin style={iconStyle} />
                <select
                    value={selectedCanton}
                    onChange={e => setSelectedCanton(e.target.value)}
                    style={{ ...selectBase, color: selectedCanton ? 'var(--brand-navy)' : '#8B8FA8' }}
                >
                    <option value="">{t('jobs.all_cantons_short')}</option>
                    {CANTONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                </select>
                <ChevronRight style={{ ...iconStyle, left: 'auto', right: 10, transform: 'translateY(-50%) rotate(90deg)' }} />
            </div>

            {/* Button */}
            <button
                type="submit"
                style={{
                    background: 'var(--brand-navy)', color: '#FFFFFF',
                    border: 'none', padding: '0 24px',
                    fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: 0, flexShrink: 0,
                    whiteSpace: 'nowrap',
                }}
            >
                {t('jobs.search_cta')} →
            </button>
        </form>
    );
};

export default JobSearchWidget;
