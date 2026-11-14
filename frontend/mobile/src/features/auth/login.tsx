import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { palitoImages } from '@/assets/palito/manifest';
import { AppFeedback } from '@/components/app-feedback';
import { AppText, Badge, Button, Card, Field, LoadingState, Row, Screen, Section, type IconName } from '@/components/ui';
import { roleNames, routeFor } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import type { Role } from '@palito/shared';

const roleIcons: Record<Role, IconName> = { farmer: 'leaf-outline', vet: 'medkit-outline', bank: 'business-outline', insurer: 'shield-checkmark-outline', admin: 'settings-outline' };
export default function Login() {
  const { state, user, ready, locale, t, run, repo, busy, clearError, clearFeedback } = useDemo();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [requested, setRequested] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [requestTick, setRequestTick] = useState(0);
  useEffect(() => {
    if (!requested || !state.session.otpExpiresAt) return;
    const domainRemaining = Math.max(0, Math.ceil((Date.parse(state.session.otpExpiresAt) - Date.parse(state.now) - 270000) / 1000));
    const timer = setInterval(() => setResendSeconds(Math.max(0, domainRemaining - Math.floor((Date.now() - requestTick) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [requested, requestTick, state.now, state.session.otpExpiresAt]);
  if (!ready) return <LoadingState />;
  if (user) return <Redirect href={routeFor(user.role)} />;
  async function submit() {
    if (!requested) { await requestCode(); return; }
    const result = await run({ type: 'auth.verifyOtp', code });
    if (result.ok) { const snapshot = repo.getSnapshot(); const account = snapshot.users.find(item => item.id === snapshot.session.userId); if (account) router.replace(routeFor(account.role)); }
  }
  async function requestCode() {
    const result = await run({ type: 'auth.requestOtp', phone: state.session.pendingPhone && requested ? state.session.pendingPhone : phone });
    if (result.ok) { setRequested(true); setCode(''); setRequestTick(Date.now()); setResendSeconds(30); }
  }
  const accounts = Object.keys(roleNames).map(role => state.users.find(account => account.role === role)).filter(account => account !== undefined);
  return <Screen testID="login-screen">
    <View style={styles.top}><Image source={palitoImages.mark} contentFit="contain" style={styles.mark} /><Button title={locale === 'bn' ? 'English' : 'বাংলা'} variant="ghost" onPress={() => void run({ type: 'session.locale', locale: locale === 'bn' ? 'en' : 'bn' })} /></View>
    <View style={styles.intro}><AppText variant="hero" color={colors.brandDeep}>{requested ? t('ফিরে আসার জন্য ধন্যবাদ', 'Welcome back') : t('পালিতে স্বাগতম', 'Welcome to Palito')}</AppText><AppText color={colors.muted}>{requested ? t('আপনার মোবাইল নম্বরের ৬-সংখ্যার যাচাইকরণ কোডটি লিখুন।', 'Enter the 6-digit verification code for your mobile number.') : t('আপনার খামারের যত্ন শুরু হোক এখানেই।', 'A little care today. A healthier farm tomorrow.')}</AppText></View>
    <AppFeedback />
    <Card><Badge tone="info">{t('নিরাপদ ওটিপি লগইন · পালিত প্ল্যাটফর্ম', 'Secure OTP sign-in · Palito platform')}</Badge>
      {requested ? <><Field label={t('যাচাইকরণ কোড', 'Verification code')} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" hint={t('যাচাইকরণ কোড: 123456 · মেয়াদ ৫ মিনিট', 'Verification code: 123456 · valid for 5 minutes')} testID="otp-input" /><Button title={resendSeconds > 0 ? t(`${resendSeconds} সেকেন্ড পরে আবার কোড নিন`, `Resend code in ${resendSeconds}s`) : t('আবার কোড নিন', 'Resend code')} variant="secondary" disabled={resendSeconds > 0 || busy} onPress={() => void requestCode()} testID="resend-otp" /><Button title={t('নম্বর পরিবর্তন করুন', 'Change phone number')} variant="ghost" onPress={() => { setRequested(false); setCode(''); clearError(); clearFeedback(); }} /></> : <Field label={t('মোবাইল নম্বর', 'Mobile number')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder={state.users.find(account => account.role === 'farmer')?.phone} hint={t('আপনার নিবন্ধিত নম্বর দিন অথবা নিচের তালিকা থেকে অ্যাকাউন্ট বেছে নিন।', 'Enter your registered phone number or select an account below.')} testID="phone-input" />}
      <Button title={requested ? t('যাচাই করে প্রবেশ করুন', 'Verify and sign in') : t('যাচাইকরণ কোড নিন', 'Get verification code')} onPress={() => void submit()} loading={busy} testID={requested ? 'verify-otp' : 'request-otp'} />
    </Card>
    <Section title={t('দ্রুত লগইন অ্যাকাউন্ট', 'Quick access accounts')}><Card>{accounts.map(account => <Row key={account.id} title={roleNames[account.role][locale]} subtitle={`${locale === 'bn' ? account.nameBn : account.name} · ${account.phone}`} icon={roleIcons[account.role]} testID={`demo-${account.role}`} onPress={() => { setPhone(account.phone); setRequested(false); setCode(''); clearError(); }} />)}</Card></Section>
    <AppText variant="small" color={colors.muted}>{t('আপনার খামার, চিকিৎসা, বীমা ও ব্যাংকিং তথ্য নিরাপদে সংরক্ষিত থাকে।', 'Your farm, veterinary, insurance, and banking records are securely protected.')}</AppText>
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, mark: { width: 56, height: 56 }, intro: { gap: 10 } });
