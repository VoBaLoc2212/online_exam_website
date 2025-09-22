import { useState, useCallback } from 'react';
import { translations, type Translations } from './Translation_Constraint';

export type Language = 'en' | 'vi';
export type { Translations };

// Re-export translations from Translation_Constraint file
export { translations };

// Get current language
export const getCurrentLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  return (saved as Language) || 'en';
};

// Set language and reload page
export const setLanguage = (lang: Language) => {
  localStorage.setItem('language', lang);
  window.location.reload();
};

// Translation hook with parameter replacement support
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage);
  
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    let text = translation[currentLanguage];
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }
    
    return text;
  }, [currentLanguage]);
  
  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);
  
  return {
    t,
    currentLanguage,
    changeLanguage
  };
};