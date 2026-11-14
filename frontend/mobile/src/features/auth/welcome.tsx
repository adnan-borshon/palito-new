import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { palitoImages } from '@/assets/palito/manifest';
import { AppText, Badge, Button, Screen } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';

export default function Welcome() {
  const { t, locale, run, busy } = useDemo();
  const [step, setStep] = useState(0);
  const pages = [
    { title: t('সুস্থ পশু,\nসমৃদ্ধ খামার', 'Healthy animals.\nA thriving farm.'), body: t('আপনার খামারের যত্ন, এখন আপনার হাতেই। স্বাস্থ্য, চিকিৎসা ও আর্থিক সেবা—সব একসাথে।', 'Care for your farm, right in your hands. Animal health, veterinary care and financial services together.') },
    { title: t('যত্নে থাকুক\nপ্রতিটি প্রাণ', 'Every animal.\nCarefully cared for.'), body: t('পশুর স্বাস্থ্য দেখুন, সতর্কতা পান এবং প্রয়োজনে পশুচিকিৎসকের সহায়তা নিন।', 'Follow animal health, notice alerts and reach a veterinarian when your animals need care.') },
    { title: t('আগামীর জন্য\nনিরাপদ খামার', 'A secure farm.\nA brighter tomorrow.'), body: t('যাচাইকৃত স্বাস্থ্য পাসপোর্টের মাধ্যমে পশুবীমা ও সহজ শর্তে খামার ঋণ সুবিধা পান।', 'Access livestock insurance and health-linked farm credit backed by verified digital health passports.') },
  ];
  async function finish() { const result = await run({ type: 'session.onboard' }); if (result.ok) router.replace('/login'); }
  return <Screen testID="welcome-screen" style={styles.content}>
    <View style={styles.top}><View style={styles.brand}><Image source={palitoImages.mark} style={styles.mark} contentFit="contain" /><AppText variant="title" color={colors.brandDeep}>পালিত</AppText></View><Button title={locale === 'bn' ? 'English' : 'বাংলা'} variant="ghost" onPress={() => void run({ type: 'session.locale', locale: locale === 'bn' ? 'en' : 'bn' })} /></View>
    <View style={styles.illustration}><Image source={palitoImages.onboarding} style={styles.image} contentFit="contain" accessibilityLabel={t('পালিতের পশুস্বাস্থ্য সেবা', 'Palito livestock care services')} /></View>
    <View style={styles.copy}><Badge tone="success">{t('আপনার খামারের বিশ্বস্ত সঙ্গী', 'Your trusted farming companion')}</Badge><AppText variant="hero" color={colors.brandDeep}>{pages[step].title}</AppText><AppText color={colors.muted}>{pages[step].body}</AppText></View>
    <View style={styles.dots} accessibilityLabel={t(`৩টির মধ্যে ${step + 1} নম্বর পরিচিতি`, `Introduction ${step + 1} of 3`)}>{pages.map((_, i) => <View key={i} style={[styles.dot, i === step && styles.activeDot]} />)}</View>
    <Button title={step === 2 ? t('শুরু করুন', 'Get started') : t('পরবর্তী', 'Continue')} icon="arrow-forward" loading={busy} onPress={() => step === 2 ? void finish() : setStep(step + 1)} testID="welcome-continue" />
    {step < 2 ? <Button title={t('পরিচিতি এড়িয়ে যান', 'Skip introduction')} variant="ghost" onPress={() => void finish()} testID="welcome-skip" /> : null}
  </Screen>;
}
const styles = StyleSheet.create({ content: { gap: 20 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { flexDirection: 'row', gap: 8, alignItems: 'center' }, mark: { width: 36, height: 36 }, illustration: { alignItems: 'center', backgroundColor: colors.brandPale, borderRadius: 32, padding: 16 }, image: { width: '100%', maxWidth: 320, height: 230 }, copy: { gap: 16 }, dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#C9D9CE' }, activeDot: { width: 24, backgroundColor: colors.brand } });
