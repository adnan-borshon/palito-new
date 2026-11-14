import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';
import type { DemoScenario, Role } from '@palito/shared';
import { palitoImages } from '@/assets/palito/manifest';
import { AppText, Button, Card, Choice, EmptyState, Field, Icon, Row, Screen, Section, type IconName } from '@/components/ui';
import { navigate, roleNames, routeFor } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import type { FeatureProps } from '../types';
import { DemoNotice, layout, Meta, Missing, Status, useConfirmAction } from './helpers';

const roleBadgeIcons: Record<Role, IconName> = {
  farmer: 'leaf-outline',
  vet: 'medkit-outline',
  bank: 'business-outline',
  insurer: 'shield-checkmark-outline',
  admin: 'settings-outline',
};

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
  const avatarImage = user.role === 'farmer' ? palitoImages.farmerAvatar : user.role === 'vet' ? (user.id === 'vet-kamrul' ? palitoImages.vetAvatar2 : palitoImages.vetAvatar1) : undefined;
  return <Screen title={t('আমার প্রোফাইল', 'My profile')} action={<Button title={t('সম্পাদনা', 'Edit')} variant="ghost" onPress={() => navigate(user.role, 'profile-edit')} />}>
    <Card>
      <View style={layout.row}>
        {avatarImage ? (
          <Image source={avatarImage} style={layout.avatar} />
        ) : (
          <View style={[layout.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandPale }]}>
            <Icon name={roleBadgeIcons[user.role]} color={colors.brand} size={28} />
          </View>
        )}
        <View style={layout.flex}>
          <AppText variant="heading">{locale === 'bn' ? user.nameBn : user.name}</AppText>
          <AppText color={colors.muted}>{roleNames[user.role][locale]}</AppText>
        </View>
        <Status value={user.status} />
      </View>
      <Meta label={t('ফোন', 'Phone')} value={user.phone} />
      <Meta label={t('জেলা', 'District')} value={user.district} />
      {user.specialty ? <Meta label={t('বিশেষজ্ঞতা', 'Specialty')} value={user.specialty} /> : null}
    </Card>
    {user.role === 'farmer' ? <Section title={t('আমার সেবা', 'My services')}><Card><Row title={t('সাক্ষাৎ ও চিকিৎসা', 'Appointments and care')} icon="calendar-outline" onPress={() => navigate('farmer', 'appointments')} /><Row title={t('প্রেসক্রিপশন', 'Prescriptions')} icon="document-text-outline" onPress={() => navigate('farmer', 'prescriptions')} /><Row title={t('ওষুধের সময়', 'Medication reminders')} icon="alarm-outline" onPress={() => navigate('farmer', 'reminders')} /><Row title={t('ওষুধ ও খাবার', 'Medicine and feed')} icon="bag-outline" onPress={() => navigate('farmer', 'shop')} /><Row title={t('আমার অর্ডার', 'My orders')} icon="cube-outline" onPress={() => navigate('farmer', 'orders')} /><Row title={t('ঋণ ও বীমা', 'Loans and insurance')} icon="wallet-outline" onPress={() => navigate('farmer', 'wallet')} /></Card></Section> : null}
    {user.role === 'vet' ? <Card><Row title={t('সময়সূচি ও উপস্থিতি', 'Schedule and availability')} icon="time-outline" onPress={() => navigate('vet', 'schedule')} /></Card> : null}
    <Card><Row title={t('বিজ্ঞপ্তি', 'Notifications')} icon="notifications-outline" onPress={() => navigate(user.role, 'notifications')} /><Row title={t('সেটিংস', 'Settings')} icon="settings-outline" onPress={() => navigate(user.role, 'settings')} /><Row title={t('সহায়তা', 'Help and support')} icon="help-circle-outline" onPress={() => navigate(user.role, 'support')} /><Row title={t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & environment switcher')} icon="swap-horizontal-outline" onPress={() => navigate(user.role, 'demo')} /><Row title={t('লগ আউট', 'Sign out')} icon="log-out-outline" danger onPress={() => confirm.open({ type: 'auth.logout' }, t('লগ আউট করবেন?', 'Sign out?'), t('আপনার সংরক্ষিত তথ্য এই ডিভাইসে সুরক্ষিত থাকবে।', 'Your saved records remain safely stored on this device.'), () => router.replace('/login'))} /></Card>
    <Button title={t('English-এ দেখুন', 'বাংলায় দেখুন')} variant="secondary" onPress={() => void run({ type: 'session.locale', locale: locale === 'bn' ? 'en' : 'bn' })} />{confirm.dialog}
  </Screen>;
}
function ProfileEditor() {
  const { user, t, run, busy } = useDemo();
  const [name, setName] = useState(user?.name ?? ''); const [district, setDistrict] = useState(user?.district ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function save() { const next: Record<string, string> = {}; if (name.trim().length < 2) next.name = t('অন্তত ২ অক্ষর দিন', 'Enter at least 2 characters'); if (!district.trim()) next.district = t('জেলা লিখুন', 'Enter your district'); setErrors(next); if (Object.keys(next).length) return; const result = await run({ type: 'profile.update', name, district }); if (result.ok) router.back(); }
  return <Screen title={t('প্রোফাইল সম্পাদনা', 'Edit profile')} back><Field label={t('নাম', 'Name')} value={name} onChangeText={setName} error={errors.name} testID="profile-name" /><Field label={t('জেলা', 'District')} value={district} onChangeText={setDistrict} error={errors.district} /><Field label={t('ফোন নম্বর', 'Phone number')} value={user?.phone} editable={false} hint={t('যাচাইকৃত মোবাইল নম্বর পরিবর্তনযোগ্য নয়।', 'Verified mobile number cannot be changed directly.')} /><Button title={t('সংরক্ষণ করুন', 'Save changes')} onPress={() => void save()} loading={busy} testID="save-profile" /></Screen>;
}
function Settings() {
  const { state, user, locale, t, run } = useDemo();
  return <Screen title={t('সেটিংস', 'Settings')} back><Choice label={t('ভাষা', 'Language')} value={locale} options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'English' }]} onChange={value => void run({ type: 'session.locale', locale: value })} testID="language" /><Card><Row title={t('অ্যাপ বিজ্ঞপ্তি', 'App notifications')} subtitle={t('স্বাস্থ্য সতর্কতা, সাক্ষাৎ ও আর্থিক সেবার আপডেট পান।', 'Receive health alerts, appointment updates, and financial notifications.')} trailing={<Switch accessibilityLabel={t('বিজ্ঞপ্তি চালু', 'Enable notifications')} value={state.settings.notifications} onValueChange={enabled => void run({ type: 'settings.notifications', enabled })} trackColor={{ true: colors.brand }} />} /><Row title={t('তথ্য ও গোপনীয়তা', 'Data and privacy')} subtitle={t('আপনার খামারের তথ্য নিরাপদে ডিভাইসে সংরক্ষিত থাকে।', 'Your farm records are stored securely on your device.')} /><Row title={t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & environment switcher')} onPress={() => user && navigate(user.role, 'demo')} /></Card><DemoNotice /></Screen>;
}
function Notifications({ id }: { id?: string }) {
  const { state, user, locale, t, dateTime, run } = useDemo();
  const [filter, setFilter] = useState('all');
  if (!user) return <Missing />;
  const owned = state.notifications.filter(item => item.userId === user.id);
  const selected = id ? owned.find(item => item.id === id) : undefined;
  const items = selected ? [selected] : owned.filter(item => filter === 'all' || !item.read).slice().reverse();
  if (id && !selected) return <Missing />;
  async function open(item: (typeof owned)[number]) { await run({ type: 'notification.read', notificationId: item.id }); if (item.screen) { const screen = item.screen === 'review-overdue' ? 'claim' : item.screen; navigate(user!.role, screen, item.entityId); } }
  return <Screen title={t('বিজ্ঞপ্তি', 'Notifications')} back action={<Button title={t('সব পড়া', 'Read all')} variant="ghost" disabled={!owned.some(item => !item.read)} onPress={() => void run({ type: 'notification.read' })} />}><Choice label={t('দেখুন', 'Show')} value={filter} options={[{ value: 'all', label: t('সব', 'All') }, { value: 'unread', label: t('অপঠিত', 'Unread') }]} onChange={setFilter} />{items.length ? items.map(item => <Card key={item.id} onPress={() => void open(item)} testID={`notification-${item.id}`}><View style={layout.split}><AppText variant="heading">{item.title[locale]}</AppText>{!item.read ? <Status value="open" /> : null}</View><AppText>{item.body[locale]}</AppText><AppText variant="small" color={colors.muted}>{dateTime(item.createdAt)}</AppText></Card>) : <EmptyState icon="notifications-outline" title={t('নতুন কোনো বার্তা নেই', 'No messages here')} description={t('আপনার সেবার আপডেট এখানে আসবে।', 'Updates about your services appear here.')} />}</Screen>;
}
function DemoControls() {
  const { state, user, locale, t, run, dateTime, busy } = useDemo();
  const [scenario, setScenario] = useState<DemoScenario>(state.settings.scenario);
  const confirm = useConfirmAction();
  const choices: { value: DemoScenario; label: string }[] = [{ value: 'normal', label: t('স্বাভাবিক', 'Normal') }, { value: 'health', label: t('স্বাস্থ্য', 'Health') }, { value: 'insurance', label: t('বীমা', 'Insurance') }, { value: 'lending', label: t('ঋণ', 'Lending') }, { value: 'empty', label: t('খালি', 'Empty') }];
  async function switchAccount(userId: string, role: Role) { const result = await run({ type: 'auth.switch', userId }); if (result.ok) router.replace(routeFor(role)); }
  const seenRoles = new Set<Role>();
  return <Screen title={t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & environment switcher')} back><DemoNotice bn="একই ডিভাইসে বিভিন্ন ভূমিকার অ্যাকাউন্টে প্রবেশ করে সংশ্লিষ্ট প্যানেল ও অনুমোদন প্রবাহ পরীক্ষা করুন।" en="Switch between role accounts on this device to inspect each stakeholder workspace and approval workflow." /><Section title={t('অ্যাকাউন্ট বদলান', 'Switch account')}><Card>{state.users.filter(account => account.status === 'active').map(account => { const firstForRole = !seenRoles.has(account.role); seenRoles.add(account.role); return <Row key={account.id} title={roleNames[account.role][locale]} subtitle={locale === 'bn' ? account.nameBn : account.name} icon={account.id === user?.id ? 'checkmark-circle' : 'person-circle-outline'} testID={firstForRole ? `switch-${account.role}` : `switch-${account.id}`} onPress={() => void switchAccount(account.id, account.role)} />; })}</Card></Section><Section title={t('সংযোগ ও নেটওয়ার্ক পরীক্ষা', 'Connectivity & network checks')}><Card><Row title={t('অফলাইন মোড', 'Offline mode')} subtitle={t('অফলাইন অবস্থায় ক্যাশড তথ্য দেখা যাবে।', 'Inspect cached records while network actions are paused.')} trailing={<Switch accessibilityLabel={t('অফলাইন মোড', 'Offline mode')} value={state.settings.offline} onValueChange={offline => void run({ type: 'demo.offline', offline })} trackColor={{ true: colors.brand }} />} /><Button title={t('পরের অনুরোধে ত্রুটি পরীক্ষা করুন', 'Test network retry on next action')} variant="secondary" onPress={() => void run({ type: 'demo.failNext' })} loading={busy} testID="fail-next" /></Card></Section><Section title={t('সিস্টেম সময় অগ্রসর করুন', 'System time progression')}><Card><Meta label={t('বর্তমান সময়', 'Current time')} value={dateTime(state.now)} /><AppText variant="small" color={colors.muted}>{t('৪ ঘণ্টা এগিয়ে অমীমাংসিত সতর্কতার স্বয়ংক্রিয় এসকেলেশন যাচাই করুন।', 'Advance four hours to verify automatic escalation of unacknowledged alerts.')}</AppText><Button title={t('৪ ঘণ্টা এগোন', 'Advance 4 hours')} onPress={() => void run({ type: 'demo.advanceTime', hours: 4 })} testID="advance-four-hours" /><Button title={t('১ দিন এগোন', 'Advance 1 day')} variant="secondary" onPress={() => void run({ type: 'demo.advanceTime', hours: 24 })} /></Card></Section><Section title={t('ডেটা প্রিসেট ও রিসেট', 'Data presets & reset')}><Choice label={t('প্রিসেট', 'Preset')} value={scenario} options={choices} onChange={setScenario} /><Button title={t('ডেটা রিসেট করুন', 'Reset workspace data')} variant="danger" testID="reset-demo" onPress={() => confirm.open({ type: 'demo.reset', scenario }, t('সব পরিবর্তন রিসেট করবেন?', 'Reset all workspace changes?'), t('নির্বাচিত প্রিসেট অনুযায়ী প্রাথমিক তথ্য পুনরায় লোড হবে। ভাষা ও বর্তমান ভূমিকা অপরিবর্তিত থাকবে।', 'Workspace records will be restored to the selected preset. Language and current role are preserved.'), undefined, true)} /></Section>{confirm.dialog}</Screen>;
}
function Support() {
  const { t, user } = useDemo();
  return <Screen title={t('সহায়তা ও নির্দেশিকা', 'Help and support')} back><Image source={palitoImages.support} style={layout.image} contentFit="contain" /><Section title={t('কীভাবে শুরু করব?', 'How do I get started?')}><Card><AppText>{t('খামারি হিসেবে খামার ও পশু নিবন্ধন করুন। পশুর ডিজিটাল স্বাস্থ্য পাসপোর্ট থেকে ভ্যাকসিন, আইওটি সেন্সর, টেলিমেডিসিন ও আর্থিক সেবার তথ্য এক জায়গায় পাবেন।', 'Register your farm and livestock to activate digital health passports linking vaccinations, IoT sensors, telemedicine, and financial services.')}</AppText></Card></Section><Section title={t('জরুরি পশুচিকিৎসা ও বীমা দাবি কীভাবে কাজ করে?', 'How do emergency care and insurance claims work?')}><Card><AppText>{t('জরুরি লক্ষণ বা সেন্সর সতর্কতা দেখা দিলে সরাসরি ভেট ভিডিও পরামর্শ বা খামার পরিদর্শনের অনুরোধ পাঠাতে পারেন। বীমা দাবির ক্ষেত্রে ছবি, জিপিএস ও ৪৮ ঘণ্টার আইওটি তথ্য যাচাই করা হয়।', 'When urgent symptoms or sensor alerts arise, request a video consult or farm visit immediately. Insurance claims verify photos, GPS location, and 48-hour IoT telemetry.')}</AppText></Card></Section><Section title={t('সহায়তা কেন্দ্র ও যোগাযোগ', 'Support hotline & contact')}><Card><Meta label={t('হেল্পলাইন', 'Helpline')} value="১৬২৬৩ / +880 9612-725486" /><Meta label={t('সেবার সময়', 'Service hours')} value={t('প্রতিদিন সকাল ৮টা – রাত ১০টা (ঢাকা সময়)', 'Daily 8:00 AM – 10:00 PM (Asia/Dhaka)')} /><Meta label={t('ইমেইল', 'Email')} value="support@palito.com.bd" /></Card></Section>{user ? <Button title={t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & environment switcher')} variant="secondary" onPress={() => navigate(user.role, 'demo')} /> : null}</Screen>;
}
