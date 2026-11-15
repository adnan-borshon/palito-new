'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, type ConfirmationResult } from 'firebase/auth';
import { api, csrf, firebaseAuth } from '@/lib/firebase';

type Profile = { displayName: string; locale: string; memberships: { role: string }[] };
export default function IdentityPage() {
  const [phone, setPhone] = useState(''); const [code, setCode] = useState('');
  const [name, setName] = useState(''); const [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const confirmation = useRef<ConfirmationResult | null>(null);
  const captcha = useRef<RecaptchaVerifier | null>(null);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    let active = true;
    void api('/me').then(value => { if (active) setProfile(value); }).catch(() => {});
    return () => { active = false; captcha.current?.clear(); captcha.current = null; };
  }, []);
  async function act(work: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await work(); } catch { setMessage('সাইন ইন সম্পন্ন হয়নি। আবার চেষ্টা করুন। Sign-in failed. Check your details and try again.'); }
    finally { setBusy(false); }
  }
  async function send() {
    if (!consent || !/^\+8801[3-9]\d{8}$/.test(phone)) throw new Error('Invalid phone');
    const auth = firebaseAuth();
    captcha.current?.clear();
    captcha.current = new RecaptchaVerifier(auth, 'recaptcha', { size: 'normal' });
    confirmation.current = await signInWithPhoneNumber(auth, phone, captcha.current);
    setSent(true);
  }
  async function verify() {
    const auth = firebaseAuth();
    try {
      if (!confirmation.current || !/^\d{6}$/.test(code) || !name.trim()) throw new Error('Invalid code');
      const credential = await confirmation.current.confirm(code);
      const idToken = await credential.user.getIdToken(true);
      await api('/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken, displayName: name.trim(), locale: 'bn' }) });
      await api('/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': await csrf() }, body: JSON.stringify({ idToken }) });
      setProfile(await api('/me')); setCode(''); confirmation.current = null; setSent(false);
    } finally { await signOut(auth); }
  }
  async function logout() {
    await api('/sessions/current', { method: 'DELETE', headers: { 'X-CSRF-Token': await csrf() } });
    setProfile(null); setCode(''); setPhone(''); setName(''); setSent(false); confirmation.current = null;
  }
  return <main className="mx-auto max-w-lg p-8 space-y-5">
    {profile?.memberships.some(m=>m.role==='ADMIN')&&<Link href="/identity/admin">Identity administration</Link>} <Link href="/identity/account">Account security</Link> <Link href="/identity/staff">Staff invitation / MFA sign-in</Link><h1 className="text-2xl font-bold">পালিতো · Palito sign-in</h1>
    {profile ? <><p>স্বাগতম · Welcome, {profile.displayName}</p><p>Your account is connected.</p><Link href="/care">খামার ও চিকিৎসা · Farm & care</Link> <Link href="/finance">স্যান্ডবক্স ঋণ ও লেজার · Finance sandbox</Link><button disabled={busy} onClick={() => void act(logout)}>সাইন আউট · Sign out</button></> : <>
      <label className="block">নাম · Name<input className="block border p-2 w-full" maxLength={120} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
      <label className="block">ফোন · Phone (+880)<input className="block border p-2 w-full" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" /></label>
      <label className="block"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to receive a verification SMS. Message rates may apply.</label>
      <div id="recaptcha" />
      <button disabled={busy || !consent || sent} onClick={() => void act(send)}>কোড পাঠান · Send code</button>
      {sent && <><label className="block">কোড · Code<input className="block border p-2" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value)} autoComplete="one-time-code" /></label><button disabled={busy} onClick={() => void act(verify)}>যাচাই করুন · Verify</button><button disabled={busy} onClick={() => { confirmation.current = null; setSent(false); setCode(''); }}>Start again</button></>}
    </>}
    <p role="status">{busy ? 'অপেক্ষা করুন · Please wait…' : message}</p>
  </main>;
}
