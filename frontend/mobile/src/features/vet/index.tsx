import { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Switch, View } from 'react-native';
import { hasIoTEvidence, type Medicine } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, EmptyState, Field, Icon, Row, Screen, Section, Stat } from '@/components/ui';
import { navigate } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';
import { DemoNotice, layout, Meta, Missing, Status, useConfirmAction } from '../common/helpers';
import { Vitals } from '../farmer/monitoring';
import type { FeatureProps } from '../types';

const goVet = (screen: string, id?: string) => navigate('vet', screen, id);

export default function VetFeature({ screen, id }: FeatureProps) {
  switch (screen) {
    case 'home': return <VetHomeScreen />;
    case 'appointments':
    case 'appointment': return <VetAppointmentsScreen id={id} />;
    case 'emergency': return <VetEmergencyScreen id={id} />;
    case 'animals':
    case 'animal':
    case 'passport': return <VetAnimalsScreen id={id} />;
    case 'reviews':
    case 'claims':
    case 'claim': return <VetReviewsScreen id={id} />;
    case 'schedule': return <VetScheduleScreen />;
    default: return <VetHomeScreen />;
  }
}

function VetHomeScreen() {
  const { state, user, t, locale, date, run } = useDemo();
  if (!user) return <Missing />;
  const appointments = state.appointments.filter(a => a.vetId === user.id);
  const requested = appointments.filter(a => a.status === 'requested');
  const active = appointments.filter(a => ['accepted', 'in_progress'].includes(a.status));
  const escalatedAlerts = state.alerts.filter(a => ['escalated', 'open'].includes(a.status) && (a.status === 'escalated' || a.severity === 'critical'));
  const referredClaims = state.claims.filter(c => c.vetId === user.id && c.status === 'vet_review');

  return (
    <Screen testID="vet-home" title={t('চিকিৎসক পোর্টাল', 'Veterinarian workspace')}>
      <Card style={styles.hero}>
        <View style={layout.row}>
          <Image source={palitoImages.vetAvatar1} contentFit="cover" style={layout.avatar} />
          <View style={layout.flex}>
            <AppText variant="title" color={colors.surface}>{locale === 'bn' ? user.nameBn : user.name}</AppText>
            <AppText variant="small" color="#D8E9DE">{user.specialty ?? t('প্রাণিসম্পদ চিকিৎসক', 'Livestock clinician')} · {user.district}</AppText>
          </View>
        </View>
        <View style={layout.split}>
          <AppText color={colors.surface}>{user.available ? t('নতুন সাক্ষাতের জন্য উপলব্ধ', 'Available for appointments') : t('বর্তমানে ব্যস্ত', 'Marked unavailable')}</AppText>
          <Switch
            accessibilityLabel={t('সাক্ষাতের প্রাপ্যতা', 'Appointment availability')}
            value={Boolean(user.available)}
            onValueChange={available => void run({ type: 'profile.update', name: user.name, district: user.district, available })}
            trackColor={{ true: colors.brand }}
          />
        </View>
      </Card>

      <View style={layout.row}>
        <Stat label={t('নতুন অনুরোধ', 'Requested')} value={requested.length} icon="calendar-outline" />
        <Stat label={t('চলমান চিকিৎসা', 'Active')} value={active.length} icon="medkit-outline" />
        <Stat label={t('বীমা পর্যালোচনা', 'Claim reviews')} value={referredClaims.length} icon="shield-checkmark-outline" />
      </View>

      {escalatedAlerts.length > 0 ? (
        <Card style={styles.urgentCard}>
          <View style={layout.row}>
            <Icon name="warning-outline" color={colors.danger} />
            <AppText variant="heading" color={colors.danger} style={layout.flex}>
              {t('জরুরি ও ৪ ঘণ্টার এসকেলেট সতর্কতা', 'Emergency & 4-hour escalated alerts')}
            </AppText>
          </View>
          {escalatedAlerts.slice(0, 2).map(alert => {
            const animal = state.animals.find(a => a.id === alert.animalId);
            return (
              <Row
                key={alert.id}
                title={`${animal?.name ?? alert.animalId} · ${alert.title[locale]}`}
                subtitle={`${date(alert.createdAt)} · ${alert.status}`}
                icon="alert-circle-outline"
                danger
                onPress={() => goVet('emergency', alert.id)}
              />
            );
          })}
          <Button
            title={t('সব জরুরি সতর্কতা দেখুন', 'Review escalated alerts')}
            variant="danger"
            onPress={() => goVet('emergency')}
            testID="vet-open-emergency"
          />
        </Card>
      ) : null}

      <Section title={t('আজকের সাক্ষাৎ ও অনুরোধ', 'Appointments queue')}>
        {requested.concat(active).length ? (
          requested.concat(active).slice(0, 4).map(item => {
            const animal = state.animals.find(a => a.id === item.animalId);
            const farmer = state.users.find(u => u.id === item.farmerId);
            return (
              <Card key={item.id} onPress={() => goVet('appointment', item.id)} testID={`vet-appt-${item.id}`}>
                <View style={layout.split}>
                  <AppText variant="heading">{animal?.name ?? item.animalId}</AppText>
                  <Status value={item.status} />
                </View>
                <AppText variant="small" color={colors.muted}>
                  {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : item.farmerId} · {date(item.scheduledAt)}
                </AppText>
                <View style={layout.row}>
                  <Status value={item.priority} />
                  <Status value={item.mode} />
                </View>
                <AppText numberOfLines={2}>{item.reason}</AppText>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="calendar-outline"
            title={t('কোনো অমীমাংসিত সাক্ষাৎ নেই', 'No pending appointments')}
            description={t('খামারি সাক্ষাৎ বুক করলে এখানে দেখা যাবে।', 'New farmer bookings will appear here.')}
          />
        )}
      </Section>

      <Section title={t('জটিল বীমা দাবি পর্যালোচনা', 'Complex claim referrals (UC-002)')}>
        {referredClaims.length ? (
          referredClaims.map(claim => {
            const animal = state.animals.find(a => a.id === claim.animalId);
            return (
              <Card key={claim.id} onPress={() => goVet('claim', claim.id)} testID={`vet-claim-${claim.id}`}>
                <View style={layout.split}>
                  <AppText variant="heading">{animal?.name ?? claim.animalId}</AppText>
                  <Status value={claim.status} />
                </View>
                <AppText numberOfLines={2}>{claim.evidence.description}</AppText>
              </Card>
            );
          })
        ) : (
          <Card>
            <Row
              title={t('সব দাবি পর্যালোচনা দেখুন', 'Open claim review queue')}
              subtitle={t('বীমা কোম্পানির পাঠানো কেসসমূহ', 'Cases referred by the insurer')}
              icon="shield-checkmark-outline"
              onPress={() => goVet('reviews')}
            />
          </Card>
        )}
      </Section>

      <Card>
        <Row
          title={t('সময়সূচি ও প্রোফাইল সেটিংস', 'Schedule & clinical availability')}
          subtitle={user.schedule ?? t('সকাল ৮:০০ – রাত ৮:০০', '8:00 AM – 8:00 PM')}
          icon="time-outline"
          onPress={() => goVet('schedule')}
          testID="vet-open-schedule"
        />
      </Card>
      <DemoNotice />
    </Screen>
  );
}

function VetAppointmentsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, date } = useDemo();
  const [filter, setFilter] = useState('open');
  if (id) return <VetAppointmentDetail key={id} id={id} />;

  const list = state.appointments
    .filter(item => item.vetId === user?.id)
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'open') return ['requested', 'accepted', 'in_progress'].includes(item.status);
      return item.status === filter;
    })
    .slice()
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  return (
    <Screen title={t('সাক্ষাৎ ও পরামর্শ', 'Visits & consultations')} testID="vet-appointments">
      <Choice
        label={t('তালিকা', 'Filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: t('চলমান ও অনুরোধ', 'Requested & active') },
          { value: 'completed', label: t('সম্পন্ন', 'Completed') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {list.length ? (
        list.map(item => {
          const animal = state.animals.find(a => a.id === item.animalId);
          const farmer = state.users.find(u => u.id === item.farmerId);
          return (
            <Card key={item.id} onPress={() => goVet('appointment', item.id)} testID={`vet-visit-${item.id}`}>
              <View style={layout.split}>
                <AppText variant="heading">{animal?.name ?? item.animalId}</AppText>
                <Status value={item.status} />
              </View>
              <AppText variant="small" color={colors.muted}>
                {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : item.farmerId} · {date(item.scheduledAt)}
              </AppText>
              <View style={layout.row}>
                <Status value={item.priority} />
                <Status value={item.mode} />
              </View>
              <AppText>{item.reason}</AppText>
            </Card>
          );
        })
      ) : (
        <EmptyState title={t('এই ফিল্টারে কোনো সাক্ষাৎ নেই', 'No visits in this view')} />
      )}
    </Screen>
  );
}

function VetAppointmentDetail({ id }: { id: string }) {
  const { state, user, t, locale, date, run, busy } = useDemo();
  const appointment = state.appointments.find(item => item.id === id && item.vetId === user?.id);
  const [declineNote, setDeclineNote] = useState('');
  const [diagnosis, setDiagnosis] = useState('তাপমাত্রা বৃদ্ধি ও পরিপাকজনিত দুর্বলতা / Elevated temperature and digestive stress');
  const [advice, setAdvice] = useState('পরিষ্কার পানি, ছায়াযুক্ত স্থান এবং নির্ধারিত ওষুধ ৫ দিন চালিয়ে যান / Keep hydrated in shade and give prescribed medication for 5 days');
  const [medName, setMedName] = useState('Meloxicam + B-Complex Vet (Demo)');
  const [medDose, setMedDose] = useState('1 bolus');
  const [medFreq, setMedFreq] = useState('দিনে ২ বার / Twice daily');
  const [medDays, setMedDays] = useState('5');
  const [extraMeds, setExtraMeds] = useState<Medicine[]>([]);
  const [attempted, setAttempted] = useState(false);

  if (!appointment) return <Missing title={t('সাক্ষাৎ পাওয়া যায়নি', 'Appointment unavailable')} />;

  const animal = state.animals.find(a => a.id === appointment.animalId);
  const farmer = state.users.find(u => u.id === appointment.farmerId);
  const records = state.records.filter(r => r.animalId === appointment.animalId);
  const prescription = state.prescriptions.find(p => p.appointmentId === appointment.id);

  const decide = async (accept: boolean) => {
    setAttempted(true);
    if (!accept && declineNote.trim().length < 3) return;
    await run({
      type: 'appointment.decide',
      appointmentId: appointment.id,
      accept,
      note: declineNote.trim() || undefined,
    });
  };

  const addMedicineItem = () => {
    const daysNum = Number(medDays);
    if (!medName.trim() || !medDose.trim() || !medFreq.trim() || !Number.isInteger(daysNum) || daysNum <= 0) return;
    setExtraMeds(prev => [...prev, { name: medName.trim(), dose: medDose.trim(), frequency: medFreq.trim(), days: daysNum }]);
    setMedName('');
  };

  const completeConsultation = async () => {
    setAttempted(true);
    const daysNum = Number(medDays);
    const primaryMed: Medicine | null =
      medName.trim() && medDose.trim() && medFreq.trim() && Number.isInteger(daysNum) && daysNum > 0 && daysNum <= 90
        ? { name: medName.trim(), dose: medDose.trim(), frequency: medFreq.trim(), days: daysNum }
        : null;
    const medicines = [...extraMeds, ...(primaryMed ? [primaryMed] : [])];
    if (diagnosis.trim().length < 3 || advice.trim().length < 3 || medicines.length === 0) return;
    await run({
      type: 'consultation.complete',
      appointmentId: appointment.id,
      diagnosis: diagnosis.trim(),
      advice: advice.trim(),
      medicines,
    });
  };

  return (
    <Screen title={t('চিকিৎসা ও পরামর্শ কক্ষ', 'Clinical consultation')} back testID="vet-appointment-detail">
      <Card>
        <View style={layout.split}>
          <AppText variant="title">{animal?.name ?? appointment.animalId}</AppText>
          <Status value={appointment.status} />
        </View>
        <View style={layout.row}>
          <Status value={appointment.priority} />
          <Status value={appointment.mode} />
        </View>
        <Meta label={t('খামারি', 'Farmer')} value={farmer ? `${locale === 'bn' ? farmer.nameBn : farmer.name} (${farmer.phone})` : appointment.farmerId} />
        <Meta label={t('নির্ধারিত সময়', 'Scheduled')} value={date(appointment.scheduledAt)} />
        <Meta label={t('লক্ষণ / কারণ', 'Reason')} value={appointment.reason} />
        {animal ? (
          <Button
            title={t('সম্পূর্ণ পশু পাসপোর্ট দেখুন', 'Open animal passport')}
            variant="secondary"
            onPress={() => goVet('animal', animal.id)}
          />
        ) : null}
      </Card>

      {animal ? <Vitals animalId={animal.id} /> : null}

      <Section title={t('পশুর স্বাস্থ্য ইতিহাস', 'Patient health history')}>
        {records.map(record => (
          <Card key={record.id}>
            <AppText variant="label">{record.title[locale]}</AppText>
            <AppText>{record.note}</AppText>
            <AppText variant="small" color={colors.muted}>{date(record.createdAt)}</AppText>
          </Card>
        ))}
      </Section>

      {appointment.status === 'requested' ? (
        <Card>
          <AppText variant="heading">{t('বুকিং সিদ্ধান্ত', 'Appointment decision')}</AppText>
          <Field
            label={t('নোট বা প্রত্যাখ্যানের কারণ', 'Note or decline reason')}
            value={declineNote}
            onChangeText={setDeclineNote}
            testID="vet-decision-note"
            error={attempted && declineNote.trim().length < 3 ? t('প্রত্যাখ্যান করতে অন্তত ৩ অক্ষরের কারণ দিন।', 'Provide a reason of at least 3 characters to decline.') : undefined}
          />
          <Button
            title={t('সাক্ষাৎ গ্রহণ করুন', 'Accept appointment')}
            onPress={() => void decide(true)}
            loading={busy}
            testID="vet-accept-appointment"
          />
          <Button
            title={t('প্রত্যাখ্যান করুন', 'Decline appointment')}
            variant="danger"
            onPress={() => void decide(false)}
            disabled={busy}
            testID="vet-reject-appointment"
          />
        </Card>
      ) : null}

      {appointment.status === 'accepted' ? (
        <Card style={styles.callBanner}>
          <AppText variant="heading" color={colors.surface}>{t('পরামর্শ শুরু করার জন্য প্রস্তুত', 'Ready to start consultation')}</AppText>
          <AppText variant="small" color="#D8E9DE">
            {t('পরামর্শ শুরু করলে ডেমো কল চালু হবে এবং প্রেসক্রিপশন লেখার ফর্ম খুলবে।', 'Starting the consultation launches the simulated call and clinical prescription form.')}
          </AppText>
          <Button
            title={t('পরামর্শ শুরু করুন', 'Start consultation')}
            icon="videocam-outline"
            onPress={() => void run({ type: 'consultation.start', appointmentId: appointment.id })}
            loading={busy}
            testID="vet-start-consultation"
          />
        </Card>
      ) : null}

      {appointment.status === 'in_progress' ? (
        <Card>
          <Badge tone="info">{t('ডেমো কল চলমান · প্রেসক্রিপশন লিখুন', 'Simulated call active · Issue prescription')}</Badge>
          <AppText variant="heading">{t('ক্লিনিক্যাল নোট ও ডিজিটাল প্রেসক্রিপশন', 'Clinical record & digital prescription')}</AppText>
          <Field
            label={t('রোগ নির্ণয় (Diagnosis)', 'Diagnosis')}
            value={diagnosis}
            onChangeText={setDiagnosis}
            multiline
            testID="vet-diagnosis"
            error={attempted && diagnosis.trim().length < 3 ? t('রোগ নির্ণয় লিখুন।', 'Enter a diagnosis.') : undefined}
          />
          <Field
            label={t('পরামর্শ ও পরিচর্যা (Advice)', 'Care advice')}
            value={advice}
            onChangeText={setAdvice}
            multiline
            testID="vet-advice"
            error={attempted && advice.trim().length < 3 ? t('পরামর্শ লিখুন।', 'Enter clinical advice.') : undefined}
          />

          <Section title={t('ওষুধের তালিকা', 'Medicines')}>
            {extraMeds.map((med, i) => (
              <Card key={`${med.name}-${i}`}>
                <AppText variant="label">{`${med.name} · ${med.dose}`}</AppText>
                <AppText variant="small" color={colors.muted}>{`${med.frequency} · ${med.days} ${t('দিন', 'days')}`}</AppText>
              </Card>
            ))}
            <Field label={t('ওষুধের নাম', 'Medicine name')} value={medName} onChangeText={setMedName} testID="vet-med-name" />
            <Field label={t('মাত্রা (Dose)', 'Dose')} value={medDose} onChangeText={setMedDose} testID="vet-med-dose" />
            <Field label={t('কতবার (Frequency)', 'Frequency')} value={medFreq} onChangeText={setMedFreq} testID="vet-med-freq" />
            <Field label={t('কত দিন (Days)', 'Duration (days)')} value={medDays} onChangeText={setMedDays} keyboardType="number-pad" testID="vet-med-days" />
            <Button
              title={t('তালিকায় আরেকটি ওষুধ যোগ করুন', 'Add medicine to list')}
              variant="secondary"
              onPress={addMedicineItem}
            />
          </Section>

          <Button
            title={t('পরামর্শ সম্পন্ন ও প্রেসক্রিপশন প্রকাশ করুন', 'Complete consultation & publish prescription')}
            onPress={() => void completeConsultation()}
            loading={busy}
            testID="vet-complete-consultation"
          />
        </Card>
      ) : null}

      {prescription ? (
        <Card>
          <Badge tone="success">{t('প্রেসক্রিপশন প্রকাশিত হয়েছে', 'Prescription published')}</Badge>
          <Meta label={t('রোগ নির্ণয়', 'Diagnosis')} value={prescription.diagnosis} />
          <Meta label={t('পরামর্শ', 'Advice')} value={prescription.advice} />
        </Card>
      ) : null}
      <DemoNotice />
    </Screen>
  );
}

function VetEmergencyScreen({ id }: { id?: string }) {
  const { state, t, locale, date } = useDemo();
  const alerts = state.alerts.filter(a => a.status === 'escalated' || a.severity === 'critical' || a.id === id);
  const selected = id ? alerts.find(a => a.id === id) : undefined;
  const list = selected ? [selected] : alerts;

  return (
    <Screen title={t('জরুরি ও এসকেলেট সতর্কতা', 'Emergency & escalated alerts')} back testID="vet-emergency">
      <DemoNotice
        bn="৪ ঘণ্টায় খামারি উত্তর না দিলে সতর্কতা এখানে এসকেলেট হয় (UC-001)।"
        en="Unacknowledged alerts escalate here after 4 demo hours (UC-001)."
      />
      {list.length ? (
        list.map(alert => {
          const animal = state.animals.find(a => a.id === alert.animalId);
          return (
            <Card key={alert.id} testID={`vet-alert-${alert.id}`}>
              <View style={layout.split}>
                <AppText variant="heading">{animal?.name ?? alert.animalId}</AppText>
                <Status value={alert.status} />
              </View>
              <AppText>{alert.title[locale]}</AppText>
              <AppText variant="small" color={colors.muted}>{alert.message[locale]} · {date(alert.createdAt)}</AppText>
              {animal ? <Vitals animalId={animal.id} /> : null}
              <View style={layout.row}>
                {alert.appointmentId ? (
                  <Button
                    title={t('সাক্ষাৎ খুলুন', 'Open appointment')}
                    onPress={() => goVet('appointment', alert.appointmentId)}
                  />
                ) : null}
                {animal ? (
                  <Button
                    title={t('পশুর পাসপোর্ট', 'Animal passport')}
                    variant="secondary"
                    onPress={() => goVet('animal', animal.id)}
                  />
                ) : null}
              </View>
            </Card>
          );
        })
      ) : (
        <EmptyState title={t('কোনো জরুরি বা এসকেলেট সতর্কতা নেই', 'No escalated or emergency alerts')} />
      )}
    </Screen>
  );
}

function VetAnimalsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, date, run, busy } = useDemo();
  const [kind, setKind] = useState<'checkup' | 'vaccination' | 'treatment'>('vaccination');
  const [titleBn, setTitleBn] = useState('এফএমডি টিকা প্রদান');
  const [titleEn, setTitleEn] = useState('FMD vaccination');
  const [note, setNote] = useState('নির্ধারিত বুস্টার ডোজ সম্পন্ন / Scheduled booster dose administered');
  const [nextDue, setNextDue] = useState('2027-05-14');

  const linkedIds = new Set([
    ...state.appointments.filter(a => a.vetId === user?.id && !['rejected', 'cancelled'].includes(a.status)).map(a => a.animalId),
    ...state.claims.filter(c => c.vetId === user?.id && c.status === 'vet_review').map(c => c.animalId),
  ]);

  if (id) {
    const animal = state.animals.find(a => a.id === id);
    if (!animal) return <Missing />;
    const records = state.records.filter(r => r.animalId === animal.id);
    const canWrite = linkedIds.has(animal.id) && !['sold', 'deceased'].includes(animal.status);
    return (
      <Screen title={t('রোগীর পাসপোর্ট ও রেকর্ড', 'Patient passport & records')} back testID="vet-animal-detail">
        <Card>
          <View style={layout.split}>
            <AppText variant="title">{`${animal.name} (${animal.tag})`}</AppText>
            <Status value={animal.status} />
          </View>
          <Meta label={t('জাত', 'Breed')} value={animal.breed} />
          <Meta label={t('ওজন', 'Weight')} value={`${animal.weightKg} kg`} />
          <Meta label={t('স্বাস্থ্য স্কোর', 'Health score')} value={`${animal.healthScore}/100`} />
        </Card>
        <Vitals animalId={animal.id} />
        <Section title={t('স্বাস্থ্য ও টিকার ইতিহাস', 'Clinical & vaccination records')}>
          {records.map(r => (
            <Card key={r.id}>
              <View style={layout.split}>
                <AppText variant="label">{r.title[locale]}</AppText>
                <Status value={r.kind} />
              </View>
              <AppText>{r.note}</AppText>
              <AppText variant="small" color={colors.muted}>{date(r.createdAt)}</AppText>
            </Card>
          ))}
        </Section>
        {canWrite ? (
          <Card>
            <AppText variant="heading">{t('নতুন ক্লিনিক্যাল বা টিকার রেকর্ড যোগ করুন', 'Add clinical or vaccination record')}</AppText>
            <Choice
              label={t('রেকর্ডের ধরন', 'Record type')}
              value={kind}
              onChange={setKind}
              options={[
                { value: 'vaccination', label: t('টিকা', 'Vaccination') },
                { value: 'treatment', label: t('চিকিৎসা', 'Treatment') },
                { value: 'checkup', label: t('পরীক্ষা', 'Checkup') },
              ]}
            />
            <Field label={t('শিরোনাম (বাংলা)', 'Title (Bangla)')} value={titleBn} onChangeText={setTitleBn} />
            <Field label={t('শিরোনাম (English)', 'Title (English)')} value={titleEn} onChangeText={setTitleEn} />
            <Field label={t('বিবরণ', 'Clinical note')} value={note} onChangeText={setNote} multiline testID="vet-record-note" />
            <Field label={t('পরবর্তী তারিখ (YYYY-MM-DD)', 'Next due date (YYYY-MM-DD)')} value={nextDue} onChangeText={setNextDue} />
            <Button
              title={t('রেকর্ড সংরক্ষণ করুন', 'Save clinical record')}
              loading={busy}
              onPress={() =>
                void run({
                  type: 'record.add',
                  animalId: animal.id,
                  kind,
                  title: { bn: titleBn.trim(), en: titleEn.trim() },
                  note: note.trim(),
                  nextDueAt: nextDue.trim() ? new Date(nextDue.trim()).toISOString() : undefined,
                })
              }
              testID="vet-save-record"
            />
          </Card>
        ) : null}
      </Screen>
    );
  }

  const animals = state.animals.filter(a => linkedIds.has(a.id));
  return (
    <Screen title={t('চিকিৎসাধীন পশুসমূহ', 'Assigned patients')} testID="vet-animals">
      {animals.length ? (
        animals.map(animal => (
          <Card key={animal.id} onPress={() => goVet('animal', animal.id)} testID={`vet-patient-${animal.id}`}>
            <View style={layout.split}>
              <AppText variant="heading">{`${animal.name} (${animal.tag})`}</AppText>
              <Status value={animal.status} />
            </View>
            <AppText variant="small" color={colors.muted}>{`${animal.breed} · ${animal.weightKg} kg`}</AppText>
          </Card>
        ))
      ) : (
        <EmptyState title={t('কোনো সংযুক্ত পশু নেই', 'No assigned animals yet')} />
      )}
    </Screen>
  );
}

function VetReviewsScreen({ id }: { id?: string }) {
  const { state, user, t, money, date } = useDemo();
  const [opinion, setOpinion] = useState('ক্লিনিক্যাল ও IoT তথ্য যাচাইয়ে ঘটনাটি সামঞ্জস্যপূর্ণ পাওয়া গেছে / Clinical history and IoT data are consistent with the reported claim.');
  const [attempted, setAttempted] = useState(false);
  const confirm = useConfirmAction();

  const claims = state.claims.filter(c => c.vetId === user?.id || c.status === 'vet_review');
  if (id) {
    const claim = state.claims.find(c => c.id === id);
    const animal = state.animals.find(a => a.id === claim?.animalId);
    if (!claim || !animal) return <Missing />;
    const iot = hasIoTEvidence(state, animal.id, claim.evidence.capturedAt ?? claim.createdAt);
    const records = state.records.filter(r => r.animalId === animal.id);

    return (
      <Screen title={t('বীমা দাবি চিকিৎসা পর্যালোচনা', 'Veterinary claim assessment')} back testID="vet-claim-detail">
        <Card>
          <View style={layout.split}>
            <AppText variant="title">{animal.name} ({animal.tag})</AppText>
            <Status value={claim.status} />
          </View>
          <Badge tone="info">{t('লক্ষ্যমাত্রা: ৭ দিনের ডেমো পর্যালোচনা', 'Target: 7-day simulated review SLA')}</Badge>
          <Meta label={t('দাবির ধরন', 'Claim type')} value={claim.kind} />
          <Meta label={t('দাবির পরিমাণ', 'Claim amount')} value={money(claim.amount)} />
          <Meta label={t('৪৮ ঘণ্টার IoT প্রমাণ', '48-hour IoT check')} value={iot ? t('উপস্থিত', 'Verified') : t('অসম্পূর্ণ', 'Incomplete')} />
          <AppText>{claim.evidence.description}</AppText>
        </Card>

        <Section title={t('পশুর স্বাস্থ্য রেকর্ড', 'Animal health records')}>
          {records.map(r => (
            <Card key={r.id}>
              <AppText variant="label">{r.title.bn} / {r.title.en}</AppText>
              <AppText>{r.note}</AppText>
              <AppText variant="small" color={colors.muted}>{date(r.createdAt)}</AppText>
            </Card>
          ))}
        </Section>

        {claim.status === 'vet_review' && claim.vetId === user?.id ? (
          <Card>
            <AppText variant="heading">{t('চিকিৎসকের মতামত জমা দিন', 'Submit veterinary opinion')}</AppText>
            <Field
              label={t('ক্লিনিক্যাল মূল্যায়ন (অন্তত ৮ অক্ষর)', 'Clinical assessment (at least 8 characters)')}
              value={opinion}
              onChangeText={setOpinion}
              multiline
              testID="vet-claim-opinion"
              error={attempted && opinion.trim().length < 8 ? t('অন্তত ৮ অক্ষরে আপনার মতামত লিখুন।', 'Enter at least 8 characters for your clinical opinion.') : undefined}
            />
            <Button
              title={t('বীমাকারীর কাছে মতামত পাঠান', 'Submit opinion to insurer')}
              onPress={() => {
                setAttempted(true);
                if (opinion.trim().length < 8) return;
                confirm.open(
                  { type: 'claim.vetReview', claimId: claim.id, opinion: opinion.trim() },
                  t('মতামত জমা নিশ্চিত করুন', 'Confirm clinical opinion'),
                  t('আপনার মতামত বীমা প্রতিষ্ঠানের চূড়ান্ত সিদ্ধান্তের জন্য যুক্ত হবে।', 'Your opinion will be recorded for the insurer’s final decision.'),
                );
              }}
              testID="submit-vet-opinion"
            />
          </Card>
        ) : claim.vetOpinion ? (
          <Card>
            <AppText variant="label">{t('জমা দেওয়া মতামত', 'Submitted opinion')}</AppText>
            <AppText>{claim.vetOpinion}</AppText>
          </Card>
        ) : null}
        <DemoNotice />
        {confirm.dialog}
      </Screen>
    );
  }

  return (
    <Screen title={t('বীমা দাবি পর্যালোচনা', 'Claim review referrals')} testID="vet-reviews">
      {claims.length ? (
        claims.map(claim => {
          const animal = state.animals.find(a => a.id === claim.animalId);
          return (
            <Card key={claim.id} onPress={() => goVet('claim', claim.id)} testID={`vet-review-card-${claim.id}`}>
              <View style={layout.split}>
                <AppText variant="heading">{animal?.name ?? claim.animalId}</AppText>
                <Status value={claim.status} />
              </View>
              <Meta label={t('পরিমাণ', 'Amount')} value={money(claim.amount)} />
              <AppText numberOfLines={2}>{claim.evidence.description}</AppText>
            </Card>
          );
        })
      ) : (
        <EmptyState
          icon="shield-checkmark-outline"
          title={t('কোনো রেফার করা বীমা দাবি নেই', 'No referred insurance claims')}
          description={t('বীমা প্রতিষ্ঠান জটিল দাবি পাঠালে এখানে দেখা যাবে।', 'Complex claims referred by an insurer will appear here for clinical review.')}
        />
      )}
    </Screen>
  );
}

function VetScheduleScreen() {
  const { user, t, run, busy } = useDemo();
  const [specialty, setSpecialty] = useState(user?.specialty ?? 'Livestock care · প্রাণিসম্পদ চিকিৎসা');
  const [schedule, setSchedule] = useState(user?.schedule ?? 'শনি–বৃহস্পতি সকাল ৮:০০ – রাত ৮:০০ / Sat–Thu 8:00 AM – 8:00 PM');
  const [available, setAvailable] = useState(Boolean(user?.available ?? true));
  if (!user) return <Missing />;

  const save = async () => {
    await run({
      type: 'profile.update',
      name: user.name,
      district: user.district,
      specialty: specialty.trim(),
      schedule: schedule.trim(),
      available,
    });
  };

  return (
    <Screen title={t('সময়সূচি ও প্রাপ্যতা', 'Schedule & availability')} back testID="vet-schedule">
      <Card>
        <Row
          title={t('নতুন সাক্ষাৎ গ্রহণ চালু', 'Accepting new bookings')}
          subtitle={t('বন্ধ থাকলে খামারিরা নতুন স্লট বুক করতে পারবেন না।', 'When paused, farmers cannot book new consultation slots.')}
          trailing={
            <Switch
              accessibilityLabel={t('সাক্ষাৎ প্রাপ্যতা', 'Booking availability')}
              value={available}
              onValueChange={setAvailable}
              trackColor={{ true: colors.brand }}
            />
          }
        />
        <Field label={t('বিশেষজ্ঞতা', 'Specialty')} value={specialty} onChangeText={setSpecialty} testID="vet-specialty" />
        <Field label={t('উপস্থিতির সময়সূচি', 'Consultation schedule')} value={schedule} onChangeText={setSchedule} testID="vet-schedule-input" />
        <Button title={t('সময়সূচি সংরক্ষণ করুন', 'Save schedule')} loading={busy} onPress={() => void save()} testID="vet-save-schedule" />
      </Card>
      <DemoNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep, gap: 14 },
  urgentCard: { backgroundColor: colors.dangerPale, borderColor: '#FDA4AF' },
  callBanner: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep },
});
