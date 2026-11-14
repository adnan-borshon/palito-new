import type { DemoStorage, Id } from '@palito/shared';

/**
 * Browser storage adapter implementing @palito/shared's DemoStorage contract.
 * Completely isolated from UI components so future HTTP/database backends can
 * replace local persistence without modifying any React feature screens.
 */
export const browserStorage: DemoStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

/**
 * Backend-agnostic Auth Session Adapter interface.
 * When you later add a real backend and database, swap this implementation
 * to read/clear HttpOnly session cookies or OAuth/JWT tokens.
 */
export interface AuthSessionAdapter {
  getActiveUserId(): Promise<Id | null>;
  clearSession(): Promise<void>;
}
