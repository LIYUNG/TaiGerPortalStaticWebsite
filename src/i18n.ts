import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translation_resources } from './i18next/translation';

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: translation_resources,
    ns: [
        'admissions',
        'auth',
        'documents',
        'translation',
        'interviews',
        'common',
        'dashboard',
        'cvmlrl',
        'tickets',
        'customerCenter',
        'Note',
        'courses',
        'survey',
        'crm'
    ],
    defaultNS: 'translation',
    debug: true,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
