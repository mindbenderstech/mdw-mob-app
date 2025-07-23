import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLanguages } from '../api/news'; 

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: string[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('hindi');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getLanguages();
        setAvailableLanguages(langs);
      } catch (error) {
        console.error('Error loading languages:', error);
      }
    };

    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) setLanguage(savedLang);
      } catch (error) {
        console.error('Failed to load saved language:', error);
      }
    };

    loadLanguage();
    fetchLanguages();
  }, []);

  const updateLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
