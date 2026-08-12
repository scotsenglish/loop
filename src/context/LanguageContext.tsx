import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionaries, type Lang } from '@/lib/i18n'

const STORAGE_KEY = 'loop-lang'

function detectDefault(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en') return saved
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through to detection.
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'vi'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, ...args: any[]) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectDefault)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
    document.documentElement.lang = lang
  }, [lang])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function t(key: string, ...args: any[]): string {
    const entry = dictionaries[lang][key] ?? dictionaries.vi[key]
    if (typeof entry === 'function') return entry(...args)
    return entry ?? key
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
