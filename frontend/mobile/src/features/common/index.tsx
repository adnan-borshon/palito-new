import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';
import type { DemoScenario, Role } from '@palito/shared';
import { palitoImages } from '@/assets/palito/manifest';
import { AppText, Button, Card, Choice, EmptyState, Field, Row, Screen, Section } from '@/components/ui';
import { navigate, roleNames, routeFor } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import type { FeatureProps } from '../types';
import { DemoNotice, layout, Meta, Missing, Status, useConfirmAction } from './helpers';

export const COMMON_SCREENS = ['profile', 'profile-edit', 'settings', 'notifications', 'support', 'demo'] as const;
export default function CommonFeature({ screen, id }: FeatureProps) {
  if (screen === 'profile') return <Profile />;
  if (screen === 'profile-edit') return <ProfileEditor />;
  if (screen === 'settings') return <Settings />;
  if (screen === 'notifications') return <Notifications id={id} />;
  if (screen === 'demo') return <DemoControls />;
  return <Support />;
}
function Profile() {
  const { user, locale, t, run } = useDemo();
  const confirm = useConfirmAction();
  if (!user) return <Missing />;
  return <Screen title={t('আমার প্রোফাইল', 'My profile')} action={<Button title={t('সম্পাদনা', 'Edit')} variant="ghost" onPress={() => navigate(user.role, 'profile-edit')} />}>
    <Card><View style={layout.row}><Image source={user.role === 'farmer' ? palitoImages.farmerAvatar : palitoImages.vetAvatar1} style={layout.avatar} /><View style={layout.flex}><AppText variant="heading">{locale === 'bn' ? user.nameBn : user.name}</AppText><AppText color={colors.muted}>{roleNames[user.role][locale]}</AppText></View><Status value={user.status} /></View><Meta label={t('ফোন', 'Phone')} value={user.phone} /><Meta label={t('জেলা', 'District')} value={user.district} /></Card>
    {user.role === 'farmer' ? <Section title={t('আমার সেবা', 'My services')}><Card><Row title={t('সাক্ষাৎ ও চিকিৎসা', 'Appointments and care')} icon="calendar-outline" onPress={() => navigate('farmer', 'appointments')} /><Row title={t('প্রেসক্রিপশন', 'Prescriptions')} icon="document-text-outline" onPress={() => navigate('farmer', 'prescriptions')} /><Row title={t('ওষুধের সময়', 'Medication reminders')} icon="alarm-outline" onPress={() => navigate('farmer', 'reminders')} /><Row title={t('ওষুধ ও খাবার', 'Medicine and feed')} icon="bag-outline" onPress={() => navigate('farmer', 'shop')} /><Row title={t('আমার অর্ডার', 'My orders')} icon="cube-outline" onPress={() => navigate('farmer', 'orders')} /><Row title={t('ঋণ ও বীমা', 'Loans and insurance')} icon="wallet-outline" onPress={() => navigate('farmer', 'wallet')} /></Card></Section> : null}
    {user.role === 'vet' ? <Card><Row title={t('সময়সূচি ও উপস্থিতি', 'Schedule and availability')} icon="time-outline" onPress={() => navigate('vet', 'schedule')} /></Card> : null}
    <Card><Row title={t('বিজ্ঞপ্তি', 'Notifications')} icon="notifications-outline" onPress={() => navigate(user.role, 'notifications')} /><Row title={t('সেটিংস', 'Settings')} icon="settings-outline" onPress={() => navigate(user.role, 'settings')} /><Row title={t('সহায়তা', 'Help and support')} icon="help-circle-outline" onPress={() => navigate(user.role, 'support')} /><Row title={t('ডেমো নিয়ন্ত্রণ', 'Demo controls')} icon="flask-outline" onPress={() => navigate(user.role, 'demo')} /><Row title={t('লগ আউট', 'Sign out')} icon="log-out-outline" danger onPress={() => confirm.open({ type: 'auth.logout' }, t('লগ আউট করবেন?', 'Sign out?'), t('এই ডিভাইসে আপনার ডেমো তথ্য থাকবে।', 'Your demo records remain on this device.'), () => router.replace('/login'))} /></Card>
    <Button title={t('English-এ দেখুন', 'বাংলায় দেখুন')} variant="secondary" onPress={() => void run({ type: 'session.locale', locale: locale === 'bn' ? 'en' : 'bn' })} />{confirm.dialog}
  </Screen>;
}
function ProfileEditor() {
  const { user, t, run, busy } = useDemo();
  const [name, setName] = useState(user?.name ?? ''); const [district, setDistrict] = useState(user?.district ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function save() { const next: Record<string, string> = {}; if (name.trim().length < 2) next.name = t('অন্তত ২ অক্ষর দিন', 'Enter at least 2 characters'); if (!district.trim()) next.district = t('জেলা লিখুন', 'Enter your district'); setErrors(next); if (Object.keys(next).length) return; const result = await run({ type: 'profile.update', name, district }); if (result.ok) router.back(); }
  return <Screen title={t('প্রোফাইল সম্পাদনা', 'Edit profile')} back><Field label={t('নাম', 'Name')} value={name} onChangeText={setName} error={errors.name} testID="profile-name" /><Field label={t('জেলা', 'District')} value={district} onChangeText={setDistrict} error={errors.district} /><Field label={t('ফোন নম্বর', 'Phone number')} value={user?.phone} editable={false} hint={t('ডেমো অ্যাকাউন্টের নম্বর স্থির।', 'Demo account phone numbers are fixed.')} /><Button title={t('সংরক্ষণ করুন', 'Save changes')} onPress={() => void save()} loading={busy} testID="save-profile" /></Screen>;
}
function Settings() {
  const { state, user, locale, t, run } = useDemo();
  return <Screen title={t('সেটিংস', 'Settings')} back><Choice label={t('ভাষা', 'Language')} value={locale} options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'English' }]} onChange={value => void run({ type: 'session.locale', locale: value })} testID="language" /><Card><Row title={t('ডেমো বিজ্ঞপ্তি', 'Demo notifications')} subtitle={t('এই অ্যাপের ভেতরের বার্তা; পুশ সেবা নেই।', 'Messages inside this app; no push service.')} trailing={<Switch accessibilityLabel={t('ডেমো বিজ্ঞপ্তি চালু', 'Enable demo notifications')} value={state.settings.notifications} onValueChange={enabled => void run({ type: 'settings.notifications', enabled })} trackColor={{ true: colors.brand }} />} /><Row title={t('তথ্য ও গোপনীয়তা', 'Data and privacy')} subtitle={t('এই ডিভাইসে সংরক্ষিত অনুশীলনের তথ্য।', 'Practice data stored on this device.')} /><Row title={t('ডেমো রিসেট ও পরিস্থিতি', 'Demo reset and scenarios')} onPress={() => user && navigate(user.role, 'demo')} /></Card><DemoNotice /></Screen>;
}
function Notifications({ id }: { id?: string }) {
  const { state, user, locale, t, date, run } = useDemo();
  const [filter, setFilter] = useState('all');
  if (!user) return <Missing />;
  const owned = state.notifications.filter(item => item.userId === user.id);
  const selected = id ? owned.find(item => item.id === id) : undefined;
  const items = selected ? [selected] : owned.filter(item => filter === 'all' || !item.read).slice().reverse();
  if (id && !selected) return <Missing />;
  async function open(item: (typeof owned)[number]) { await run({ type: 'notification.read', notificationId: item.id }); if (item.screen) { const screen = item.screen === 'review-overdue' ? 'claim' : item.screen; navigate(user!.role, screen, item.entityId); } }
  return <Screen title={t('বিজ্ঞপ্তি', 'Notifications')} back action={<Button title={t('সব পড়া', 'Read all')} variant="ghost" disabled={!owned.some(item => !item.read)} onPress={() => void run({ type: 'notification.read' })} />}><Choice label={t('দেখুন', 'Show')} value={filter} options={[{ value: 'all', label: t('সব', 'All') }, { value: 'unread', label: t('অপঠিত', 'Unread') }]} onChange={setFilter} />{items.length ? items.map(item => <Card key={item.id} onPress={() => void open(item)} testID={`notification-${item.id}`}><View style={layout.split}><AppText variant="heading">{item.title[locale]}</AppText>{!item.read ? <Status value="open" /> : null}</View><AppText>{item.body[locale]}</AppText><AppText variant="small" color={colors.muted}>{date(item.createdAt)}</AppText></Card>) : <EmptyState icon="notifications-outline" title={t('নতুন কোনো বার্তা নেই', 'No messages here')} description={t('আপনার সেবার আপডেট এখানে আসবে।', 'Updates about your services appear here.')} />}</Screen>;
}
function DemoControls() {
  const { state, user, locale, t, run, date, busy } = useDemo();
  const [scenario, setScenario] = useState<DemoScenario>(state.settings.scenario);
  const confirm = useConfirmAction();
  const choices: { value: DemoScenario; label: string }[] = [{ value: 'normal', label: t('স্বাভাবিক', 'Normal') }, { value: 'health', label: t('স্বাস্থ্য', 'Health') }, { value: 'insurance', label: t('বীমা', 'Insurance') }, { value: 'lending', label: t('ঋণ', 'Lending') }, { value: 'empty', label: t('খালি', 'Empty') }];
  async function switchAccount(userId: string, role: Role) { const result = await run({ type: 'auth.switch', userId }); if (result.ok) router.replace(routeFor(role)); }
  return <Screen title={t('ডেমো নিয়ন্ত্রণ', 'Demo controls')} back><DemoNotice bn="একই ডিভাইসে ভূমিকা বদলালে একই রেকর্ডের অন্য দিক দেখতে পাবেন।" en="Switch roles on this device to see another side of the same records." /><Section title={t('অ্যাকাউন্ট বদলান', 'Switch account')}><Card>{state.users.filter(account => account.status === 'active').map(account => <Row key={account.id} title={roleNames[account.role][locale]} subtitle={locale === 'bn' ? account.nameBn : account.name} icon={account.id === user?.id ? 'checkmark-circle' : 'person-circle-outline'} testID={`switch-${account.role}`} onPress={() => void switchAccount(account.id, account.role)} />)}</Card></Section><Section title={t('ত্রুটি ও সংযোগ পরীক্ষা', 'Error and connection checks')}><Card><Row title={t('অফলাইন', 'Offline')} subtitle={t('সিমুলেটেড সার্ভার কাজ ব্যর্থ হবে।', 'Simulated server actions will fail.')} trailing={<Switch accessibilityLabel={t('অফলাইন মোড', 'Offline mode')} value={state.settings.offline} onValueChange={offline => void run({ type: 'demo.offline', offline })} trackColor={{ true: colors.brand }} />} /><Button title={t('পরের অনুরোধে ত্রুটি দেখান', 'Fail the next server action')} variant="secondary" onPress={() => void run({ type: 'demo.failNext' })} loading={busy} testID="fail-next" /></Card></Section><Section title={t('ডেমোর সময়', 'Demo time')}><Card><Meta label={t('বর্তমান তারিখ', 'Current date')} value={date(state.now)} /><AppText variant="small" color={colors.muted}>{t('৪ ঘণ্টা এগিয়ে অমীমাংসিত সতর্কতার এসকেলেশন দেখুন।', 'Advance four hours to review escalation of unacknowledged alerts.')}</AppText><Button title={t('৪ ঘণ্টা এগোন', 'Advance 4 hours')} onPress={() => void run({ type: 'demo.advanceTime', hours: 4 })} testID="advance-four-hours" /><Button title={t('১ দিন এগোন', 'Advance 1 day')} variant="secondary" onPress={() => void run({ type: 'demo.advanceTime', hours: 24 })} /></Card></Section><Section title={t('নতুন পরিস্থিতি', 'Start a scenario')}><Choice label={t('পরিস্থিতি', 'Scenario')} value={scenario} options={choices} onChange={setScenario} /><Button title={t('ডেমো তথ্য রিসেট করুন', 'Reset demo data')} variant="danger" testID="reset-demo" onPress={() => confirm.open({ type: 'demo.reset', scenario }, t('সব ডেমো পরিবর্তন মুছবেন?', 'Reset all demo changes?'), t('এই ডিভাইসের ডেমো কাজ মুছে নির্বাচিত নমুনা তথ্য বসবে। ভাষা ও বর্তমান ভূমিকা থাকবে।', 'Demo changes on this device will be replaced by the selected sample records. Language and current role are kept.'), undefined, true)} /></Section>{confirm.dialog}</Screen>;
}
function Support() {
  const { t, user } = useDemo();
  return <Screen title={t('সহায়তা', 'Help and support')} back><Image source={palitoImages.support} style={layout.image} contentFit="contain" /><Section title={t('কীভাবে শুরু করব?', 'How do I get started?')}><Card><AppText>{t('খামারি হিসেবে খামার ও পশু যোগ করুন। পশুর পাসপোর্ট থেকে স্বাস্থ্য, ডিভাইস ও সেবার তথ্য দেখুন।', 'As a farmer, add your farm and animals. The animal passport links health, devices and services.')}</AppText></Card></Section><Section title={t('ভূমিকা বদলালে কী হয়?', 'What happens when I switch roles?')}><Card><AppText>{t('ডেমো নিয়ন্ত্রণ থেকে অন্য ভূমিকা বেছে নিন। একই আবেদন বা সাক্ষাৎ সংশ্লিষ্ট পেশাজীবীর কাছে দেখা যাবে।', 'Choose another role in Demo controls. The same application or appointment appears for the relevant professional.')}</AppText></Card></Section><Section title={t('আমার তথ্য কোথায়?', 'Where is my data?')}><Card><AppText>{t('এই অ্যাপের তথ্য এই ডিভাইসে থাকে। অন্য ডিভাইসে সিঙ্ক হয় না। রিসেট করলে ডেমো পরিবর্তন মুছে যায়।', 'App records stay on this device and do not sync to another device. Reset removes demo changes.')}</AppText></Card></Section>{user ? <Button title={t('ডেমো নিয়ন্ত্রণ খুলুন', 'Open demo controls')} onPress={() => navigate(user.role, 'demo')} /> : null}<DemoNotice bn="এই ডেমোতে বাস্তব সহায়তা কল বা জরুরি সেবা পাঠানো যায় না।" en="This demo cannot place a real support call or dispatch emergency services." /></Screen>;
}
