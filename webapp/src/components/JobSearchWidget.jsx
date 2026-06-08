import React, { useState } from 'react';
import { Search, Briefcase, MapPin, ChevronRight } from 'lucide-react';
import { CANTONS, SECTORS, buildSearchParams } from '../utils/searchData';

const JobSearchWidget = ({ onSearch, initialKeyword = '', initialSector = '', initialCanton = '' }) => {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [selectedSector, setSelectedSector] = useState(initialSector);
    const [selectedCanton, setSelectedCanton] = useState(initialCanton);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(buildSearchParams({ keyword, selectedSector, selectedCanton }));
    };

    const inputBase = {
        width: '100%',
        paddingLeft: 40, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
        border: 'none',
        borderBottom: '1px solid var(--brand-fuchsia)',
        fontFamily: 'var(--font-body)', fontSize: 13,
        outline: 'none', background: 'transparent',
        borderRadius: 0, transition: 'border-color 0.2s',
        color: 'var(--brand-navy)',
    };

    const selectBase = {
        ...inputBase,
        paddingRight: 40,
        appearance: 'none',
        cursor: 'pointer',
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Qualifica, azienda o parola chiave..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    style={inputBase}
                />
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
                <select
                    value={selectedSector}
                    onChange={e => setSelectedSector(e.target.value)}
                    style={{ ...selectBase, color: selectedSector ? 'var(--brand-navy)' : '#8B8FA8' }}
                >
                    <option value="">Qualsiasi settore lavorativo</option>
                    {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Briefcase style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none' }} />
                <ChevronRight style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
                <select
                    value={selectedCanton}
                    onChange={e => setSelectedCanton(e.target.value)}
                    style={{ ...selectBase, color: selectedCanton ? 'var(--brand-navy)' : '#8B8FA8' }}
                >
                    <option value="">Tutti i Cantoni (Svizzera)</option>
                    {CANTONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                </select>
                <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none' }} />
                <ChevronRight style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: 16, height: 16, color: '#8B8FA8', pointerEvents: 'none' }} />
            </div>

            <button
                type="submit"
                style={{
                    background: 'var(--brand-navy)', color: '#FFFFFF',
                    border: 'none', padding: '14px 0',
                    fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: 0, marginTop: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%',
                }}
            >
                TROVA OFFERTE →
            </button>
        </form>
    );
};

export default JobSearchWidget;
