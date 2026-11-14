import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { HealthAlert } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, Confirm, EmptyState, Field, Icon, Row, Screen, Section, Stat } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { AnimalCard, go, MissingRecord, s, TextLink } from './components';

export function Vitals({ animalId }: { animalId: string }) {
  const { state, t, locale, date } = useDemo();
  const device = state.devices.find(d => d.animalId === animalId);
  const readings = device?.readings.slice().sort((a, b) => a.at.localeCompare(b.at)).slice(-7) ?? [];
  const latest = readings[readings.length - 1];
  const stale = !device?.connected || Date.parse(state.now) - Date.parse(device.lastSeenAt) > 4 * 3600000;
  const number = (value: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en', { maximumFractionDigits: 1 }).format(value);
  return <Section title={t('বর্তমান শারীরিক অবস্থা', 'Current observations')}>
    <Badge>{t('সেন্সর ডেমো', 'Simulated readings')}</Badge>
    {stale ? <Card style={styles.warning}><AppText variant="label">{t('নতুন তথ্য আসছে না', 'Fresh readings unavailable')}</AppText><AppText variant="small">{t('শেষ তথ্য পুরোনো হতে পারে। ডিভাইস ও ব্যাটারি পরীক্ষা করুন।', 'The last reading may be stale. Check the device and battery.')}</AppText><TextLink title={t('ডিভাইস দেখুন', 'Review device')} onPress={() => go('device', animalId)} /></Card> : null}
    {latest ? <><View style={styles.metrics}><Stat label={t('তাপমাত্রা °C', 'Temperature °C')} value={number(latest.temperature)} icon="thermometer-outline" /><Stat label={t('হৃদস্পন্দন /মিনিট', 'Heart rate /min')} value={number(latest.heartRate)} icon="heart-outline" /><Stat label={t('সক্রিয়তা %', 'Activity %')} value={number(latest.activity)} icon="pulse-outline" /></View><AppText variant="small" color={colors.muted}>{t('শেষ পর্যবেক্ষণ: ', 'Last observed: ')}{date(latest.at)} {new Date(latest.at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</AppText><Card><AppText variant="heading">{t('সাম্প্রতিক সক্রিয়তা', 'Recent activity')}</AppText><AppText variant="caption" color={colors.muted}>{t('শেষ ৭টি পর্যবেক্ষণ · শতাংশ', 'Last 7 observations · percent')}</AppText><View style={styles.chart}>{readings.map((reading, i) => <View key={reading.at + i} style={styles.barColumn} accessible accessibilityLabel={date(reading.at) + ': ' + number(reading.activity) + '%'}><AppText variant="caption">{number(reading.activity)}</AppText><View style={styles.barTrack}><View style={[styles.bar, { height: Math.max(2, Math.min(100, reading.activity)) + '%' }]} /></View><AppText variant="caption" color={colors.muted}>{new Date(reading.at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short' })}</AppText></View>)}</View><AppText variant="small" color={colors.muted}>{t('এই নমুনা প্রবণতা রোগ নির্ণয় করে না। চিকিৎসকের পরামর্শ নিন।', 'This sample trend does not diagnose illness. Seek veterinary assessment.')}</AppText></Card></> : <EmptyState title={t('এখনো পর্যবেক্ষণ নেই', 'No observations yet')} description={t('নমুনা সেন্সর সংযুক্ত করলে পর্যবেক্ষণ দেখা যাবে।', 'Connect a demo sensor to view observations.')} action={<Button title={t('ডিভাইস সংযুক্ত করুন', 'Connect device')} onPress={() => go('device', animalId)} />} />}
  </Section>;
}

export function DevicesScreen({ id }: { id?: string }) {
  const { state, user, t } = useDemo();
  const animalId = state.devices.find(d => d.id === id)?.animalId ?? id;
  if (animalId) return <DeviceDetail key={animalId} animalId={animalId} />;
  const animals = state.animals.filter(a => a.ownerId === user?.id && !['sold', 'deceased'].includes(a.status));
  return <Screen title={t('ডিভাইস', 'Devices')} back><AppText color={colors.muted}>{t('ডেমো কলারের সংযোগ ও ব্যাটারি দেখুন। কোনো আসল সেন্সর ব্যবহার হচ্ছে না।', 'Check demo collars and batteries. No physical sensors are connected.')}</AppText>{animals.length ? animals.map(animal => {
    const device = state.devices.find(d => d.animalId === animal.id);
    return <Card key={animal.id}><Row title={animal.name} subtitle={device?.serial ?? t('ডিভাইস নেই', 'No device linked')} icon="bluetooth-outline" onPress={() => go('device', animal.id)} trailing={<Badge tone={device?.connected ? 'success' : 'warning'}>{device?.connected ? t('সংযুক্ত', 'Connected') : t('সংযোগ নেই', 'Disconnected')}</Badge>} /></Card>;
  }) : <EmptyState title={t('আগে একটি পশু যোগ করুন', 'Add an animal first')} action={<Button title={t('পশুর তালিকা', 'Animal list')} onPress={() => go('animals')} />} />}</Screen>;
}

function DeviceDetail({ animalId }: { animalId: string }) {
  const { state, user, t, run, busy, date } = useDemo();
  const animal = state.animals.find(a => a.id === animalId && a.ownerId === user?.id);
  const device = state.devices.find(d => d.animalId === animalId);
  const [serial, setSerial] = useState(device?.serial ?? '');
  const [validation, setValidation] = useState('');
  const [disconnect, setDisconnect] = useState(false);
  async function connect() {
    if (!/^[a-zA-Z0-9-]{3,60}$/.test(serial.trim())) { setValidation(t('৩–৬০ অক্ষরের সিরিয়াল দিন: অক্ষর, সংখ্যা বা -', 'Use a 3–60 character serial with letters, numbers or -')); return; }
    setValidation('');
    await run({ type: 'device.connect', animalId, serial: serial.trim() });
  }
  if (!animal) return <Screen title={t('ডিভাইস', 'Device')} back><MissingRecord title={t('পশুটি পাওয়া যায়নি', 'Animal unavailable')} /></Screen>;
  const active = !['sold', 'deceased'].includes(animal.status);
  return <Screen title={t('ডিভাইস ও সংযোগ', 'Device connection')} back><AnimalCard animal={animal} /><Badge>{t('ডেমো IoT', 'Demo IoT')}</Badge>
    {device ? <Card><Badge tone={device.connected ? 'success' : 'warning'}>{device.connected ? t('সংযুক্ত', 'Connected') : t('সংযোগ বিচ্ছিন্ন', 'Disconnected')}</Badge><Row title={t('সিরিয়াল', 'Serial')} subtitle={device.serial} icon="barcode-outline" /><Row title={t('ব্যাটারি', 'Battery')} subtitle={device.battery + '%'} icon="battery-half-outline" /><Row title={t('শেষ সংযোগ', 'Last connection')} subtitle={date(device.lastSeenAt)} icon="time-outline" />{device.battery <= 20 || !device.connected ? <AppText color={colors.warning}>{t('কলারের ব্যাটারি ও সংযোগ পরীক্ষা করুন। নতুন তথ্য না আসা পর্যন্ত পুরোনো তথ্য দেখানো হবে।', 'Check the collar battery and connection. Existing readings remain stale until it reconnects.')}</AppText> : null}</Card> : <Card><Icon name="bluetooth-outline" size={38} /><AppText>{t('একটি নমুনা সিরিয়াল দিয়ে পশুর সঙ্গে ডেমো কলার যুক্ত করুন।', 'Link a demo collar using a sample serial.')}</AppText></Card>}
    <Field label={t('ডিভাইস সিরিয়াল', 'Device serial')} value={serial} onChangeText={setSerial} placeholder="PALITO-001" autoCapitalize="characters" error={validation} testID="device-serial" />
    <Button title={device?.connected ? t('ডিভাইস যুক্ত আছে', 'Device connected') : t('সংযোগ করুন', 'Connect device')} disabled={!active || Boolean(device?.connected && serial === device.serial)} loading={busy} onPress={() => void connect()} testID="device-connect" />
    {device?.connected ? <Button title={t('ডেমো সংযোগ বিচ্ছিন্ন করুন', 'Simulate disconnection')} variant="secondary" disabled={!active} onPress={() => setDisconnect(true)} /> : null}
    {active && device?.connected ? <Card><AppText variant="heading">{t('নমুনা সতর্কতা', 'Sample alert')}</AppText><AppText variant="small">{t('যত্নের যাত্রা পরীক্ষা করতে একটি ডেমো তাপমাত্রার সতর্কতা তৈরি করুন।', 'Create a sample temperature alert to try the care journey.')}</AppText><Button title={t('তাপমাত্রার সতর্কতা তৈরি', 'Create temperature alert')} variant="secondary" loading={busy} onPress={() => void run({ type: 'alert.simulate', animalId, kind: 'temperature', severity: 'warning' }).then(result => { if (result.ok) go('alert', result.id); })} /></Card> : null}
    <Confirm visible={disconnect} title={t('ডেমো সংযোগ বিচ্ছিন্ন করবেন?', 'Disconnect the demo device?')} description={t('নতুন পর্যবেক্ষণ বন্ধ হবে এবং একটি ডিভাইস সতর্কতা তৈরি হবে।', 'New observations stop and a device warning is created.')} confirmLabel={t('বিচ্ছিন্ন করুন', 'Disconnect')} cancelLabel={t('বাতিল', 'Cancel')} onCancel={() => setDisconnect(false)} loading={busy} onConfirm={() => { if (device) void run({ type: 'device.disconnect', deviceId: device.id }).then(result => { if (result.ok) setDisconnect(false); }); }} />
  </Screen>;
}

export function AlertsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, date } = useDemo();
  if (id) return <AlertDetail key={id} id={id} />;
  const ids = new Set(state.animals.filter(a => a.ownerId === user?.id).map(a => a.id));
  const alerts = state.alerts.filter(a => ids.has(a.animalId)).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Screen title={t('স্বাস্থ্য সতর্কতা', 'Health alerts')} back><Button title={t('জরুরি সেবা', 'Emergency care')} variant="danger" icon="call-outline" onPress={() => go('emergency')} />{alerts.length ? alerts.map(alert => <Card key={alert.id} onPress={() => go('alert', alert.id)}><View style={s.row}><Icon name={alert.kind === 'disconnected' ? 'bluetooth-outline' : 'warning-outline'} color={alert.severity === 'critical' ? colors.danger : colors.warning} /><AppText variant="label" style={s.flex}>{alert.title[locale]}</AppText></View><AppText variant="small">{state.animals.find(a => a.id === alert.animalId)?.name} · {date(alert.createdAt)}</AppText><AlertStatus alert={alert} /></Card>) : <EmptyState title={t('কোনো সতর্কতা নেই', 'No alerts')} description={t('নতুন স্বাস্থ্য বা ডিভাইস সতর্কতা এখানে দেখা যাবে।', 'New health and device alerts will appear here.')} action={<Button title={t('ডিভাইস দেখুন', 'Review devices')} onPress={() => go('devices')} />} />}</Screen>;
}

function AlertStatus({ alert }: { alert: HealthAlert }) {
  const { t } = useDemo();
  const labels = { open: t('নতুন', 'New'), acknowledged: t('দেখা হয়েছে', 'Acknowledged'), escalated: t('ভেটের কাছে পাঠানো', 'Escalated to vet'), resolved: t('সমাধান হয়েছে', 'Resolved') };
  return <Badge tone={alert.status === 'resolved' ? 'success' : alert.status === 'escalated' ? 'danger' : 'warning'}>{labels[alert.status]}</Badge>;
}

function AlertDetail({ id }: { id: string }) {
  const { state, user, t, locale, date, run, busy } = useDemo();
  const alert = state.alerts.find(a => a.id === id && state.animals.some(animal => animal.id === a.animalId && animal.ownerId === user?.id));
  const [confirm, setConfirm] = useState(false);
  if (!alert) return <Screen title={t('সতর্কতা', 'Alert')} back><EmptyState title={t('সতর্কতা পাওয়া যায়নি', 'Alert unavailable')} action={<Button title={t('সব সতর্কতা', 'All alerts')} onPress={() => go('alerts')} />} /></Screen>;
  const animal = state.animals.find(a => a.id === alert.animalId)!;
  const vets = state.users.filter(v => v.role === 'vet' && v.available && v.status === 'active').sort((a, b) => Number(b.district === user?.district) - Number(a.district === user?.district));
  const slot = Array.from({ length: 48 }, (_, i) => Date.parse(state.now) + (i + 1) * 30 * 60000).flatMap(time => vets.map(vet => ({ vet, time }))).find(({ vet, time }) => !state.appointments.some(a => a.vetId === vet.id && ['requested', 'accepted', 'in_progress'].includes(a.status) && Math.abs(Date.parse(a.scheduledAt) - time) < 30 * 60000));
  async function book() {
    if (!slot || !alert) return;
    const result = await run({ type: 'appointment.book', animalId: alert.animalId, vetId: slot.vet.id, scheduledAt: new Date(slot.time).toISOString(), mode: 'visit', priority: alert.severity === 'critical' ? 'emergency' : 'urgent', reason: alert.message[locale], alertId: alert.id });
    if (result.ok) { setConfirm(false); go('appointment', result.id); }
  }
  return <Screen title={t('সতর্কতার বিবরণ', 'Alert details')} back><AnimalCard animal={animal} /><Card style={alert.severity === 'critical' ? styles.danger : styles.warning}><AlertStatus alert={alert} /><AppText variant="heading">{alert.title[locale]}</AppText><AppText>{alert.message[locale]}</AppText><AppText variant="small">{date(alert.createdAt)}</AppText></Card>
    {alert.kind === 'disconnected' ? <Button title={t('ডিভাইস পরীক্ষা করুন', 'Check device')} onPress={() => go('device', animal.id)} /> : <Vitals animalId={animal.id} />}
    {alert.appointmentId ? <Card><AppText variant="heading">{t('চিকিৎসার অনুরোধ পাঠানো হয়েছে', 'Care request sent')}</AppText><AppText>{t('একই পশুর ইতিহাস ও পর্যবেক্ষণ চিকিৎসক দেখতে পারবেন। এটি ডেমো ডিসপ্যাচ।', 'The veterinarian can review this animal’s history and observations. Dispatch is simulated.')}</AppText><Button title={t('সাক্ষাতের অবস্থা দেখুন', 'View appointment status')} onPress={() => go('appointment', alert.appointmentId)} /></Card> : alert.status !== 'resolved' && alert.kind !== 'disconnected' ? <Card><AppText variant="heading">{t('অগ্রাধিকার ভিত্তিতে চিকিৎসা', 'Priority veterinary care')}</AppText><AppText>{t('পশুর গত ৭টি পর্যবেক্ষণ ও স্বাস্থ্য ইতিহাস চিকিৎসককে দেখানো হবে।', 'The animal’s last 7 observations and health history will be shared with the veterinarian.')}</AppText>{slot ? <><AppText>{locale === 'bn' ? slot.vet.nameBn : slot.vet.name} · {slot.vet.district}</AppText><Button title={t('অগ্রাধিকার সাক্ষাৎ বুক করুন', 'Book priority visit')} onPress={() => setConfirm(true)} loading={busy} testID="alert-book" /></> : <EmptyState title={t('ভেটের সময় পাওয়া যায়নি', 'No vet slot available')} action={<Button title={t('ভেট তালিকা দেখুন', 'Review veterinarian list')} variant="secondary" onPress={() => go('vets')} />} />}</Card> : null}
    {alert.status === 'open' || alert.status === 'escalated' ? <Button title={t('সতর্কতাটি দেখেছি', 'Acknowledge alert')} variant="secondary" loading={busy} onPress={() => void run({ type: 'alert.acknowledge', alertId: alert.id })} /> : null}
    <Card><AppText variant="small">{t('৪ ঘণ্টা উত্তর না পেলে খোলা স্বাস্থ্য সতর্কতা ভেটের কাছে যায়। নিচের নিয়ন্ত্রণ শুধু ডেমোর সময় পরিবর্তন করে।', 'Unanswered health alerts escalate after 4 hours. The control below only advances the demo clock.')}</AppText><Button title={t('ডেমো সময় ৪ ঘণ্টা এগিয়ে নিন', 'Advance demo clock 4 hours')} variant="ghost" loading={busy} onPress={() => void run({ type: 'demo.advanceTime', hours: 4 })} /></Card>
    {alert.kind === 'emergency' ? <Button title={t('জরুরি চিকিৎসা ঋণের বিকল্প', 'Emergency medical loan options')} variant="secondary" onPress={() => go('loan-apply')} /> : null}
    <Confirm visible={confirm} title={t('অগ্রাধিকার সাক্ষাৎ নিশ্চিত করুন', 'Confirm priority visit')} description={t('নির্বাচিত ভেটের কাছে অনুরোধ ও পশুর স্বাস্থ্য ইতিহাস যাবে। কোনো আসল কল বা অর্থপ্রদান হবে না।', 'The selected vet receives the request and linked health history. No real call or payment occurs.')} confirmLabel={t('অনুরোধ পাঠান', 'Send request')} cancelLabel={t('বাতিল', 'Cancel')} onConfirm={() => void book()} onCancel={() => setConfirm(false)} loading={busy} />
  </Screen>;
}

export function EmergencyScreen() {
  const { state, user, t, run, busy } = useDemo();
  const animals = state.animals.filter(a => a.ownerId === user?.id && !['sold', 'deceased'].includes(a.status));
  const [animalId, setAnimalId] = useState(animals[0]?.id ?? '');
  const [confirm, setConfirm] = useState(false);
  const activeEmergency = state.alerts.find(a => a.animalId === animalId && a.kind === 'emergency' && a.status !== 'resolved');
  async function dispatch() {
    if (activeEmergency) { setConfirm(false); go('alert', activeEmergency.id); return; }
    const result = await run({ type: 'alert.simulate', animalId, kind: 'emergency', severity: 'critical' });
    if (result.ok) { setConfirm(false); go('alert', result.id); }
  }
  return <Screen title={t('জরুরি পশু চিকিৎসা', 'Emergency veterinary care')} back><View style={styles.emergency}><Icon name="call-outline" size={40} color={colors.danger} /><AppText variant="title">{t('দ্রুত সাহায্যের অনুরোধ', 'Request urgent assistance')}</AppText><AppText>{t('পশু নির্বাচন করে ডেমো জরুরি অনুরোধ পাঠান।', 'Select your animal and send a demo emergency request.')}</AppText></View><Card style={styles.warning}><AppText variant="label">{t('এটি জরুরি কল সেবা নয়', 'This is a demonstration')}</AppText><AppText>{t('এই অ্যাপ থেকে প্রকৃত চিকিৎসক বা জরুরি সেবায় কল যায় না। বাস্তব বিপদে আপনার পরিচিত স্থানীয় পশুচিকিৎসকের সঙ্গে যোগাযোগ করুন।', 'This app does not call a real veterinarian or emergency service. For an actual emergency, contact your known local veterinarian.')}</AppText></Card>{animals.length ? <><Choice label={t('কোন পশুর জন্য?', 'Which animal needs care?')} value={animalId} onChange={setAnimalId} options={animals.map(a => ({ value: a.id, label: a.name + ' · ' + a.tag }))} /><Button title={activeEmergency ? t('চলমান অনুরোধ দেখুন', 'View active request') : t('ডেমো জরুরি অনুরোধ', 'Request demo emergency care')} variant="danger" icon="call-outline" disabled={!animalId} onPress={() => setConfirm(true)} testID="emergency-request" /></> : <EmptyState title={t('আগে পশুর পরিচয় যোগ করুন', 'Register an animal first')} action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go('animals')} />} />}<Confirm visible={confirm} title={t('জরুরি অনুরোধ পাঠাবেন?', 'Send emergency request?')} description={t('পশুর অবস্থা জরুরি হিসেবে চিহ্নিত হবে এবং উপলব্ধ ভেটের কাছে ডেমো ডিসপ্যাচ যাবে।', 'The animal is marked critical and a demo dispatch is sent to an available vet.')} confirmLabel={t('পাঠান', 'Send request')} cancelLabel={t('বাতিল', 'Cancel')} onConfirm={() => void dispatch()} onCancel={() => setConfirm(false)} loading={busy} danger /></Screen>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, warning: { backgroundColor: colors.warningPale, borderColor: '#FDE68A' },
  danger: { backgroundColor: colors.dangerPale, borderColor: '#FDA4AF' }, chart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  barColumn: { flex: 1, alignItems: 'center', gap: 6 }, barTrack: { height: 110, width: 16, backgroundColor: '#D8E9DE', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: colors.brand, borderRadius: 8 }, emergency: { alignItems: 'center', gap: 16, paddingVertical: 16 },
});

