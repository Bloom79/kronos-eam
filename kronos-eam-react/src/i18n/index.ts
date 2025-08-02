import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enCommon from './locales/en/common.json';
import enPlants from './locales/en/plants.json';
import enWorkflows from './locales/en/workflows.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';

import itCommon from './locales/it/common.json';
import itPlants from './locales/it/plants.json';
import itWorkflows from './locales/it/workflows.json';
import itDashboard from './locales/it/dashboard.json';
import itAuth from './locales/it/auth.json';

const resources = {
  en: {
    common: enCommon,
    plants: enPlants,
    workflows: enWorkflows,
    dashboard: enDashboard,
    auth: enAuth,
  },
  it: {
    common: itCommon,
    plants: itPlants,
    workflows: itWorkflows,
    dashboard: itDashboard,
    auth: itAuth,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
        ns: ['common', 'plants', 'workflows', 'dashboard', 'auth'],
    keySeparator: '.', // Enable nested key access
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kronos_language',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;