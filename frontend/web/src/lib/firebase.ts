'use client';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, connectAuthEmulator, type Auth } from 'firebase/auth';
let auth: Auth | undefined;
export function firebaseAuth() {
  if (auth) return auth;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) throw new Error('Sign-in is not configured');
  const emulator = process.env.NEXT_PUBLIC_AUTH_EMULATOR === 'true';
  if (emulator && (process.env.NODE_ENV === 'production' || !projectId.startsWith('demo-') || !['localhost', '127.0.0.1'].includes(window.location.hostname))) throw new Error('Invalid authentication configuration');
  const app = getApps().find(a => a.name === 'palito-identity') ?? initializeApp({ projectId, apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }, 'palito-identity');
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
  if (emulator) { connectAuthEmulator(auth, 'http://127.0.0.1:9099'); auth.settings.appVerificationDisabledForTesting=true; }
  return auth;
}
export class IdentityRequestError extends Error {
  constructor(readonly status: number) {
    super(status === 401 ? 'Please sign in again.' : status === 403 ? 'Access is not approved.' : 'Request failed. Please try again.');
  }
}
export async function api(path: string, init: RequestInit = {}) {
  const response = await fetch(`/api/v1${path}`, { ...init, credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new IdentityRequestError(response.status);
  return response.json();
}
export async function csrf() { return (await api('/sessions/csrf')).csrfToken as string; }
