import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Button, ScrollView, Text, TextInput, Switch } from 'react-native';
import { getAuth, onAuthStateChanged, signInWithPhoneNumber, signOut } from '@react-native-firebase/auth';

export default function IdentityScreen() {
  const [phone, setPhone] = useState(''); const [code, setCode] = useState(''); const [name, setName] = useState('');
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<Awaited<ReturnType<typeof signInWithPhoneNumber>> | null>(null);
  const [profile, setProfile] = useState<{ displayName: string } | null>(null); const [message, setMessage] = useState('');
  const enabled = process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED === 'true';
  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    const origin = process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;
    if (!origin || !origin.startsWith('https://') || new URL(origin).origin !== origin) throw new Error('Configure HTTPS API');
    const user = getAuth().currentUser;
    if (!user) throw new Error('Please sign in');
    const response = await fetch(`${origin}/api/v1${path}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${await user.getIdToken(true)}` } });
    if (!response.ok) throw new Error('Access unavailable');
    const value = await response.json();
    if (getAuth().currentUser?.uid !== user.uid) throw new Error('Session changed');
    return value;
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    async function refresh() {
      try { const value = await api('/me'); if (live) setProfile(value); }
      catch { if (live) setProfile(null); }
    }
    const unsubscribe = onAuthStateChanged(getAuth(), () => { void refresh(); });
    const listener = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); else setProfile(null); });
    return () => { live = false; unsubscribe(); listener.remove(); };
  }, [enabled, api]);
  async function act(work: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await work(); } catch { setProfile(null); setMessage('সাইন ইন সম্পন্ন হয়নি। Check your details and try again.'); }
    finally { setBusy(false); }
  }
  async function send() {
    if (!consent || !/^\+8801[3-9]\d{8}$/.test(phone)) throw new Error('Invalid phone');
    setConfirmation(await signInWithPhoneNumber(getAuth(), phone));
  }
  async function verify() {
    if (!confirmation || !/^\d{6}$/.test(code) || !name.trim()) throw new Error('Invalid code');
    const user = (await confirmation.confirm(code))?.user;
    if (!user) throw new Error('Sign in failed');
    try {
      await api('/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: await user.getIdToken(true), displayName: name.trim(), locale: 'bn' }) });
      setProfile(await api('/me')); setCode(''); setConfirmation(null);
    } catch (error) { await signOut(getAuth()); throw error; }
  }
  if (!enabled) return <ScrollView contentContainerStyle={{ padding: 24 }}><Text>Sign-in is not configured for this build.</Text></ScrollView>;
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
    <Link href="/account-security">Account security</Link><Link href="/staff-identity">Staff invitation / MFA</Link><Text accessibilityRole="header">পালিতো · Palito sign-in</Text>
    {profile ? <><Text>স্বাগতম · {profile.displayName}</Text><Link href="/care">খামার ও চিকিৎসা · Farm & care</Link><Link href="/finance">স্যান্ডবক্স ঋণ ও লেজার · Finance sandbox</Link><Button title="সাইন আউট · Sign out" disabled={busy} onPress={() => void act(async () => { await signOut(getAuth()); setProfile(null); setPhone(''); setName(''); setCode(''); setConfirmation(null); })} /></> : <>
      <TextInput accessibilityLabel="Name" placeholder="নাম · Name" maxLength={120} value={name} onChangeText={setName} />
      <TextInput accessibilityLabel="Phone" placeholder="+880" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Text>I agree to receive a verification SMS. Message rates may apply.</Text><Switch accessibilityLabel="SMS consent" value={consent} onValueChange={setConsent} />
      <Button title="কোড পাঠান · Send code" disabled={busy || !consent || !!confirmation} onPress={() => void act(send)} />
      {confirmation && <><TextInput accessibilityLabel="Code" placeholder="কোড · Code" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} value={code} onChangeText={setCode} /><Button title="যাচাই করুন · Verify" disabled={busy} onPress={() => void act(verify)} /><Button title="Start again" onPress={() => { setConfirmation(null); setCode(''); }} /></>}
    </>}
    <Text accessibilityRole="alert">{busy ? 'অপেক্ষা করুন · Please wait…' : message}</Text>
  </ScrollView>;
}
