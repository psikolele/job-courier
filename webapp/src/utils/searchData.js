export const CANTONS = [
    { name: 'Appenzello Esterno', value: 'AR' },
    { name: 'Appenzello Interno', value: 'AI' },
    { name: 'Argovia', value: 'AG', regionId: '3095' },
    { name: 'Basilea', value: 'BS', regionId: '3105' },
    { name: 'Basilea Campagna', value: 'BL' },
    { name: 'Berna', value: 'BE', regionId: '3099' },
    { name: 'Friburgo', value: 'FR' },
    { name: 'Ginevra', value: 'GE', regionId: '3101' },
    { name: 'Giura', value: 'JU' },
    { name: 'Glarona', value: 'GL' },
    { name: 'Grigioni', value: 'GR', regionId: '3103' },
    { name: 'Lucerna', value: 'LU', regionId: '3107' },
    { name: 'Neuchâtel', value: 'NE' },
    { name: 'Nidvaldo', value: 'NW' },
    { name: 'Obvaldo', value: 'OW' },
    { name: 'San Gallo', value: 'SG', regionId: '3106' },
    { name: 'Sciaffusa', value: 'SH' },
    { name: 'Soletta', value: 'SO' },
    { name: 'Svitto', value: 'SZ' },
    { name: 'Ticino', value: 'TI', regionId: '3115' },
    { name: 'Turgovia', value: 'TG' },
    { name: 'Uri', value: 'UR' },
    { name: 'Vallese', value: 'VS' },
    { name: 'Vaud', value: 'VD' },
    { name: 'Zugo', value: 'ZG' },
    { name: 'Zurigo', value: 'ZH', regionId: '3120' },
];

export const SECTORS = [
    { name: 'Amministrazione/Paghe e contributi', role: 'amministrazione-2fpaghe-e-contributi', id: '213' },
    { name: 'Centralino/Segreteria/Servizi generali', role: 'centralino-2fsegretariato-2fservizi-generali', id: '901' },
    { name: 'Commerciale/Vendite', role: 'commerciale-2fvendite', id: '234' },
    { name: 'Controllo e certificazione qualità', role: 'controllo-e-certificazione-qualit-c3-a0', id: '231' },
    { name: 'Costruzioni/Mestieri', role: 'costruzioni-2fmestieri', id: '215' },
    { name: 'Customer Service', role: 'customer-service', id: '216' },
    { name: 'Finanza/Contabilità/Revisione', role: 'finanza-2fcontabilit-c3-a0-2frevisione', id: '212' },
    { name: 'Ingegneria/Progettazione', role: 'ingegneria-2fprogettazione', id: '219' },
    { name: 'IT/Technology', role: 'it-2ftechnology', id: '236' },
    { name: 'Logistica/Magazzino', role: 'logistica-2fmagazzino', id: '224' },
    { name: 'Marketing/Relazioni esterne', role: 'marketing-2frelazioni-esterne', id: '226' },
    { name: 'Medicina/Salute', role: 'medicina-2fsalute', id: '221' },
    { name: 'Ricerca e sviluppo', role: 'ricerca-e-sviluppo', id: '232' },
    { name: 'Risorse umane', role: 'risorse-umane', id: '222' },
    { name: 'Ristorazione/Hotellerie', role: 'ristorazione-2fhotellerie', id: '220' },
    { name: 'Sicurezza/Vigilanza', role: 'sicurezza-2fvigilanza', id: '233' },
    { name: 'Trasporti', role: 'trasporti', id: '900' },
    { name: 'Vendita al dettaglio/Servizi al pubblico', role: 'vendita-al-dettaglio-2fservizi-al-pubblico', id: '902' },
];

export const buildSearchParams = ({ keyword, selectedSector, selectedCanton }) => {
    const params = new URLSearchParams();

    if (selectedCanton) {
        const canton = CANTONS.find(c => c.value === selectedCanton);
        if (canton?.regionId) {
            params.set('country', '214');
            params.set('region', canton.regionId);
        } else {
            params.set('global', '1');
            params.set('location', canton ? canton.name : selectedCanton);
        }
    } else {
        params.set('global', '1');
    }

    if (keyword) params.set('keyword', keyword);

    if (selectedSector) {
        const sector = SECTORS.find(s => s.id === selectedSector);
        if (sector) {
            params.set('role', sector.role);
            params.set('role_id', sector.id);
        }
    }

    return params;
};

export const getCantonValueFromParams = (regionId, location) => {
    if (regionId) {
        const c = CANTONS.find(c => c.regionId === regionId);
        if (c) return c.value;
    }
    if (location) {
        const c = CANTONS.find(c => c.name.toLowerCase() === location.toLowerCase());
        if (c) return c.value;
    }
    return '';
};
