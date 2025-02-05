import React, { 
    createContext, 
    useState, 
    useContext, 
    useEffect, 
    useMemo 
  } from 'react';
  import Papa from 'papaparse';

  let storage = (typeof localStorage !== 'undefined') ? localStorage : null;
  
  // Translation utility class
  class Translation {

    translations: any;
    languageCode: any;
    langs: any;
    baseUrl: any;

    constructor(baseUrl: string, langs: { en?: string[]; th?: string[]; }) {
      this.translations = {};
      this.languageCode = Object.keys(langs)[0] || 'en';
      this.langs = langs;
      this.baseUrl = baseUrl;
    }
  
    // Add helper to escape regex special characters
    escapeRegExp(text: string) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async loadTranslations() {
      const languageFiles = this.langs[this.languageCode] || [];
      
      const loadFile = async (fileName: any) => {
        const filePath = `${this.baseUrl}${fileName}`;
        
        return new Promise((resolve, reject) => {
          Papa.parse(filePath, {
            download: true,
            complete: (results) => {
              const fileTranslations: { [key: string]: string } = {};
              
              results.data.forEach((row: any) => {
                if (Array.isArray(row) && row.length >= 2 && row[0] && row[1]) {
                  let value = row[1].trim()
                  if(value.startsWith('"') && value.endsWith('"')) {
                    value = value.replace(/^"(.*)"$/, '$1')
                  }
                  fileTranslations[row[0].trim()] = value
                }
              });
  
              resolve(fileTranslations);
            },
            error: (error) => reject(error)
          });
        });
      };
  
      try {
        const translationPromises = languageFiles.map(loadFile);
        const translationResults = await Promise.all(translationPromises);
  
        this.translations = translationResults.reduce((acc, curr) => ({...acc, ...curr}), {});
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    }
  
    extractVariables(originalString: string) {
      const variables= {} as { [key: string]: string };
      
      const countMatch = originalString.match(/\d+/);
      if (countMatch) {
        variables.count = countMatch[0];
      }
  
      return variables;
    }
  
    m(key: string) {
      // Check for exact key match first
      if (this.translations[key]) {
        const variables = this.extractVariables(key);
        let translation = this.translations[key];
        Object.keys(variables).forEach(varKey => {
          const placeholder = `{${varKey}}`;
          translation = translation.replace(placeholder, variables[varKey]);
        });
        return translation;
      }
      
      // Iterate over template keys with placeholders
      for (const templateKey in this.translations) {
        if (templateKey.includes('{')) {
          // Build regex pattern from templateKey (e.g., "Hello, {name}" -> /^Hello,\s+(.+)$/)
          const pattern = '^' + this.escapeRegExp(templateKey).replace(/\\\{(\w+)\\\}/g, '(.+)') + '$';
          const regex = new RegExp(pattern);
          const match = key.match(regex);
          if (match) {
            // Extract variable names from templateKey
            const varNames = [...templateKey.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
            const variables: { [key: string]: string } = {};
            varNames.forEach((varName, index) => {
              variables[varName] = match[index + 1];
            });
            let translation = this.translations[templateKey];
            Object.keys(variables).forEach(varKey => {
              const placeholder = `{${varKey}}`;
              translation = translation.replace(placeholder, variables[varKey]);
            });
            return translation;
          }
        }
      }
      return key;
    }
  
    setLanguage(languageCode: string) {
      this.languageCode = languageCode;
    }
  }
  
  // Define the context type
  interface TranslationContextType {
    m: (key: string) => string;
    language: string;
    changeLanguage: (newLanguage: string) => void;
    isLoading: boolean;
    translations: any;
  }
  
  // Create translation context
  const TranslationContext = createContext<TranslationContextType | null>(null);
  
  // Translation Provider Component
  export const TranslationProvider = ({ 
    children, 
    baseUrl = 'http://localhost:3000/translations/', 
    langs = { 
      en: ['en.csv'], 
      th: ['th.csv'] 
    },
    currentLanguage, // optional forced current language
    storageKey = 'language' // new optional prop for localStorage key
  }: {
    children: any;
    baseUrl?: string;
    langs?: { [key: string]: string[]; };
    currentLanguage?: string;
    storageKey?: string;
  }) => {
    // Use forced language if provided, else get from localStorage using storageKey or default to first lang.
    const initialLanguage = currentLanguage || storage?.getItem(storageKey)|| Object.keys(langs)[0] || 'en';
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [language, setLanguage] = useState(initialLanguage);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      // Save language to localStorage with storageKey when it changes.
      storage?.setItem(storageKey, language);
    }, [language, storageKey]);
  
    useEffect(() => {
      const initTranslation = async () => {
        setIsLoading(true);
        
        try {
          const m = new Translation(baseUrl, langs);
          await m.setLanguage(language);
          await m.loadTranslations();
          setTranslation(m);
        } catch (error) {
          console.error('Translation initialization error:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      initTranslation();
    }, [language, baseUrl, JSON.stringify(langs)]);
  
    const changeLanguage = (newLanguage: string) => {
      setLanguage(newLanguage);
    };
  
    const contextValue = useMemo(() => ({
      m: (key: string) => translation ? translation.m(key) : key,
      language,
      changeLanguage,
      isLoading,
      translations: translation?.translations
    }), [translation, language, isLoading, changeLanguage]);
  
    return (
      <TranslationContext.Provider value={contextValue}>
        {children}
      </TranslationContext.Provider>
    );
  };
  
  // Custom hook for translation
  export const useTranslation = () => {
    const context = useContext(TranslationContext);
    
    if (!context) {
      throw new Error('useTranslation must be used within a TranslationProvider');
    }
    
    return context;
  };
  
  export default TranslationProvider;