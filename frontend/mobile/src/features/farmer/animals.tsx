import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import type { Animal, AnimalInput } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, Confirm, EmptyState, Field, Icon, Row, Screen, Section } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';
import { AnimalCard, AnimalStatus, go, MissingRecord, s, TextLink } from './components';
import { Vitals } from './monitoring';

export const numeric = (text: string) => Number(text.replace(/[০-৯]/g, char => String('০১২৩৪৫৬৭৮৯'.indexOf(char))));
const keyExtractor = (animal: Animal) => animal.id;

export function AnimalsScreen() {
  const { state, user, t } = useDemo();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const owned = state.animals.filter(a => a.ownerId === user?.id);
  const animals = owned.filter(a => (filter === 'archived' ? a.status === 'sold' || a.status === 'deceased' : a.status !== 'sold' && a.status !== 'deceased') && (filter !== 'attention' || a.status !== 'healthy') && (a.name + a.tag + a.breed).toLowerCase().includes(query.trim().toLowerCase()));
  const render = useCallback(({ item }: { item: Animal }) => <AnimalCard animal={item} />, []);
  return <Screen title={t('আমার পশু', 'My animals')} scroll={false} style={styles.listPage} action={<Button title={t('যোগ', 'Add')} icon="add" variant="ghost" onPress={() => go(state.farms.some(f => f.ownerId === user?.id) ? 'animal-add' : 'farm')} />}>
    <Field label={t('পশু খুঁজুন', 'Find an animal')} value={query} onChangeText={setQuery} placeholder={t('নাম, ট্যাগ বা জাত', 'Name, tag or breed')} testID="animal-search" />
    <Choice label={t('তালিকা', 'Show')} value={filter} onChange={setFilter} options={[{ value: 'all', label: t('সক্রিয়', 'Active') }, { value: 'attention', label: t('যত্ন প্রয়োজন', 'Needs care') }, { value: 'archived', label: t('সংরক্ষিত', 'Archived') }]} />
    <FlatList data={animals} keyExtractor={keyExtractor} renderItem={render} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled" ListEmptyComponent={<EmptyState title={query ? t('কোনো মিল পাওয়া যায়নি', 'No matching animals') : t('এখানে কোনো পশু নেই', 'No animals here')} description={t('ফিল্টার বদলান অথবা আপনার পশু যোগ করুন।', 'Change the filter or register your animal.')} action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go(state.farms.some(f => f.ownerId === user?.id) ? 'animal-add' : 'farm')} />} />} />
  </Screen>;
}

export function AnimalEditor({ id }: { id?: string }) {
  const { state, user, t, run, busy } = useDemo();
  const animal = state.animals.find(a => a.id === id && a.ownerId === user?.id);
  const [name, setName] = useState(animal?.name ?? '');
  const [species, setSpecies] = useState<AnimalInput['species']>(animal?.species ?? 'cattle');
  const [breed, setBreed] = useState(animal?.breed ?? '');
  const [sex, setSex] = useState<AnimalInput['sex']>(animal?.sex ?? 'female');
  const [birth, setBirth] = useState(animal?.birthDate.slice(0, 10) ?? '');
  const [weight, setWeight] = useState(animal ? String(animal.weightKg) : '');
  const [value, setValue] = useState(animal ? String(animal.value) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string>();
  async function save() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t('পশুর নাম লিখুন', 'Enter the animal’s name');
    if (!breed.trim()) next.breed = t('জাত লিখুন', 'Enter the breed');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !Number.isFinite(Date.parse(birth)) || Date.parse(birth) > Date.parse(state.now) || new Date(birth).toISOString().slice(0, 10) !== birth) next.birth = t('অতীতের সঠিক তারিখ দিন: YYYY-MM-DD', 'Enter a valid past date: YYYY-MM-DD');
    if (!(numeric(weight) > 0 && numeric(weight) <= 2000)) next.weight = t('ওজন ১ থেকে ২০০০ কেজির মধ্যে দিন', 'Weight must be greater than 0 and at most 2,000 kg');
    if (!(numeric(value) > 0)) next.value = t('শূন্যের বেশি মূল্য দিন', 'Value must be greater than zero');
    setErrors(next);
    if (Object.keys(next).length) return;
    const input: AnimalInput = { name: name.trim(), species, breed: breed.trim(), sex, birthDate: new Date(birth).toISOString(), weightKg: numeric(weight), value: numeric(value) };
    const result = await run(id ? { type: 'animal.update', animalId: id, animal: input } : { type: 'animal.add', animal: input });
    if (result.ok) setSaved(result.id ?? id);
  }
  if (id && !animal) return <Screen title={t('পশু সম্পাদনা', 'Edit animal')} back><MissingRecord title={t('পশুটি পাওয়া যায়নি', 'Animal unavailable')} /></Screen>;
  if (saved) return <Screen title={t('তথ্য সংরক্ষিত', 'Animal saved')} back><EmptyState icon="checkmark-circle-outline" title={t('পশুর তথ্য প্রস্তুত', 'Your animal record is ready')} description={t('একই পাসপোর্টে স্বাস্থ্য ও আর্থিক তথ্য থাকবে।', 'Health and financial history will stay linked to this passport.')} action={<Button title={t('পাসপোর্ট দেখুন', 'View passport')} onPress={() => go('animal', saved)} />} /></Screen>;
  return <Screen title={id ? t('পশুর তথ্য সম্পাদনা', 'Edit animal') : t('নতুন পশু', 'Register animal')} back>
    <AppText color={colors.muted}>{t('প্রতিটি পশুর জন্য আলাদা ডিজিটাল স্বাস্থ্য পাসপোর্ট তৈরি হবে।', 'Every animal receives a linked digital health passport.')}</AppText>
    <Field label={t('পশুর নাম', 'Animal name')} value={name} onChangeText={setName} error={errors.name} testID="animal-name" />
    <Choice label={t('পশুর ধরন', 'Species')} value={species} onChange={setSpecies} options={[{ value: 'cattle', label: t('গরু', 'Cattle') }, { value: 'goat', label: t('ছাগল', 'Goat') }, { value: 'buffalo', label: t('মহিষ', 'Buffalo') }]} />
    <Field label={t('জাত', 'Breed')} value={breed} onChangeText={setBreed} error={errors.breed} testID="animal-breed" />
    <Choice label={t('লিঙ্গ', 'Sex')} value={sex} onChange={setSex} options={[{ value: 'female', label: t('মাদি', 'Female') }, { value: 'male', label: t('পুরুষ', 'Male') }]} />
    <Field label={t('জন্মতারিখ', 'Date of birth')} hint="YYYY-MM-DD" placeholder="2022-01-15" value={birth} onChangeText={setBirth} error={errors.birth} keyboardType="numbers-and-punctuation" testID="animal-birth" />
    <Field label={t('ওজন (কেজি)', 'Weight (kg)')} value={weight} onChangeText={setWeight} error={errors.weight} keyboardType="decimal-pad" testID="animal-weight" />
    <Field label={t('আনুমানিক মূল্য (টাকা)', 'Estimated value (BDT)')} value={value} onChangeText={setValue} error={errors.value} keyboardType="number-pad" testID="animal-value" hint={t('ঋণ ও বীমা সুবিধার জন্য যাচাইকৃত বাজারমূল্য ব্যবহৃত হবে।', 'Verified market valuation is used for loan and insurance eligibility.')} />
    <Card><Badge tone="info">{t('পাসপোর্ট ছবি', 'Passport photo')}</Badge>{species === 'cattle' ? <Image source={palitoImages.cow} contentFit="contain" style={styles.galleryPreview} accessibilityLabel={t('গরুর ছবি', 'Cattle photo')} /> : <Icon name="paw-outline" size={48} />}<AppText variant="small">{t('ডিজিটাল স্বাস্থ্য পাসপোর্টের সাথে পশুর প্রোফাইল ছবি যুক্ত থাকবে।', 'Animal profile photo linked with the digital health passport.')}</AppText></Card>
    <Button title={t('সংরক্ষণ করুন', 'Save animal')} onPress={() => void save()} loading={busy} testID="animal-save" />
  </Screen>;
}

export function FarmScreen() {
  const { state, user, t, run, busy } = useDemo();
  const farm = state.farms.find(f => f.ownerId === user?.id);
  const [name, setName] = useState(farm?.name ?? '');
  const [district, setDistrict] = useState(farm?.district ?? user?.district ?? '');
  const [address, setAddress] = useState(farm?.address ?? '');
  const [size, setSize] = useState(farm ? String(farm.size) : '');
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);
  async function save() {
    setAttempted(true);
    if (!name.trim() || !district.trim() || !address.trim() || !(numeric(size) > 0)) return;
    const result = await run({ type: 'farm.save', name: name.trim(), district: district.trim(), address: address.trim(), size: numeric(size) });
    if (result.ok) setSaved(true);
  }
  return <Screen title={t('আমার খামার', 'My farm')} back>{saved ? <EmptyState icon="checkmark-circle-outline" title={t('খামার সংরক্ষিত', 'Farm saved')} description={t('এবার আপনার পশুর পরিচয় যোগ করুন।', 'Now add your animal’s identity.')} action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go('animal-add')} />} /> : <>
    <AppText color={colors.muted}>{t('আপনার খামার ও পশুর রেকর্ড একই জায়গায় রাখুন।', 'Keep your farm and livestock records together.')}</AppText>
    <Field label={t('খামারের নাম', 'Farm name')} value={name} onChangeText={setName} error={attempted && !name.trim() ? t('নাম লিখুন', 'Enter a name') : undefined} testID="farm-name" />
    <Field label={t('জেলা', 'District')} value={district} onChangeText={setDistrict} error={attempted && !district.trim() ? t('জেলা লিখুন', 'Enter a district') : undefined} testID="farm-district" />
    <Field label={t('ঠিকানা', 'Address')} value={address} onChangeText={setAddress} multiline error={attempted && !address.trim() ? t('ঠিকানা লিখুন', 'Enter an address') : undefined} testID="farm-address" />
    <Field label={t('আয়তন (একর)', 'Area (acres)')} value={size} onChangeText={setSize} keyboardType="decimal-pad" error={attempted && !(numeric(size) > 0) ? t('শূন্যের বেশি আয়তন দিন', 'Enter an area greater than zero') : undefined} testID="farm-size" />
    <Button title={t('খামার সংরক্ষণ করুন', 'Save farm')} loading={busy} onPress={() => void save()} testID="farm-save" />
  </>}</Screen>;
}

export function AnimalDetail({ id }: { id?: string }) {
  const { state, user, t, locale, date, money, run, busy } = useDemo();
  const animal = state.animals.find(a => a.id === id && a.ownerId === user?.id);
  const [tab, setTab] = useState('health');
  const [archive, setArchive] = useState(false);
  const [gallery, setGallery] = useState(false);
  if (!animal) return <Screen title={t('স্বাস্থ্য পাসপোর্ট', 'Health passport')} back><MissingRecord title={t('পশুটি পাওয়া যায়নি', 'Animal unavailable')} /></Screen>;
  const records = state.records.filter(r => r.animalId === animal.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const policy = state.policies.find(p => p.animalId === animal.id && p.status === 'active');
  const loan = state.loans.find(l => l.animalId === animal.id && ['approved', 'active'].includes(l.status));
  const alert = state.alerts.find(a => a.animalId === animal.id && a.status !== 'resolved');
  const active = !['sold', 'deceased'].includes(animal.status);
  const tabOptions = [
    { value: 'health', label: t('স্বাস্থ্য তথ্য', 'Health') },
    { value: 'records', label: t('রেকর্ড', 'Records') },
    { value: 'finance', label: t('আর্থিক', 'Finance') },
  ];
  return <Screen title={t('স্বাস্থ্য পাসপোর্ট', 'Health passport')} back action={<Button title={t('সম্পাদনা', 'Edit')} variant="ghost" disabled={!active} onPress={() => go('animal-edit', animal.id)} />}>
    <AnimalCard animal={animal} onPress={() => setGallery(true)} />
    <Card><View style={s.row}><Icon name="qr-code-outline" size={38} color={colors.brandDark} /><View style={s.flex}><AppText variant="label">{animal.tag}</AppText><AppText variant="small" color={colors.muted}>{t('ডিজিটাল পাসপোর্ট', 'Digital passport')} · {date(animal.registeredAt)}</AppText></View><Badge tone="success">{t('যাচাইকৃত', 'Verified')}</Badge></View><AppText variant="small" color={colors.muted}>{t('যাচাইকৃত ডিজিটাল পশু পরিচয় ও স্বাস্থ্য পাসপোর্ট।', 'Verified digital livestock identity and health passport.')}</AppText></Card>
    {alert ? <Card onPress={() => go('alert', alert.id)} style={styles.forecast}><View style={s.row}><Icon name="sparkles-outline" color="#7E22CE" size={20} /><AppText variant="label" color="#581C87" style={s.flex}>{t('এআই স্বাস্থ্য পূর্বাভাস · ', 'AI Health Forecast · ')}{alert.title[locale]}</AppText></View><AppText variant="small" color="#7E22CE">{alert.message[locale]}</AppText><TextLink title={t('সতর্কতা দেখুন', 'Review alert')} onPress={() => go('alert', alert.id)} /></Card> : null}
    <View style={styles.underlineTabs} accessibilityRole="tablist">
      {tabOptions.map(option => {
        const selected = tab === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => setTab(option.value)}
            style={[styles.underlineTab, selected && styles.underlineTabActive]}
          >
            <AppText variant="label" color={selected ? colors.brand : colors.muted}>{option.label}</AppText>
          </Pressable>
        );
      })}
    </View>
    {tab === 'health' ? <>
      <Vitals animalId={animal.id} />
      <Card><Row title={t('জন্মতারিখ', 'Birth date')} subtitle={date(animal.birthDate)} icon="calendar-outline" /><Row title={t('ওজন', 'Weight')} subtitle={animal.weightKg + ' ' + t('কেজি', 'kg')} icon="scale-outline" /><Row title={t('স্বাস্থ্য স্কোর', 'Health score')} subtitle={animal.healthScore + '/100 · ' + t('টেলিমেট্রি ও ক্লিনিক্যাল সূচক', 'Telemetry & clinical index')} icon="heart-outline" /></Card>
      <Button title={t('ডিভাইস ও সংযোগ', 'Device and connection')} variant="secondary" icon="bluetooth-outline" onPress={() => go('device', animal.id)} />
      <Button title={t('ছবির গ্যালারি', 'Photo gallery')} variant="ghost" onPress={() => setGallery(true)} />
      {active ? <Button title={t('ভেটের সাক্ষাৎ বুক করুন', 'Book veterinary care')} onPress={() => go('vets')} /> : null}
    </> : tab === 'records' ? <>
      <Section title={t('স্বাস্থ্য ইতিহাস', 'Health history')} action={active ? <TextLink title={t('যোগ করুন', 'Add record')} onPress={() => go('record-add', animal.id)} /> : undefined}>{records.length ? records.map(record => <Card key={record.id}><View style={s.row}><Icon name={record.kind === 'vaccination' ? 'shield-checkmark-outline' : 'document-text-outline'} /><AppText variant="label" style={s.flex}>{record.title[locale]}</AppText></View><AppText variant="small" color={colors.muted}>{date(record.createdAt)}</AppText><AppText>{record.note}</AppText>{record.nextDueAt ? <Badge tone="warning">{t('পরবর্তী তারিখ: ', 'Next due: ') + date(record.nextDueAt)}</Badge> : null}</Card>) : <EmptyState title={t('এখনো স্বাস্থ্য রেকর্ড নেই', 'No health records yet')} description={t('চিকিৎসা শেষ হলে এখানে রেকর্ড যোগ হবে।', 'Completed care will appear here.')} />}</Section>
      <Button title={t('প্রেসক্রিপশন দেখুন', 'View prescriptions')} variant="secondary" onPress={() => go('prescriptions')} />
    </> : <>
      <Card><AppText variant="heading">{t('পশুর মূল্য', 'Animal value')}</AppText><AppText variant="hero" color={colors.brandDark}>{money(animal.value)}</AppText><AppText variant="small" color={colors.muted}>{t('যাচাইকৃত বাজারমূল্য ও স্বাস্থ্য পাসপোর্ট মূল্যায়ন।', 'Verified market valuation linked to health passport.')}</AppText></Card>
      <Card><AppText variant="heading">{t('বীমা সুরক্ষা', 'Insurance coverage')}</AppText>{policy ? <><Badge tone="success">{t('সক্রিয় পলিসি', 'Active policy')}</Badge><AppText>{money(policy.coverage)}</AppText><Button title={t('পলিসি দেখুন', 'View policy')} onPress={() => go('policy', policy.id)} /></> : <><AppText>{t('সক্রিয় বীমা নেই', 'No active coverage')}</AppText><Button title={t('বীমা আবেদন', 'Apply for insurance')} variant="secondary" disabled={!active} onPress={() => go('insurance')} /></>}</Card>
      <Card><AppText variant="heading">{t('জামানতের অবস্থা', 'Collateral status')}</AppText>{loan ? <><Badge tone="warning">{t('ঋণের জামানত', 'Secured for a loan')}</Badge><AppText>{t('বাকি ঋণ: ', 'Outstanding debt: ')}{money(loan.outstanding)}</AppText><Button title={t('ঋণ দেখুন', 'View loan')} onPress={() => go('loan', loan.id)} /></> : <><Badge tone={active ? 'success' : 'neutral'}>{active ? t('দায়মুক্ত', 'Unencumbered') : t('উপলব্ধ নয়', 'Unavailable')}</Badge><Button title={t('ঋণের যোগ্যতা দেখুন', 'Explore loan eligibility')} variant="secondary" disabled={!active} onPress={() => go('loan-apply')} /></>}</Card>
    </>}
    <AnimalStatus animal={animal} />
    {active ? <Button title={t('পশু সংরক্ষণ করুন', 'Archive animal')} variant="ghost" onPress={() => setArchive(true)} /> : null}
    <Confirm visible={archive} title={t('পশুটি সংরক্ষণ করবেন?', 'Archive this animal?')} description={t('এটি সক্রিয় তালিকা থেকে সরবে। স্বাস্থ্য রেকর্ড থাকবে। সক্রিয় ঋণ বা বীমা থাকলে আগে নিষ্পত্তি করতে হবে।', 'It leaves the active herd while history stays. Active loans or insurance must be settled first.')} confirmLabel={t('সংরক্ষণ', 'Archive')} cancelLabel={t('ফিরে যান', 'Cancel')} loading={busy} onCancel={() => setArchive(false)} onConfirm={() => void run({ type: 'animal.archive', animalId: animal.id }).then(result => { if (result.ok) { setArchive(false); go('animals'); } })} />
    <Modal visible={gallery} animationType="fade" onRequestClose={() => setGallery(false)}><Screen title={t('পশুর ছবি', 'Animal gallery')} action={<Button title={t('বন্ধ', 'Close')} variant="ghost" onPress={() => setGallery(false)} />}><Badge tone="info">{t('পাসপোর্ট গ্যালারি', 'Passport gallery')}</Badge>{animal.species === 'cattle' ? <Image source={palitoImages.cow} contentFit="contain" style={styles.galleryImage} accessibilityLabel={t('গরুর ছবি', 'Cattle photo')} /> : <EmptyState title={t('এই পশুর ছবি নেই', 'No image for this animal')} />}<AppText>{animal.name} · {animal.tag}</AppText><AppText color={colors.muted}>{t('ডিজিটাল স্বাস্থ্য পাসপোর্টে নিবন্ধিত পশুর প্রোফাইল ছবি।', 'Profile photograph registered with this animal’s digital health passport.')}</AppText></Screen></Modal>
  </Screen>;
}

export function RecordEditor({ id }: { id?: string }) {
  const { state, user, run, t, busy } = useDemo();
  const animal = state.animals.find(a => a.id === id && a.ownerId === user?.id);
  const [note, setNote] = useState('');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function save() {
    if (!animal) return;
    if (!note.trim() || (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(Date.parse(due)) || Date.parse(due) < Date.parse(state.now)))) { setError(t('বিবরণ এবং ভবিষ্যতের সঠিক তারিখ দিন।', 'Enter a note and a valid future due date.')); return; }
    setError('');
    const result = await run({ type: 'record.add', animalId: animal.id, kind: 'checkup', title: { bn: 'খামারির পর্যবেক্ষণ', en: 'Farmer observation' }, note: note.trim(), nextDueAt: due ? new Date(due).toISOString() : undefined });
    if (result.ok) setSaved(true);
  }
  return <Screen title={t('স্বাস্থ্য রেকর্ড যোগ', 'Add health record')} back>{!animal ? <MissingRecord title={t('পশুটি পাওয়া যায়নি', 'Animal unavailable')} /> : saved ? <EmptyState title={t('রেকর্ড সংরক্ষিত', 'Record saved')} icon="checkmark-circle-outline" action={<Button title={t('পাসপোর্টে ফিরুন', 'Return to passport')} onPress={() => go('animal', animal.id)} />} /> : <><AnimalCard animal={animal} /><AppText color={colors.muted}>{t('আপনার পর্যবেক্ষণ লিখুন। টিকা ও চিকিৎসার রেকর্ড ভেট যোগ করবেন।', 'Record your observations. Vaccination and treatment records are added by the veterinarian.')}</AppText><Field label={t('বিবরণ', 'Notes')} value={note} onChangeText={setNote} multiline /><Field label={t('পরবর্তী তারিখ (ঐচ্ছিক)', 'Next due date (optional)')} value={due} onChangeText={setDue} placeholder="YYYY-MM-DD" />{error ? <AppText accessibilityRole="alert" color={colors.danger}>{error}</AppText> : null}<Button title={t('রেকর্ড সংরক্ষণ', 'Save record')} loading={busy} onPress={() => void save()} /></>}</Screen>;
}

const styles = StyleSheet.create({
  listPage: { flex: 1, padding: 16, gap: 12 }, listContent: { gap: 12, paddingBottom: 24 },
  forecast: { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE', borderWidth: 1, borderRadius: 16 },
  underlineTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  underlineTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  underlineTabActive: { borderBottomColor: colors.brand },
  galleryPreview: { width: '100%', height: 140 }, galleryImage: { width: '100%', aspectRatio: 1 },
});

