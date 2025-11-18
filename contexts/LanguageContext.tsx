
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, SupportedLanguage } from '@/constants/translations';

interface LanguageContextType {
  locale: SupportedLanguage;
  setLocale: (locale: SupportedLanguage) => Promise<void>;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@mxi_app_language';

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [i18n] = useState(() => {
    const i18nInstance = new I18n(translations);
    i18nInstance.enableFallback = true;
    i18nInstance.defaultLocale = 'en';
    return i18nInstance;
  });

  // Load saved language preference or detect device language
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // Try to load saved language preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (savedLanguage && ['en', 'es', 'pt'].includes(savedLanguage)) {
          console.log('📱 Loaded saved language:', savedLanguage);
          setLocaleState(savedLanguage as SupportedLanguage);
          i18n.locale = savedLanguage;
        } else {
          // Detect device language
          const deviceLocales = Localization.getLocales();
          const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
          
          console.log('🌍 Device language detected:', deviceLanguage);
          
          // Map device language to supported languages
          let appLanguage: SupportedLanguage = 'en';
          if (deviceLanguage.startsWith('es')) {
            appLanguage = 'es';
          } else if (deviceLanguage.startsWith('pt')) {
            appLanguage = 'pt';
          }
          
          console.log('✅ Setting app language to:', appLanguage);
          setLocaleState(appLanguage);
          i18n.locale = appLanguage;
          
          // Save the detected language
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, appLanguage);
        }
      } catch (error) {
        console.error('❌ Error loading language:', error);
        // Default to English on error
        setLocaleState('en');
        i18n.locale = 'en';
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [i18n]);

  const setLocale = useCallback(async (newLocale: SupportedLanguage) => {
    try {
      console.log('🔄 Changing language to:', newLocale);
      setLocaleState(newLocale);
      i18n.locale = newLocale;
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
      console.log('✅ Language changed successfully');
    } catch (error) {
      console.error('❌ Error saving language:', error);
    }
  }, [i18n]);

  const t = useCallback((key: string, options?: any): string => {
    return i18n.t(key, options);
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
