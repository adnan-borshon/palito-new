import { createContext, useContext } from 'react';
import type { Locale } from '@palito/shared';

export const LocaleContext = createContext<Locale>('bn');
export function useLocale() { return useContext(LocaleContext); }
