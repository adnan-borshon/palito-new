'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, type ConfirmationResult } from 'firebase/auth';
import { api, csrf, firebaseAuth, IdentityRequestError } from '@/lib/firebase';

type Profile = { displayName: string; locale: string; memberships: { role: string }[] };
export default function IdentityPage() {
  const [phone, setPhone] = useState(''); const [code, setCode] = useState('');
  const [name, setName] = useState(''); const [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restore, setRestore] = useState(0);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const confirmation = useRef<ConfirmationResult | null>(null);
  const captcha = useRef<RecaptchaVerifier | null>(null);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    let active = true;
    void api('/me').then(value => { if (active) setProfile(value); }).catch(error => {
      if (!active) return;
      if (!(error instanceof IdentityRequestError) || error.status !== 401)
        setMessage(error instanceof IdentityRequestError && error.status === 403
          ? 'Access is restricted. Contact your administrator.'
          : 'সার্ভারে সংযোগ হচ্ছে না · Could not connect to Palito. Try again.');
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; captcha.current?.clear(); captcha.current = null; };
  }, [restore]);
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
  const roles = profile?.memberships.map((membership) => membership.role) ?? [];
  const administrator = roles.includes('ADMIN');
  const financeStaff = roles.includes('BANK_STAFF') || roles.includes('INSURER_STAFF');
  return <main className="mx-auto max-w-lg p-8 space-y-5">
    {profile?.memberships.some(m=>m.role==='ADMIN')&&<Link href="/identity/admin">Identity administration</Link>} <Link href="/identity/account">Account security</Link> <Link href="/identity/staff">Staff invitation / MFA sign-in</Link> <Link href="/demo">নমুনা · Try the demo</Link><h1 className="text-2xl font-bold">পালিতো · Palito sign-in</h1>
    {checking ? <p role="status">অপেক্ষা করুন · Checking sign-in…</p> : profile ? <><p>স্বাগতম · Welcome, {profile.displayName}</p>
      <nav className="flex flex-wrap gap-4" aria-label="Verified dashboards">
        {administrator && <Link href="/operations">প্রশাসন · Administration dashboard</Link>}
        {(!roles.length || roles.includes('VET')) && <Link href="/care">খামার ও চিকিৎসা · Farm & care</Link>}
        <Link href="/finance">{financeStaff ? 'আর্থিক কর্মক্ষেত্র · Bank & insurance workspace' : 'স্যান্ডবক্স ঋণ ও লেজার · Finance sandbox'}</Link>
      </nav>
      <button disabled={busy} onClick={() => void act(logout)}>সাইন আউট · Sign out</button></> : <>
      {!!message && <button disabled={busy} onClick={() => { setMessage(''); setChecking(true); setRestore(restore + 1); }}>সংযোগ আবার পরীক্ষা · Retry connection</button>}
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
