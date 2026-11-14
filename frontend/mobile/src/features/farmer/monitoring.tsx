import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { HealthAlert } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, Confirm, EmptyState, Field, Icon, Row, Screen, Section, Stat } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { AnimalCard, go, MissingRecord, s, TextLink } from './components';

export function Vitals({ animalId }: { animalId: string }) {
  const { state, t, locale, date, dateTime } = useDemo();
  const animal = state.animals.find(a => a.id === animalId);
  const device = state.devices.find(d => d.animalId === animalId);
  const allReadings = device?.readings.slice().sort((a, b) => a.at.localeCompare(b.at)) ?? [];
  // Aggregate readings into 7 daily points across the 7-day window (29 readings at 6h intervals = 7 days)
  const byDay = new Map<string, typeof allReadings[number]>();
  for (const reading of allReadings) {
    byDay.set(reading.at.slice(0, 10), reading);
  }
  const dailyReadings = Array.from(byDay.values()).slice(-7);
  const readings = dailyReadings.length >= 2 ? dailyReadings : allReadings.slice(-7);
  const latest = allReadings[allReadings.length - 1];
  const stale = !device?.connected || Date.parse(state.now) - Date.parse(device.lastSeenAt) > 4 * 3600000;
  const number = (value: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en', { maximumFractionDigits: 1 }).format(value);
  return <Section title={t('বর্তমান শারীরিক অবস্থা', 'Current observations')}>
    <View style={s.wrap}>
      <Badge tone={stale ? 'warning' : 'success'}>{stale ? t('সংযোগ পরীক্ষা করুন', 'Sensor check needed') : t('লাইভ টেলিমেট্রি সক্রিয়', 'Live telemetry active')}</Badge>
      {animal?.productionDrop ? <Badge tone="warning">{t('দুধ উৎপাদন হ্রাস পেয়েছে', 'Milk yield drop detected')}</Badge> : null}
    </View>
    {stale ? <Card style={styles.warning}><AppText variant="label">{t('নতুন তথ্য আসছে না', 'Fresh readings unavailable')}</AppText><AppText variant="small">{t('শেষ তথ্য পুরোনো হতে পারে। ডিভাইস ও ব্যাটারি পরীক্ষা করুন।', 'The last reading may be stale. Check the device and battery.')}</AppText><TextLink title={t('ডিভাইস দেখুন', 'Review device')} onPress={() => go('device', animalId)} /></Card> : null}
    {latest ? <>
      <View style={styles.metrics}>
        <Stat label={t('তাপমাত্রা °C', 'Temperature °C')} value={number(latest.temperature)} icon="thermometer-outline" />
        <Stat label={t('হৃদস্পন্দন /মিনিট', 'Heart rate /min')} value={number(latest.heartRate)} icon="heart-outline" />
        <Stat label={t('সক্রিয়তা ও রোমন্থন %', 'Activity & rumination %')} value={number(latest.activity)} icon="pulse-outline" />
      </View>
      <Card style={styles.referenceCard}>
        <AppText variant="caption" color={colors.brandDark}>
          {t('স্বাভাবিক মাত্রা: তাপমাত্রা ৩৮.০–৩৯.০°সে · হৃদস্পন্দন ৬০–৮০ /মিনিট · সক্রিয়তা ৭০%+', 'Normal range: Temp 38.0–39.0°C · Heart rate 60–80 bpm · Activity 70%+')}
        </AppText>
        <AppText variant="caption" color={colors.muted}>{t('শেষ পর্যবেক্ষণ (ঢাকা সময়): ', 'Last observed (Asia/Dhaka): ')}{dateTime(latest.at)}</AppText>
      </Card>
      <Card>
        <View style={s.row}>
          <View style={s.flex}>
            <AppText variant="heading">{t('গত ৭ দিনের স্বাস্থ্য প্রবণতা', '7-day health & activity trend')}</AppText>
            <AppText variant="caption" color={colors.muted}>{t('দৈনিক সক্রিয়তা ও রোমন্থন সূচক (%)', 'Daily activity & rumination index (%)')}</AppText>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendDot} />
            <AppText variant="caption" color={colors.muted}>{t('সক্রিয়তা %', 'Activity %')}</AppText>
          </View>
        </View>
        <View style={styles.chart}>
          {readings.map((reading, i) => (
            <View key={reading.at + i} style={styles.barColumn} accessible accessibilityLabel={date(reading.at) + ': ' + number(reading.activity) + '%'}>
              <AppText variant="caption">{number(reading.activity)}</AppText>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: Math.max(4, Math.min(100, reading.activity)) + '%', backgroundColor: reading.activity < 50 ? colors.warning : colors.brand }]} />
              </View>
              <AppText variant="caption" color={colors.muted}>{new Date(reading.at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dhaka' })}</AppText>
            </View>
          ))}
        </View>
        <AppText variant="small" color={colors.muted}>{t('অস্বাভাবিক পরিবর্তন দেখা দিলে পশুচিকিৎসকের পরামর্শ নিন।', 'Consult a veterinarian if abnormal trends persist.')}</AppText>
      </Card>
    </> : <EmptyState title={t('এখনো পর্যবেক্ষণ নেই', 'No observations yet')} description={t('স্মার্ট কলার সেন্সর সংযুক্ত করলে পর্যবেক্ষণ দেখা যাবে।', 'Connect a smart collar sensor to view live observations.')} action={<Button title={t('ডিভাইস সংযুক্ত করুন', 'Connect device')} onPress={() => go('device', animalId)} />} />}
  </Section>;
}

export function DevicesScreen({ id }: { id?: string }) {
  const { state, user, t } = useDemo();
  const animalId = state.devices.find(d => d.id === id)?.animalId ?? id;
  if (animalId) return <DeviceDetail key={animalId} animalId={animalId} />;
  const animals = state.animals.filter(a => a.ownerId === user?.id && !['sold', 'deceased'].includes(a.status));
  return <Screen title={t('ডিভাইস', 'Devices')} back><AppText color={colors.muted}>{t('আপনার খামারের স্মার্ট কলারের সংযোগ ও ব্যাটারির অবস্থা দেখুন।', 'Monitor your herd’s smart collar connectivity and battery levels.')}</AppText>{animals.length ? animals.map(animal => {
    const device = state.devices.find(d => d.animalId === animal.id);
    return <Card key={animal.id}><Row title={animal.name} subtitle={device?.serial ?? t('ডিভাইস নেই', 'No device linked')} icon="bluetooth-outline" onPress={() => go('device', animal.id)} trailing={<Badge tone={device?.connected ? 'success' : 'warning'}>{device?.connected ? t('সংযুক্ত', 'Connected') : t('সংযোগ নেই', 'Disconnected')}</Badge>} /></Card>;
  }) : <EmptyState title={t('আগে একটি পশু যোগ করুন', 'Add an animal first')} action={<Button title={t('পশুর তালিকা', 'Animal list')} onPress={() => go('animals')} />} />}</Screen>;
}

function DeviceDetail({ animalId }: { animalId: string }) {
  const { state, user, t, run, busy, dateTime } = useDemo();
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
  return <Screen title={t('ডিভাইস ও সংযোগ', 'Device connection')} back><AnimalCard animal={animal} /><Badge tone="info">{t('আইওটি স্মার্ট কলার', 'IoT Smart Collar')}</Badge>
    {device ? <Card><Badge tone={device.connected ? 'success' : 'warning'}>{device.connected ? t('সংযুক্ত', 'Connected') : t('সংযোগ বিচ্ছিন্ন', 'Disconnected')}</Badge><Row title={t('সিরিয়াল', 'Serial')} subtitle={device.serial} icon="barcode-outline" /><Row title={t('ব্যাটারি', 'Battery')} subtitle={device.battery + '%'} icon="battery-half-outline" /><Row title={t('শেষ সংযোগ', 'Last connection')} subtitle={dateTime(device.lastSeenAt)} icon="time-outline" />{device.battery <= 20 || !device.connected ? <AppText color={colors.warning}>{t('কলারের ব্যাটারি ও সংযোগ পরীক্ষা করুন। নতুন তথ্য না আসা পর্যন্ত পুরোনো তথ্য দেখানো হবে।', 'Check the collar battery and connection. Existing readings remain cached until it reconnects.')}</AppText> : null}</Card> : <Card><Icon name="bluetooth-outline" size={38} /><AppText>{t('সিরিয়াল নম্বর দিয়ে পশুর সাথে পালিত স্মার্ট কলার যুক্ত করুন।', 'Link a Palito smart collar to this animal using its serial number.')}</AppText></Card>}
    <Field label={t('ডিভাইস সিরিয়াল', 'Device serial')} value={serial} onChangeText={setSerial} placeholder="PALITO-001" autoCapitalize="characters" error={validation} testID="device-serial" />
    <Button title={device?.connected ? t('ডিভাইস যুক্ত আছে', 'Device connected') : t('সংযোগ করুন', 'Connect device')} disabled={!active || Boolean(device?.connected && serial === device.serial)} loading={busy} onPress={() => void connect()} testID="device-connect" />
    {device?.connected ? <Button title={t('সংযোগ বিচ্ছিন্ন করুন', 'Disconnect collar')} variant="secondary" disabled={!active} onPress={() => setDisconnect(true)} /> : null}
    {active && device?.connected ? <Card><AppText variant="heading">{t('সেন্সর ডায়াগনস্টিক ও সতর্কতা পরীক্ষা', 'Sensor diagnostic & alert test')}</AppText><AppText variant="small">{t('জরুরি স্বাস্থ্য প্রবাহ যাচাই করতে একটি তাপমাত্রার সতর্কতা পাঠান।', 'Trigger a temperature alert to test the priority veterinary care workflow.')}</AppText><Button title={t('তাপমাত্রার সতর্কতা তৈরি', 'Create temperature alert')} variant="secondary" loading={busy} onPress={() => void run({ type: 'alert.simulate', animalId, kind: 'temperature', severity: 'warning' }).then(result => { if (result.ok) go('alert', result.id); })} /></Card> : null}
    <Confirm visible={disconnect} title={t('ডিভাইস সংযোগ বিচ্ছিন্ন করবেন?', 'Disconnect this collar?')} description={t('নতুন পর্যবেক্ষণ বন্ধ হবে এবং একটি সংযোগ বিচ্ছিন্ন সতর্কতা তৈরি হবে।', 'Live telemetry will pause and a disconnection alert will be created.')} confirmLabel={t('বিচ্ছিন্ন করুন', 'Disconnect')} cancelLabel={t('বাতিল', 'Cancel')} onCancel={() => setDisconnect(false)} loading={busy} onConfirm={() => { if (device) void run({ type: 'device.disconnect', deviceId: device.id }).then(result => { if (result.ok) setDisconnect(false); }); }} />
  </Screen>;
}

export function AlertsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, dateTime } = useDemo();
  if (id) return <AlertDetail key={id} id={id} />;
  const ids = new Set(state.animals.filter(a => a.ownerId === user?.id).map(a => a.id));
  const alerts = state.alerts.filter(a => ids.has(a.animalId)).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Screen title={t('স্বাস্থ্য সতর্কতা', 'Health alerts')} back><Button title={t('জরুরি সেবা', 'Emergency care')} variant="danger" icon="call-outline" onPress={() => go('emergency')} />{alerts.length ? alerts.map(alert => <Card key={alert.id} onPress={() => go('alert', alert.id)}><View style={s.row}><Icon name={alert.kind === 'disconnected' ? 'bluetooth-outline' : 'warning-outline'} color={alert.severity === 'critical' ? colors.danger : colors.warning} /><AppText variant="label" style={s.flex}>{alert.title[locale]}</AppText></View><AppText variant="small">{state.animals.find(a => a.id === alert.animalId)?.name} · {dateTime(alert.createdAt)}</AppText><AlertStatus alert={alert} /></Card>) : <EmptyState title={t('কোনো সতর্কতা নেই', 'No alerts')} description={t('নতুন স্বাস্থ্য বা ডিভাইস সতর্কতা এখানে দেখা যাবে।', 'New health and device alerts will appear here.')} action={<Button title={t('ডিভাইস দেখুন', 'Review devices')} onPress={() => go('devices')} />} />}</Screen>;
}

function AlertStatus({ alert }: { alert: HealthAlert }) {
  const { t } = useDemo();
  const labels = { open: t('নতুন', 'New'), acknowledged: t('দেখা হয়েছে', 'Acknowledged'), escalated: t('ভেটের কাছে পাঠানো', 'Escalated to vet'), resolved: t('সমাধান হয়েছে', 'Resolved') };
  return <Badge tone={alert.status === 'resolved' ? 'success' : alert.status === 'escalated' ? 'danger' : 'warning'}>{labels[alert.status]}</Badge>;
}

function AlertDetail({ id }: { id: string }) {
  const { state, user, t, locale, dateTime, run, busy } = useDemo();
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
  return <Screen title={t('সতর্কতার বিবরণ', 'Alert details')} back><AnimalCard animal={animal} /><Card style={alert.severity === 'critical' ? styles.danger : styles.warning}><AlertStatus alert={alert} /><AppText variant="heading">{alert.title[locale]}</AppText><AppText>{alert.message[locale]}</AppText><AppText variant="small">{dateTime(alert.createdAt)}</AppText></Card>
    {alert.kind === 'disconnected' ? <Button title={t('ডিভাইস পরীক্ষা করুন', 'Check device')} onPress={() => go('device', animal.id)} /> : <Vitals animalId={animal.id} />}
    {alert.appointmentId ? <Card><AppText variant="heading">{t('চিকিৎসার অনুরোধ পাঠানো হয়েছে', 'Care request sent')}</AppText><AppText>{t('একই পশুর ইতিহাস ও গত ৭ দিনের পর্যবেক্ষণ চিকিৎসকের কাছে পাঠানো হয়েছে।', 'The animal’s health history and 7-day telemetry have been shared with the veterinarian.')}</AppText><Button title={t('সাক্ষাতের অবস্থা দেখুন', 'View appointment status')} onPress={() => go('appointment', alert.appointmentId)} /></Card> : alert.status !== 'resolved' && alert.kind !== 'disconnected' ? <Card><AppText variant="heading">{t('অগ্রাধিকার ভিত্তিতে চিকিৎসা', 'Priority veterinary care')}</AppText><AppText>{t('পশুর গত ৭ দিনের পর্যবেক্ষণ ও স্বাস্থ্য ইতিহাস চিকিৎসককে দেখানো হবে।', 'The animal’s 7-day observations and health history will be shared with the veterinarian.')}</AppText>{slot ? <><AppText>{locale === 'bn' ? slot.vet.nameBn : slot.vet.name} · {slot.vet.district}</AppText><Button title={t('অগ্রাধিকার সাক্ষাৎ বুক করুন', 'Book priority visit')} onPress={() => setConfirm(true)} loading={busy} testID="alert-book" /></> : <EmptyState title={t('ভেটের সময় পাওয়া যায়নি', 'No vet slot available')} action={<Button title={t('ভেট তালিকা দেখুন', 'Review veterinarian list')} variant="secondary" onPress={() => go('vets')} />} />}</Card> : null}
    {alert.status === 'open' || alert.status === 'escalated' ? <Button title={t('সতর্কতাটি দেখেছি', 'Acknowledge alert')} variant="secondary" loading={busy} onPress={() => void run({ type: 'alert.acknowledge', alertId: alert.id })} /> : null}
    <Card><AppText variant="small">{t('৪ ঘণ্টা উত্তর না পেলে খোলা স্বাস্থ্য সতর্কতা স্বয়ংক্রিয়ভাবে ভেটের কাছে এসকেলেট হয়।', 'Unacknowledged health alerts automatically escalate to on-duty veterinarians after 4 hours.')}</AppText><Button title={t('৪ ঘণ্টা পরবর্তী এসকেলেশন পরীক্ষা করুন', 'Check 4-hour escalation status')} variant="ghost" loading={busy} onPress={() => void run({ type: 'demo.advanceTime', hours: 4 })} /></Card>
    {alert.kind === 'emergency' ? <Button title={t('জরুরি চিকিৎসা ঋণের বিকল্প', 'Emergency medical loan options')} variant="secondary" onPress={() => go('loan-apply')} /> : null}
    <Confirm visible={confirm} title={t('অগ্রাধিকার সাক্ষাৎ নিশ্চিত করুন', 'Confirm priority visit')} description={t('নির্বাচিত ভেটের কাছে জরুরি অনুরোধ ও পশুর স্বাস্থ্য ইতিহাস পাঠানো হবে।', 'The selected veterinarian will receive your priority request and linked health history.')} confirmLabel={t('অনুরোধ পাঠান', 'Send request')} cancelLabel={t('বাতিল', 'Cancel')} onConfirm={() => void book()} onCancel={() => setConfirm(false)} loading={busy} />
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
  return <Screen title={t('জরুরি পশু চিকিৎসা', 'Emergency veterinary care')} back><View style={styles.emergency}><Icon name="call-outline" size={40} color={colors.danger} /><AppText variant="title">{t('দ্রুত সাহায্যের অনুরোধ', 'Request urgent assistance')}</AppText><AppText>{t('পশু নির্বাচন করে তাৎক্ষণিক জরুরি ভেট ডিসপ্যাচ অনুরোধ পাঠান।', 'Select your animal to dispatch an urgent veterinary response request.')}</AppText></View><Card style={styles.warning}><AppText variant="label">{t('জরুরি সহায়তা নির্দেশিকা', 'Emergency dispatch notice')}</AppText><AppText>{t('অনুরোধ পাঠানোর সাথে সাথে নিকটস্থ উপলব্ধ পশুচিকিৎসকের কাছে প্রাণীর ৭ দিনের টেলিমেট্রি ও খামারের অবস্থান পৌঁছে যাবে।', 'Submitting dispatches your animal’s 7-day telemetry and farm location to the nearest available on-duty veterinarian.')}</AppText></Card>{animals.length ? <><Choice label={t('কোন পশুর জন্য?', 'Which animal needs care?')} value={animalId} onChange={setAnimalId} options={animals.map(a => ({ value: a.id, label: a.name + ' · ' + a.tag }))} /><Button title={activeEmergency ? t('চলমান অনুরোধ দেখুন', 'View active request') : t('জরুরি ভেট ডিসপ্যাচ অনুরোধ', 'Request emergency vet dispatch')} variant="danger" icon="call-outline" disabled={!animalId} onPress={() => setConfirm(true)} testID="emergency-request" /></> : <EmptyState title={t('আগে পশুর পরিচয় যোগ করুন', 'Register an animal first')} action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go('animals')} />} />}<Confirm visible={confirm} title={t('জরুরি অনুরোধ পাঠাবেন?', 'Send emergency request?')} description={t('পশুর অবস্থা সংকটাপন্ন হিসেবে চিহ্নিত হবে এবং উপলব্ধ ভেটের কাছে জরুরি ভিজিট অনুরোধ যাবে।', 'The animal will be marked critical and an emergency farm visit will be requested from an available veterinarian.')} confirmLabel={t('পাঠান', 'Send request')} cancelLabel={t('বাতিল', 'Cancel')} onConfirm={() => void dispatch()} onCancel={() => setConfirm(false)} loading={busy} danger /></Screen>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  referenceCard: { backgroundColor: colors.brandPale, borderColor: '#D8E9DE', gap: 4, paddingVertical: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  warning: { backgroundColor: colors.warningPale, borderColor: '#FDE68A' },
  danger: { backgroundColor: colors.dangerPale, borderColor: '#FDA4AF' }, chart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  barColumn: { flex: 1, alignItems: 'center', gap: 6 }, barTrack: { height: 110, width: 16, backgroundColor: '#D8E9DE', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: colors.brand, borderRadius: 8 }, emergency: { alignItems: 'center', gap: 16, paddingVertical: 16 },
});

