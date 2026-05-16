// Internationalization (i18n) configuration
// Translations are split into separate files per language in ./locales/
import en from './locales/en';
import hi from './locales/hi';
import es from './locales/es';
import zh from './locales/zh';
import ar from './locales/ar';
import fr from './locales/fr';
import pt from './locales/pt';
import ja from './locales/ja';
import de from './locales/de';

const translations = { en, hi, es, zh, ar, fr, pt, ja, de };

// Language detection and storage
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dineopen_language') || 'en';
  }
  return 'en';
};

const setStoredLanguage = (language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dineopen_language', language);
  }
};

// Translation function
export const t = (key, params = {}) => {
  const language = getStoredLanguage();
  const keys = key.split('.');
  let translation = translations[language];

  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      // Fallback to English if translation not found
      translation = translations.en;
      for (const fallbackKey of keys) {
        if (translation && translation[fallbackKey]) {
          translation = translation[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }

  // Replace parameters in translation
  if (typeof translation === 'string') {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined && params[param] !== null ? params[param] : match;
    });
  }

  return translation || key;
};

// Language management
export const getCurrentLanguage = () => getStoredLanguage();

export const setLanguage = (language) => {
  if (translations[language]) {
    setStoredLanguage(language);
    // Dispatch custom event to notify components of language change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language }
      }));
    }
    return true;
  }
  return false;
};

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

const i18n = {
  t,
  getCurrentLanguage,
  setLanguage,
  getAvailableLanguages
};

export default i18n;
