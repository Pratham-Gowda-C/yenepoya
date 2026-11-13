import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agripulse_language') || 'en';
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('agripulse_language', newLang);
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
