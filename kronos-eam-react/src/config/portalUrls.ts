/**
 * External Portal URLs Configuration
 * Contains actual URLs for various government and regulatory portals
 */

export const PORTAL_URLS = {
  // Terna GAUDÌ Portal
  GAUDI: {
    main: 'https://mercato.terna.it/gaudi',
    login: 'https://mercato.terna.it/gaudi/',
    manuals: 'https://www.terna.it/it/sistema-elettrico/gaudi/manuali-guide',
    support: 'https://www.terna.it/it/sistema-elettrico/gaudi/supporto'
  },

  // GSE (Gestore Servizi Energetici) Portals
  GSE: {
    areaClienti: 'https://areaclienti.gse.it',
    portaltecnico: 'https://portaltecnico.gse.it',
    simeri: 'https://www.gse.it/servizi-per-te/fotovoltaico/ritiro-dedicato',
    convenzioni: 'https://www.gse.it/servizi-per-te/fotovoltaico',
    supporto: 'https://supporto.gse.it'
  },

  // Agenzia delle Dogane e dei Monopoli
  DOGANE: {
    main: 'https://www.adm.gov.it/portale/',
    telematico: 'https://telematici.adm.gov.it/telematici/',
    officineElettriche: 'https://www.adm.gov.it/portale/en/energia-elettrica-rilascio-licenza-di-officina-elettrica-art.-53-del-tua-',
    modulistica: 'https://www.adm.gov.it/portale/en/modelli-denuncia'
  },

  // DSO (Distribution System Operators) Portals
  DSO: {
    'E-Distribuzione': {
      areaClienti: 'https://www.e-distribuzione.it/areaclienti',
      produttori: 'https://www.e-distribuzione.it/it/produttori.html',
      portaleB2B: 'https://portale-produttori.e-distribuzione.it',
      support: 'https://www.e-distribuzione.it/it/supporto.html'
    },
    'Areti': {
      areaClienti: 'https://www.areti.it/area-clienti',
      produttori: 'https://www.areti.it/produttori',
      portale: 'https://portale.areti.it'
    },
    'A2A Reti': {
      main: 'https://www.a2a.eu/it/a2a-reti-elettriche',
      portale: 'https://portale.a2areti.it'
    },
    'Unareti': {
      main: 'https://www.unareti.it',
      produttori: 'https://www.unareti.it/unr/produttori'
    },
    'DEVAL': {
      main: 'https://www.deval.it',
      produttori: 'https://www.deval.it/servizi/produttori'
    },
    'Edyna': {
      main: 'https://www.edyna.net',
      produttori: 'https://www.edyna.net/it/produttori'
    }
  },

  // Other Regulatory Bodies
  ARERA: {
    main: 'https://www.arera.it',
    normativa: 'https://www.arera.it/it/elettricita/ele.htm',
    servizi: 'https://www.arera.it/it/operatori/operatori_ele.htm'
  },

  // Useful Services
  SERVICES: {
    pec: 'https://www.pec.it',
    spid: 'https://www.spid.gov.it',
    pagopa: 'https://www.pagopa.gov.it'
  }
};

/**
 * Get DSO portal URLs based on DSO name
 */
export function getDSOPortalUrls(dsoName: string): typeof PORTAL_URLS.DSO[keyof typeof PORTAL_URLS.DSO] | null {
  return PORTAL_URLS.DSO[dsoName as keyof typeof PORTAL_URLS.DSO] || null;
}

/**
 * Get all available DSO names
 */
export function getAvailableDSOs(): string[] {
  return Object.keys(PORTAL_URLS.DSO);
}