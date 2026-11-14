import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Badge, Button, Card, EmptyState, Icon, Screen, Section, type IconName } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';
import { AnimalCard, go, s, TextLink } from './components';

export function FarmerHome() {
  const { state, user, t, locale } = useDemo();
  const animals = state.animals.filter(a => a.ownerId === user?.id && a.status !== 'sold' && a.status !== 'deceased');
  const farm = state.farms.find(f => f.ownerId === user?.id);
  const ids = new Set(animals.map(a => a.id));
  const alert = state.alerts.find(a => ids.has(a.animalId) && ['open', 'escalated'].includes(a.status));
  const vets = state.users.filter(u => u.role === 'vet' && u.status === 'active').slice(0, 5);
  const unread = state.notifications.filter(n => n.userId === user?.id && !n.read).length;
  const healthy = animals.filter(a => a.status === 'healthy').length;
  const connected = state.devices.filter(d => ids.has(d.animalId) && d.connected).length;
  const learning = state.content.filter(c => c.status === 'published').slice(0, 3);
  const count = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en').format(n);
  const quick: { title: string; hint: string; icon: IconName; screen: string; tint: string; color: string }[] = [
    { title: t('ভেট কল', 'Call a vet'), hint: t('সাক্ষাৎ বুক করুন', 'Book care'), icon: 'call-outline', screen: 'vets', tint: '#EFF6FF', color: '#1D4ED8' },
    { title: t('বীমা করুন', 'Insure livestock'), hint: t('পশুর সুরক্ষা', 'Protect your herd'), icon: 'shield-checkmark-outline', screen: 'insurance', tint: '#FFFBEB', color: '#92400E' },
    { title: t('ঋণ আবেদন', 'Apply for a loan'), hint: t('স্বাস্থ্যভিত্তিক অফার', 'Health-based offer'), icon: 'trending-up-outline', screen: 'loan-apply', tint: colors.brandPale, color: colors.brandDark },
    { title: t('জিজ্ঞাসা', 'Ask Palito'), hint: t('পশুর যত্নের সহায়তা', 'Livestock guidance'), icon: 'sparkles-outline', screen: 'ai', tint: '#F3E8FF', color: '#7E22CE' },
  ];
  const portraits = [palitoImages.vetAvatar1, palitoImages.vetAvatar2, palitoImages.vetAvatar3, palitoImages.vetAvatar4, palitoImages.vetAvatar5];
  return <Screen testID="farmer-home" style={s.noPadding}>
    <View style={s.hero}>
      <View style={s.row}><View style={s.flex}><AppText variant="heading" color="white">{t('স্বাগতম, ', 'Welcome, ')}{locale === 'bn' ? user?.nameBn : user?.name}</AppText><AppText variant="small" color="#D8E9DE">{farm?.name ?? t('আপনার খামার', 'Your farm')} · {farm?.district ?? user?.district}</AppText></View><Pressable style={s.iconButton} accessibilityRole="button" accessibilityLabel={t('বিজ্ঞপ্তি, অপঠিত ', 'Notifications, unread ') + unread} onPress={() => go('notifications')}><Icon name="notifications-outline" color="white" />{unread > 0 ? <View style={styles.dot} /> : null}</Pressable></View>
      <View style={styles.summary}>{[[t('মোট পশু', 'Animals'), animals.length], [t('সুস্থ', 'Healthy'), healthy], [t('সংযুক্ত', 'Connected'), connected]].map(([label, value]) => <View style={styles.summaryItem} key={label}><AppText variant="small" color="#D8E9DE">{label}</AppText><AppText variant="title" color="white">{count(Number(value))}</AppText></View>)}</View>
    </View>
    <View style={s.page}>
      {!farm ? <Card><AppText variant="heading">{t('আপনার খামার দিয়ে শুরু করুন', 'Start with your farm')}</AppText><AppText>{t('খামারের তথ্য এবং প্রথম পশু যোগ করুন।', 'Add farm details and your first animal.')}</AppText><Button title={t('খামার সেটআপ', 'Set up farm')} onPress={() => go('farm')} /></Card> : null}
      {alert ? <View style={styles.critical} accessibilityRole="alert"><View style={s.row}><Icon name="warning-outline" color="white" /><AppText variant="label" color="white" style={s.flex}>{alert.title[locale]}</AppText></View><AppText variant="small" color="white">{alert.message[locale]}</AppText><Button title={t('সতর্কতা দেখুন', 'Review alert')} variant="secondary" icon="arrow-forward" onPress={() => go('alert', alert.id)} /></View> : <Card style={styles.safe}><View style={s.row}><Icon name="shield-checkmark-outline" /><AppText variant="label" style={s.flex}>{t('আপনার খামারের খোঁজ এক জায়গায়', 'Your farm, at a glance')}</AppText></View><TextLink title={t('সব সতর্কতা', 'All alerts')} onPress={() => go('alerts')} /></Card>}
      <Section title={t('দ্রুত সেবা', 'Quick care')}><View style={styles.quickGrid}>{quick.map(q => <Pressable key={q.screen} accessibilityRole="button" accessibilityLabel={q.title} onPress={() => go(q.screen)} style={({ pressed }) => [styles.quick, { backgroundColor: q.tint, opacity: pressed ? 0.7 : 1 }]}><Icon name={q.icon} color={q.color} size={25} /><View style={s.flex}><AppText variant="label">{q.title}</AppText><AppText variant="caption" color={colors.muted}>{q.hint}</AppText></View></Pressable>)}</View></Section>
      <Section title={t('আমার পশুসম্পদ', 'My livestock')} action={<TextLink title={t('সব', 'All')} onPress={() => go('animals')} />}>{animals.length ? animals.slice(0, 3).map(a => <AnimalCard key={a.id} animal={a} />) : <EmptyState title={t('প্রথম পশু যোগ করুন', 'Add your first animal')} description={t('স্বাস্থ্য ও আর্থিক রেকর্ড একসঙ্গে রাখুন।', 'Keep health and financial records together.')} action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go(farm ? 'animal-add' : 'farm')} />} />}</Section>
      <Section title={t('ভেট কনসালটেশন', 'Veterinary care')}><Card style={styles.softCard}><View style={styles.portraits}>{vets.map((v, i) => <Pressable key={v.id} onPress={() => go('vet', v.id)} style={styles.portraitButton} accessibilityRole="button" accessibilityLabel={locale === 'bn' ? v.nameBn : v.name}><Image source={portraits[i]} contentFit="cover" style={styles.portrait} /></Pressable>)}</View><AppText variant="small" style={styles.center}>{t('আপনার পশুর জন্য অভিজ্ঞ চিকিৎসকের পরামর্শ', 'Experienced care for your livestock')}</AppText><Button title={t('পছন্দের ভেট খুঁজুন', 'Find a veterinarian')} variant="ghost" onPress={() => go('vets')} /></Card></Section>
      <Section title={t('যত্নের সময়সূচি', 'Care reminders')}><Card onPress={() => go('reminders')} style={styles.illustrated}><View style={s.flex}><AppText variant="label">{t('সময়মতো ওষুধ, সুস্থ পশু', 'Care on time, healthier animals')}</AppText><AppText variant="small" color={colors.muted}>{t('প্রেসক্রিপশন ও ওষুধের সময় দেখুন', 'Review prescriptions and medication times')}</AppText><AppText variant="label" color={colors.brand}>{t('রিমাইন্ডার দেখুন', 'View reminders')}</AppText></View><Image source={palitoImages.medication} contentFit="contain" style={styles.medication} /></Card></Section>
      <Section title={t('সচেতন থাকুন', 'Stay informed')}><Card onPress={() => go('education')} style={styles.softCard}><Image source={palitoImages.diseaseAwareness} contentFit="contain" style={styles.awareness} /><AppText variant="heading" style={styles.center}>{t('পশুর আচরণের পরিবর্তন খেয়াল করুন', 'Notice changes in your animal')}</AppText><AppText variant="small" color={colors.muted} style={styles.center}>{t('স্বাস্থ্য, খাবার ও পরিচর্যা নিয়ে সহজ পাঠ।', 'Simple guides to health, feeding and daily care.')}</AppText><Button title={t('যত্নের নির্দেশিকা', 'Explore care guides')} variant="ghost" onPress={() => go('education')} /></Card></Section>
      <Card onPress={() => go('ai')}><View style={s.row}><Icon name="sparkles-outline" /><AppText variant="label">{t('পালিত AI সহকারী', 'Palito AI assistant')}</AppText><Badge>{t('ডেমো', 'Demo')}</Badge></View><AppText>{t('আপনার পশুর লক্ষণ লিখুন অথবা ভয়েস ডেমো চেষ্টা করুন।', 'Describe your animal’s symptoms or try the voice demo.')}</AppText><TextLink title={t('কথা বলুন', 'Start a conversation')} onPress={() => go('ai')} /></Card>
      <Section title={t('শিক্ষা ও নির্দেশিকা', 'Learn and grow')} action={<TextLink title={t('সব', 'All')} onPress={() => go('education')} />}>{learning.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.articleRail}>{learning.map((item, i) => <Card key={item.id} onPress={() => go('article', item.id)} style={styles.article}><Image source={i % 2 ? palitoImages.articleCattle : palitoImages.articleFarm} contentFit="cover" style={styles.articleImage} /><View style={styles.articleText}><AppText variant="label">{item.title[locale]}</AppText><AppText variant="small" color={colors.brand}>{t('পড়ুন', 'Read guide')}</AppText></View></Card>)}</ScrollView> : <AppText color={colors.muted}>{t('নতুন নির্দেশিকা শীঘ্রই এখানে থাকবে।', 'New guides will appear here.')}</AppText>}</Section>
      <Card style={styles.illustrated}><View style={s.flex}><AppText variant="label">{t('সহায়তা প্রয়োজন?', 'Need help?')}</AppText><AppText variant="small">{t('জরুরি পশু চিকিৎসার অনুরোধ করুন।', 'Request urgent veterinary support.')}</AppText><TextLink title={t('জরুরি সেবা', 'Emergency care')} onPress={() => go('emergency')} /></View><Image source={palitoImages.support} contentFit="contain" style={styles.support} /></Card>
    </View>
  </Screen>;
}

export function EducationScreen({ id }: { id?: string }) {
  const { state, t, locale, date } = useDemo();
  const items = state.content.filter(c => c.status === 'published');
  const item = items.find(c => c.id === id);
  return <Screen title={t('শিক্ষা ও নির্দেশিকা', 'Care guides')} back>{id ? item ? <><Image source={palitoImages.articleFarm} contentFit="cover" style={styles.articleHero} /><AppText variant="title">{item.title[locale]}</AppText><AppText variant="small" color={colors.muted}>{date(item.updatedAt)}</AppText><AppText>{item.body[locale]}</AppText><Button title={t('ভেটের পরামর্শ নিন', 'Ask a veterinarian')} onPress={() => go('vets')} /></> : <EmptyState title={t('লেখাটি পাওয়া যায়নি', 'Guide unavailable')} action={<Button title={t('সব নির্দেশিকা', 'All guides')} onPress={() => go('education')} />} /> : items.length ? items.map(c => <Card key={c.id} onPress={() => go('article', c.id)}><AppText variant="heading">{c.title[locale]}</AppText><AppText variant="small" color={colors.muted}>{date(c.updatedAt)}</AppText></Card>) : <EmptyState title={t('এখনো নির্দেশিকা নেই', 'No guides yet')} />}</Screen>;
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', right: 10, top: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FB7185' },
  summary: { flexDirection: 'row', gap: 10 }, summaryItem: { flex: 1, padding: 12, backgroundColor: '#15582E', borderRadius: 16, alignItems: 'center' },
  critical: { backgroundColor: '#D41406', borderRadius: 16, padding: 16, gap: 10 }, safe: { backgroundColor: colors.brandPale, borderWidth: 0 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quick: { flexBasis: '46%', flexGrow: 1, minHeight: 90, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  softCard: { borderWidth: 0, borderRadius: 24 }, portraits: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  portraitButton: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' }, portrait: { width: 52, height: 52 },
  center: { textAlign: 'center' }, illustrated: { flexDirection: 'row', overflow: 'hidden', borderWidth: 0 },
  medication: { width: 110, height: 100, alignSelf: 'center' }, support: { width: 110, height: 125, alignSelf: 'flex-end' },
  awareness: { width: '100%', height: 166 }, articleRail: { gap: 12 }, article: { width: 270, padding: 0, overflow: 'hidden', borderWidth: 0, borderRadius: 24 },
  articleImage: { width: '100%', height: 150 }, articleText: { padding: 16, gap: 12 }, articleHero: { width: '100%', height: 200, borderRadius: 16 },
});

