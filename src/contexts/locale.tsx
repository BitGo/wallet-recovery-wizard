import React, { useContext } from 'react';
import { IntlProvider } from 'react-intl';

import messages_en from '../../lang/en.json';
import messages_ja from '../../lang/ja.json';

const messages = {
  ja: messages_ja,
  en: messages_en,
};

type Locale = keyof typeof messages;

export type LocaleProviderProps = {
  children: React.ReactNode;
};

export type LocaleProviderContextValue = {
  locale: Locale;
  setLocale: (string: Locale) => void;
};

const localeKeys = Object.keys(messages);

export const LocaleContext = React.createContext<LocaleProviderContextValue | undefined>(undefined);

export function isLocale(locale: string): locale is Locale {
  return localeKeys.includes(locale);
}

function extractLocale(): Locale {
  const locale = navigator.language.split(/[-_]/)[0];
  if (isLocale(locale)) {
    return locale;
  }
  return 'en';
}

export function useLocale() {
  const localeContextValue = useContext(LocaleContext);
  if (localeContextValue === undefined) {
    throw new Error('useLocale can only be used within a LocaleProvider');
  }
  return localeContextValue;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = React.useState<Locale>(extractLocale);
  return (
    <LocaleContext.Provider value={React.useMemo(() => ({ locale, setLocale }), [locale])}>
      <IntlProvider defaultLocale="en" locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
