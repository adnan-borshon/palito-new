import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { isoAfter, type Appointment } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, Confirm, EmptyState, Field, Icon, Row, Screen, Section } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';
import { DemoNotice, Meta, Status } from '../common/helpers';
import { AnimalCard, go, MissingRecord, s } from './components';

const VET_PORTRAITS = [
  palitoImages.vetAvatar1,
  palitoImages.vetAvatar2,
  palitoImages.vetAvatar3,
  palitoImages.vetAvatar4,
  palitoImages.vetAvatar5,
];

function freeSlots(now: string, existing: Appointment[], vetId: string, exceptId?: string) {
  const offsets = [60, 180, 240, 360, 720, 1440];
  return offsets
    .map(minutes => isoAfter(now, minutes))
    .filter(slot =>
      !existing.some(
        item =>
          item.id !== exceptId &&
          item.vetId === vetId &&
          ['requested', 'accepted', 'in_progress'].includes(item.status) &&
          Math.abs(Date.parse(item.scheduledAt) - Date.parse(slot)) < 30 * 60_000,
      ),
    )
    .slice(0, 4);
}

export function VetsScreen() {
  const { state, t, locale, money } = useDemo();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const vets = state.users.filter(u => u.role === 'vet' && u.status === 'active');
  const filtered = vets.filter(vet => {
    const text = `${vet.name} ${vet.nameBn} ${vet.district} ${vet.specialty ?? ''}`.toLowerCase();
    const matchesSearch = text.includes(query.trim().toLowerCase());
    const matchesCategory =
      category === 'all'
        ? true
        : category === 'available'
          ? Boolean(vet.available)
          : category === 'cattle'
            ? text.includes('cattle') || text.includes('গরু') || text.includes('dairy') || text.includes('livestock')
            : category === 'goat'
              ? text.includes('goat') || text.includes('ছাগল') || text.includes('sheep')
              : true;
    return matchesSearch && matchesCategory;
  });

  const speciesCards = [
    { key: 'cattle', title: t('গরু ও মহিষ', 'Cattle & Buffalo'), subtitle: t('ডেইরি, প্রজনন ও সাধারণ চিকিৎসা', 'Dairy, reproduction & general medicine') },
    { key: 'goat', title: t('ছাগল ও ভেড়া', 'Goat & Sheep'), subtitle: t('ক্ষুদ্র প্রাণিসম্পদ ও টিকা বিশেষজ্ঞ', 'Small ruminant & preventive care') },
  ];

  return (
    <Screen title={t('পশুচিকিৎসক খুঁজুন', 'Find a veterinarian')} back testID="farmer-vets">
      <Card style={styles.heroCard}>
        <Image
          source={palitoImages.vetConsultation}
          contentFit="contain"
          style={styles.consultationArt}
          accessibilityLabel={t('পশুচিকিৎসকের পরামর্শ চিত্র', 'Veterinary consultation illustration')}
        />
        <AppText variant="title" style={styles.center}>
          {t('আপনার প্রাণীর ধরন নির্বাচন করুন', 'Choose your livestock category')}
        </AppText>
        <AppText variant="small" color={colors.muted} style={styles.center}>
          {t('গরু, মহিষ ও ছাগলের জন্য অভিজ্ঞ ও সার্টিফাইড ভেটের পরামর্শ বুক করুন।', 'Book certified veterinary specialists for cattle, buffalo, and goats.')}
        </AppText>
      </Card>

      <View style={styles.speciesGrid}>
        {speciesCards.map(item => {
          const active = category === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setCategory(active ? 'all' : item.key)}
              style={[styles.speciesCard, active && styles.speciesCardActive]}
            >
              <View style={[styles.speciesIconCircle, active && styles.speciesIconCircleActive]}>
                <Icon name="paw-outline" color={active ? colors.brand : colors.muted} size={24} />
              </View>
              <View style={s.flex}>
                <AppText variant="heading">{item.title}</AppText>
                <AppText variant="small" color={colors.muted}>{item.subtitle}</AppText>
              </View>
              <Icon name={active ? 'checkmark-circle' : 'chevron-forward'} color={active ? colors.brand : colors.muted} size={20} />
            </Pressable>
          );
        })}
      </View>

      <Field
        label={t('ভেট খুঁজুন', 'Search veterinarians')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('নাম, জেলা বা বিশেষজ্ঞতা', 'Name, district or specialty')}
        testID="vet-search"
      />

      <Choice
        label={t('পশুর ধরন ও প্রাপ্যতা', 'Category & availability')}
        value={category}
        onChange={setCategory}
        options={[
          { value: 'all', label: t('সব ভেট', 'All vets') },
          { value: 'cattle', label: t('গরু ও মহিষ', 'Cattle & buffalo') },
          { value: 'goat', label: t('ছাগল ও ভেড়া', 'Goat & sheep') },
          { value: 'available', label: t('এখন উপলব্ধ', 'Available now') },
        ]}
      />

      {filtered.length ? (
        filtered.map(vet => {
          const portraitIdx = Math.max(0, vets.findIndex(v => v.id === vet.id));
          return (
            <Card key={vet.id} onPress={() => go('vet', vet.id)} testID={`vet-card-${vet.id}`}>
              <View style={s.row}>
                <Image source={VET_PORTRAITS[portraitIdx % VET_PORTRAITS.length]} contentFit="cover" style={styles.avatar} />
                <View style={s.flex}>
                  <View style={s.row}>
                    <AppText variant="heading">{locale === 'bn' ? vet.nameBn : vet.name}</AppText>
                    <Icon name="checkmark-circle" size={18} color={colors.brand} />
                  </View>
                  <AppText variant="small" color={colors.muted}>
                    {vet.specialty ?? t('প্রাণিসম্পদ চিকিৎসক', 'Livestock clinician')} · {vet.district}
                  </AppText>
                  <View style={s.wrap}>
                    <Badge tone={vet.available ? 'success' : 'warning'}>
                      {vet.available ? t('উপলব্ধ', 'Available') : t('ব্যস্ত', 'Busy')}
                    </Badge>
                    <Badge tone="info">{`★ ${vet.rating ?? 4.9} (২৪৩)`}</Badge>
                    <Badge>{`${t('ফি', 'Fee')}: ${money(vet.fee ?? 500)}`}</Badge>
                  </View>
                </View>
              </View>
              <Button title={t('প্রোফাইল ও বুকিং', 'Profile & booking')} variant="secondary" onPress={() => go('vet', vet.id)} />
            </Card>
          );
        })
      ) : (
        <EmptyState
          title={t('কোনো পশুচিকিৎসক পাওয়া যায়নি', 'No matching veterinarians')}
          description={t('সার্চ বা ফিল্টার পরিষ্কার করে আবার দেখুন।', 'Clear your search or filter to see available clinicians.')}
          action={<Button title={t('সব ভেট দেখুন', 'Show all vets')} onPress={() => { setQuery(''); setCategory('all'); }} />}
        />
      )}

      <Button
        title={t('আমার সব সাক্ষাৎ দেখুন', 'View my appointments')}
        variant="ghost"
        icon="calendar-outline"
        onPress={() => go('appointments')}
      />
    </Screen>
  );
}

export function VetProfileScreen({ id }: { id?: string }) {
  const { state, user, t, locale, money, dateTime, run, busy } = useDemo();
  const vets = state.users.filter(u => u.role === 'vet' && u.status === 'active');
  const vet = vets.find(u => u.id === id) ?? vets[0];
  const portraitIdx = Math.max(0, vets.findIndex(v => v.id === vet?.id));
  const animals = state.animals.filter(a => a.ownerId === user?.id && !['sold', 'deceased'].includes(a.status));
  const [animalId, setAnimalId] = useState(animals[0]?.id ?? '');
  const [mode, setMode] = useState<Appointment['mode']>('video');
  const [priority, setPriority] = useState<Appointment['priority']>('routine');
  const slots = vet ? freeSlots(state.now, state.appointments, vet.id) : [];
  const [slot, setSlot] = useState(slots[0] ?? isoAfter(state.now, 60));
  const [reason, setReason] = useState(() => t('খাবারে অরুচি ও জ্বরের লক্ষণ', 'Reduced appetite and fever symptoms'));
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [attempted, setAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!vet) {
    return (
      <Screen title={t('পশুচিকিৎসক', 'Veterinarian')} back>
        <MissingRecord title={t('চিকিৎসকের প্রোফাইল পাওয়া যায়নি', 'Veterinarian unavailable')} />
      </Screen>
    );
  }

  const chosenSlot = slots.includes(slot) ? slot : slots[0] ?? slot;

  const bookAppointment = async () => {
    const result = await run({
      type: 'appointment.book',
      animalId,
      vetId: vet.id,
      scheduledAt: chosenSlot,
      mode,
      priority,
      reason: reason.trim(),
    });
    if (result.ok) {
      setConfirmOpen(false);
      go('appointment', result.id);
    }
  };

  return (
    <Screen title={t('পশুচিকিৎসক প্রোফাইল', 'Veterinarian profile')} back testID="vet-profile">
      <Card style={styles.vetHeaderCard}>
        <View style={styles.vetCentered}>
          <Image source={VET_PORTRAITS[portraitIdx % VET_PORTRAITS.length]} contentFit="cover" style={styles.avatarLarge} />
          <View style={s.row}>
            <AppText variant="title">{locale === 'bn' ? vet.nameBn : vet.name}</AppText>
            <Icon name="checkmark-circle" color={colors.brand} size={20} />
          </View>
          <AppText color={colors.muted} style={styles.center}>
            {vet.specialty ?? t('প্রাণিসম্পদ ও দুগ্ধ খামার বিশেষজ্ঞ', 'Livestock & dairy medicine specialist')}
          </AppText>
          <View style={s.wrap}>
            <Badge tone="success">{t('সার্টিফাইড সদস্য', 'Certified member')}</Badge>
            <Badge tone={vet.available ? 'success' : 'warning'}>
              {vet.available ? t('সাক্ষাতের জন্য উপলব্ধ', 'Available for booking') : t('বর্তমানে অনুপলব্ধ', 'Currently unavailable')}
            </Badge>
            <Badge tone="info">{`★ ${vet.rating ?? 4.9} (২৪৩) · BVC #4821`}</Badge>
          </View>
        </View>
        <Meta label={t('কর্মস্থল', 'District')} value={vet.district} />
        <Meta label={t('পরামর্শ ফি', 'Consultation fee')} value={money(vet.fee ?? 500)} />
        <Meta label={t('সময়সূচি (ঢাকা সময়)', 'Schedule (Asia/Dhaka)')} value={vet.schedule ?? t('সকাল ৮:০০ – রাত ৮:০০', '8:00 AM – 8:00 PM BST')} />
      </Card>

      <Section title={t('সাক্ষাৎ বুক করুন', 'Book an appointment')}>
        {!animals.length ? (
          <EmptyState
            title={t('আগে একটি পশু যোগ করুন', 'Register an animal first')}
            action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => go('animals')} />}
          />
        ) : (
          <Card>
            <Choice
              label={t('পশু নির্বাচন করুন', 'Select animal')}
              value={animalId}
              onChange={setAnimalId}
              options={animals.map(a => ({ value: a.id, label: `${a.name} (${a.tag})` }))}
              testID="book-animal"
            />
            <Choice
              label={t('পরামর্শের মাধ্যম', 'Consultation mode')}
              value={mode}
              onChange={setMode}
              options={[
                { value: 'video', label: t('ভিডিও পরামর্শ', 'Video call') },
                { value: 'visit', label: t('খামার পরিদর্শন', 'Farm visit') },
              ]}
              testID="book-mode"
            />
            <Choice
              label={t('অগ্রাধিকার', 'Priority')}
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'routine', label: t('নিয়মিত', 'Routine') },
                { value: 'urgent', label: t('অগ্রাধিকার', 'Urgent') },
              ]}
              testID="book-priority"
            />
            <Choice
              label={t('সম্ভাব্য সময় (ঢাকা সময়)', 'Available slot (Asia/Dhaka)')}
              value={chosenSlot}
              onChange={setSlot}
              options={slots.map(iso => ({
                value: iso,
                label: dateTime(iso),
              }))}
              testID="book-slot"
            />
            <Field
              label={t('সমস্যা বা লক্ষণ', 'Symptoms or reason for visit')}
              value={reason}
              onChangeText={setReason}
              multiline
              testID="book-reason"
              error={attempted && reason.trim().length < 3 ? t('অন্তত ৩ অক্ষরে সমস্যা লিখুন।', 'Describe the concern in at least 3 characters.') : undefined}
            />
            <Choice
              label={t('পেমেন্ট মাধ্যম', 'Payment method')}
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: 'wallet', label: t('পালিত ওয়ালেট', 'Palito Wallet') },
                { value: 'bkash', label: t('বিকাশ', 'bKash') },
                { value: 'nagad', label: t('নগদ', 'Nagad') },
                { value: 'card', label: t('ডেবিট / ক্রেডিট কার্ড', 'Debit / Credit Card') },
              ]}
            />
            <Meta label={t('মোট পরামর্শ ফি', 'Total consultation fee')} value={money(vet.fee ?? 500)} />
            <Button
              title={t('বুকিং নিশ্চিত করুন', 'Review & confirm booking')}
              disabled={!vet.available || !animalId || busy}
              onPress={() => {
                setAttempted(true);
                if (reason.trim().length < 3 || !animalId) return;
                setConfirmOpen(true);
              }}
              testID="book-submit"
            />
          </Card>
        )}
      </Section>

      <DemoNotice />
      <Confirm
        visible={confirmOpen}
        title={t('সাক্ষাৎ বুকিং নিশ্চিত করুন', 'Confirm veterinary booking')}
        description={`${locale === 'bn' ? vet.nameBn : vet.name} · ${money(vet.fee ?? 500)}\n${t('পশুর ডিজিটাল স্বাস্থ্য ইতিহাস ও গত ৭ দিনের টেলিমেট্রি ভেটের সাথে শেয়ার করা হবে।', 'Animal health records and 7-day telemetry will be shared with the veterinarian.')}`}
        confirmLabel={t('বুকিং পাঠান', 'Send booking')}
        cancelLabel={t('ফিরে যান', 'Go back')}
        loading={busy}
        onConfirm={() => void bookAppointment()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}

export function AppointmentsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, dateTime } = useDemo();
  const [filter, setFilter] = useState('upcoming');
  if (id) return <AppointmentDetail key={id} id={id} />;

  const owned = state.appointments
    .filter(item => item.farmerId === user?.id)
    .slice()
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  const filtered = owned.filter(item =>
    filter === 'upcoming'
      ? ['requested', 'accepted', 'in_progress'].includes(item.status)
      : ['completed', 'cancelled', 'rejected'].includes(item.status),
  );

  return (
    <Screen
      title={t('আমার সাক্ষাৎসমূহ', 'My appointments')}
      back
      testID="farmer-appointments"
      action={<Button title={t('নতুন বুকিং', 'Book vet')} variant="ghost" icon="add" onPress={() => go('vets')} />}
    >
      <Choice
        label={t('তালিকা', 'Show')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'upcoming', label: t('আসন্ন ও চলমান', 'Upcoming & active') },
          { value: 'past', label: t('পূর্ববর্তী ও বাতিল', 'Past & cancelled') },
        ]}
      />
      {filtered.length ? (
        filtered.map(appointment => {
          const animal = state.animals.find(a => a.id === appointment.animalId);
          const vet = state.users.find(u => u.id === appointment.vetId);
          return (
            <Card
              key={appointment.id}
              onPress={() => go('appointment', appointment.id)}
              testID={`appointment-${appointment.id}`}
            >
              <View style={s.row}>
                <AppText variant="heading" style={s.flex}>{animal?.name ?? appointment.animalId}</AppText>
                <Status value={appointment.status} />
              </View>
              <AppText variant="small" color={colors.muted}>
                {vet ? (locale === 'bn' ? vet.nameBn : vet.name) : appointment.vetId} · {dateTime(appointment.scheduledAt)}
              </AppText>
              <View style={s.wrap}>
                <Status value={appointment.priority} />
                <Status value={appointment.mode} />
              </View>
              <AppText numberOfLines={2}>{appointment.reason}</AppText>
            </Card>
          );
        })
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={t('কোনো সাক্ষাৎ নেই', 'No appointments here')}
          description={t('পশুর স্বাস্থ্য পরীক্ষার জন্য একজন ভেট নির্বাচন করুন।', 'Select a veterinarian to schedule a checkup for your animal.')}
          action={<Button title={t('ভেট খুঁজুন', 'Find a vet')} onPress={() => go('vets')} />}
        />
      )}
    </Screen>
  );
}

function AppointmentDetail({ id }: { id: string }) {
  const { state, user, t, locale, dateTime, money, run, busy } = useDemo();
  const appointment = state.appointments.find(item => item.id === id && item.farmerId === user?.id);
  const [muted, setMuted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(() => t('সময় পরিবর্তন প্রয়োজন', 'Need a different time'));
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!appointment) {
    return (
      <Screen title={t('সাক্ষাতের তথ্য', 'Appointment details')} back>
        <MissingRecord title={t('সাক্ষাৎটি পাওয়া যায়নি', 'Appointment unavailable')} />
      </Screen>
    );
  }

  const animal = state.animals.find(a => a.id === appointment.animalId);
  const vet = state.users.find(u => u.id === appointment.vetId);
  const prescription = state.prescriptions.find(p => p.appointmentId === appointment.id);
  const slots = freeSlots(state.now, state.appointments, appointment.vetId, appointment.id);
  const nextSlot = slots[0] ?? isoAfter(state.now, 300);

  return (
    <Screen title={t('সাক্ষাতের বিস্তারিত', 'Appointment details')} back testID="appointment-detail">
      {animal ? <AnimalCard animal={animal} /> : null}
      <Card>
        <View style={s.row}>
          <AppText variant="heading" style={s.flex}>
            {vet ? (locale === 'bn' ? vet.nameBn : vet.name) : appointment.vetId}
          </AppText>
          <Status value={appointment.status} />
        </View>
        <View style={s.wrap}>
          <Status value={appointment.priority} />
          <Status value={appointment.mode} />
        </View>
        <Meta label={t('বুকিং আইডি', 'Booking ID')} value={appointment.id.toUpperCase()} />
        <Meta label={t('নির্ধারিত সময় (ঢাকা)', 'Scheduled time (Dhaka)')} value={dateTime(appointment.scheduledAt)} />
        <Meta label={t('কারণ / লক্ষণ', 'Reason')} value={appointment.reason} />
        <Meta label={t('পরামর্শ ফি', 'Consultation fee')} value={money(vet?.fee ?? 500)} />
        <Badge tone="success">{t('ডিজিটাল পেমেন্ট রসিদ সংরক্ষিত', 'Digital payment receipt verified')}</Badge>
      </Card>

      {appointment.decisionNote ? (
        <Card>
          <AppText variant="label">{t('চিকিৎসকের বার্তা / নোট', 'Veterinarian note')}</AppText>
          <AppText>{appointment.decisionNote}</AppText>
        </Card>
      ) : null}

      {['accepted', 'in_progress'].includes(appointment.status) ? (
        <Card style={styles.callCard}>
          <View style={s.row}>
            <Icon name="videocam-outline" color={colors.surface} />
            <AppText variant="heading" color={colors.surface} style={s.flex}>
              {callEnded
                ? t('পরামর্শ কল সমাপ্ত হয়েছে', 'Consultation call ended')
                : appointment.status === 'in_progress'
                  ? t('ভেটের সাথে সরাসরি পরামর্শ চলছে', 'Live consultation in progress')
                  : t('টেলিমেডিসিন পরামর্শ কক্ষ প্রস্তুত', 'Telemedicine consultation room ready')}
            </AppText>
          </View>
          <AppText variant="small" color="#D8E9DE">
            {t('পশুর স্বাস্থ্য পাসপোর্ট ও ৭ দিনের সেন্সর রিডিং ভেটের প্যানেলে সংযুক্ত আছে।', 'Animal health passport and 7-day sensor readings are synced with the clinician.')}
          </AppText>
          <View style={s.wrap}>
            <Button
              title={muted ? t('মাইক চালু করুন', 'Unmute mic') : t('মাইক মিউট করুন', 'Mute mic')}
              variant="secondary"
              icon={muted ? 'mic-off-outline' : 'mic-outline'}
              onPress={() => setMuted(value => !value)}
              testID="toggle-call-mute"
            />
            <Button
              title={callEnded ? t('পুনরায় সংযোগ করুন', 'Reconnect call') : t('কল শেষ করুন', 'End call')}
              variant={callEnded ? 'primary' : 'danger'}
              icon="call-outline"
              onPress={() => setCallEnded(value => !value)}
              testID="toggle-call-state"
            />
          </View>
        </Card>
      ) : null}

      {prescription ? (
        <Card>
          <AppText variant="heading">{t('ডিজিটাল প্রেসক্রিপশন প্রস্তুত', 'Digital prescription issued')}</AppText>
          <AppText>{prescription.diagnosis}</AppText>
          <Button
            title={t('প্রেসক্রিপশন ও ওষুধ দেখুন', 'View prescription & medicines')}
            onPress={() => go('prescription', prescription.id)}
            testID="open-appointment-prescription"
          />
        </Card>
      ) : null}

      {['requested', 'accepted'].includes(appointment.status) ? (
        <Card>
          <AppText variant="heading">{t('সময় পরিবর্তন বা বাতিল', 'Reschedule or cancel')}</AppText>
          <Button
            title={`${t('পরবর্তী উপলব্ধ সময়ে নিন', 'Reschedule to next slot')} (${dateTime(nextSlot)})`}
            variant="secondary"
            icon="time-outline"
            disabled={busy}
            onPress={() => setRescheduleOpen(true)}
            testID="reschedule-appointment"
          />
          <Field
            label={t('বাতিলের কারণ', 'Cancellation reason')}
            value={cancelReason}
            onChangeText={setCancelReason}
            testID="cancel-reason"
          />
          <Button
            title={t('সাক্ষাৎ বাতিল করুন', 'Cancel appointment')}
            variant="danger"
            disabled={busy || cancelReason.trim().length < 3}
            onPress={() => setCancelOpen(true)}
            testID="cancel-appointment"
          />
        </Card>
      ) : null}

      <Confirm
        visible={rescheduleOpen}
        title={t('সাক্ষাতের সময় পরিবর্তন করবেন?', 'Reschedule this appointment?')}
        description={`${t('নতুন সময়', 'New slot')}: ${dateTime(nextSlot)}`}
        confirmLabel={t('সময় পরিবর্তন', 'Reschedule')}
        cancelLabel={t('ফিরে যান', 'Cancel')}
        loading={busy}
        onCancel={() => setRescheduleOpen(false)}
        onConfirm={() =>
          void run({ type: 'appointment.reschedule', appointmentId: appointment.id, scheduledAt: nextSlot }).then(r => {
            if (r.ok) setRescheduleOpen(false);
          })
        }
      />

      <Confirm
        visible={cancelOpen}
        title={t('সাক্ষাৎটি বাতিল করবেন?', 'Cancel this appointment?')}
        description={t('বাতিল করলে ভেটকে জানানো হবে এবং সতর্কতা থাকলে তা আবার খোলা অবস্থায় ফিরবে।', 'Cancelling notifies the veterinarian and reopens any linked alert.')}
        confirmLabel={t('বাতিল নিশ্চিত করুন', 'Confirm cancellation')}
        cancelLabel={t('ফিরে যান', 'Keep appointment')}
        danger
        loading={busy}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() =>
          void run({ type: 'appointment.cancel', appointmentId: appointment.id, reason: cancelReason.trim() }).then(r => {
            if (r.ok) setCancelOpen(false);
          })
        }
      />
      <DemoNotice />
    </Screen>
  );
}

export function PrescriptionsScreen({ id }: { id?: string }) {
  const { state, user, t, locale, date } = useDemo();
  const prescriptions = state.prescriptions
    .filter(item => item.farmerId === user?.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selected = id ? prescriptions.find(item => item.id === id) : undefined;

  if (id && !selected) {
    return (
      <Screen title={t('প্রেসক্রিপশন', 'Prescription')} back>
        <MissingRecord title={t('প্রেসক্রিপশন পাওয়া যায়নি', 'Prescription unavailable')} />
      </Screen>
    );
  }

  const list = selected ? [selected] : prescriptions;

  return (
    <Screen title={t('ডিজিটাল প্রেসক্রিপশন', 'Digital prescriptions')} back testID="farmer-prescriptions">
      {list.length ? (
        list.map(prescription => {
          const animal = state.animals.find(a => a.id === prescription.animalId);
          const vet = state.users.find(u => u.id === prescription.vetId);
          return (
            <Card key={prescription.id} testID={`prescription-${prescription.id}`}>
              <View style={s.row}>
                <AppText variant="heading" style={s.flex}>{animal?.name ?? prescription.animalId}</AppText>
                <Badge tone="success">{date(prescription.createdAt)}</Badge>
              </View>
              <AppText variant="small" color={colors.muted}>
                {vet ? (locale === 'bn' ? vet.nameBn : vet.name) : prescription.vetId}
              </AppText>
              <Meta label={t('রোগ নির্ণয়', 'Diagnosis')} value={prescription.diagnosis} />
              <Meta label={t('পরামর্শ', 'Advice')} value={prescription.advice} />
              <Section title={t('নির্ধারিত ওষুধ', 'Prescribed medicines')}>
                {prescription.medicines.map((med, i) => (
                  <Card key={`${med.name}-${i}`}>
                    <AppText variant="label">{med.name}</AppText>
                    <AppText variant="small" color={colors.muted}>
                      {`${med.dose} · ${med.frequency} · ${med.days} ${t('দিন', 'days')}`}
                    </AppText>
                  </Card>
                ))}
              </Section>
              <View style={s.wrap}>
                <Button
                  title={t('ওষুধের রিমাইন্ডার', 'Medication reminders')}
                  variant="secondary"
                  icon="alarm-outline"
                  onPress={() => go('reminders')}
                />
                <Button
                  title={t('ওষুধ অর্ডার করুন', 'Order medicine')}
                  icon="bag-outline"
                  onPress={() => go('shop')}
                  testID="prescription-order-medicine"
                />
              </View>
            </Card>
          );
        })
      ) : (
        <EmptyState
          icon="document-text-outline"
          title={t('এখনও কোনো প্রেসক্রিপশন নেই', 'No prescriptions yet')}
          description={t('ভেটের পরামর্শ শেষ হলে ডিজিটাল প্রেসক্রিপশন এখানে যুক্ত হবে।', 'Completed veterinary consultations will add digital prescriptions here.')}
          action={<Button title={t('ভেট খুঁজুন', 'Find a veterinarian')} onPress={() => go('vets')} />}
        />
      )}
    </Screen>
  );
}

export function RemindersScreen() {
  const { state, user, t, locale, date, run, busy } = useDemo();
  const [skippedToday, setSkippedToday] = useState<Record<string, boolean>>({});
  const animalIds = new Set(state.animals.filter(a => a.ownerId === user?.id).map(a => a.id));
  const reminders = state.reminders.filter(item => animalIds.has(item.animalId));
  const dueRecords = state.records.filter(item => animalIds.has(item.animalId) && item.nextDueAt);
  const today = state.now.slice(0, 10);

  return (
    <Screen title={t('ওষুধ ও টিকার রিমাইন্ডার', 'Care & medication reminders')} back testID="farmer-reminders">
      <Section title={t('দৈনিক ওষুধের সময়সূচি', 'Daily medication schedule')}>
        {reminders.length ? (
          reminders.map(reminder => {
            const animal = state.animals.find(a => a.id === reminder.animalId);
            const takenToday = reminder.takenDates.includes(today);
            const isSkipped = Boolean(skippedToday[reminder.id]) && !takenToday;
            return (
              <Card key={reminder.id} testID={`reminder-${reminder.id}`}>
                <View style={s.row}>
                  <View style={s.flex}>
                    <AppText variant="heading">{reminder.medicine}</AppText>
                    <AppText variant="small" color={colors.muted}>
                      {animal?.name ?? reminder.animalId} · {reminder.time}
                    </AppText>
                  </View>
                  <Switch
                    accessibilityLabel={t('রিমাইন্ডার চালু', 'Enable reminder')}
                    value={reminder.enabled}
                    onValueChange={enabled => void run({ type: 'reminder.toggle', reminderId: reminder.id, enabled })}
                    trackColor={{ true: colors.brand }}
                  />
                </View>
                <Badge tone={takenToday ? 'success' : isSkipped ? 'info' : reminder.enabled ? 'warning' : 'neutral'}>
                  {takenToday
                    ? t('আজকের ডোজ দেওয়া হয়েছে', 'Taken today')
                    : isSkipped
                      ? t('আজকের ডোজ বাদ দেওয়া হয়েছে', 'Skipped today')
                      : reminder.enabled
                        ? t('আজকের ডোজ বাকি', 'Due today')
                        : t('রিমাইন্ডার বন্ধ', 'Reminder paused')}
                </Badge>
                {reminder.enabled && !takenToday ? (
                  <View style={s.wrap}>
                    <Button
                      title={t('আজকের ওষুধ দেওয়া হয়েছে চিহ্নিত করুন', 'Mark dose taken today')}
                      variant="secondary"
                      loading={busy}
                      onPress={() => void run({ type: 'reminder.take', reminderId: reminder.id })}
                      testID={`take-reminder-${reminder.id}`}
                    />
                    {!isSkipped ? (
                      <Button
                        title={t('আজকের ডোজ বাদ দিন', 'Skip today')}
                        variant="ghost"
                        disabled={busy}
                        onPress={() => setSkippedToday(prev => ({ ...prev, [reminder.id]: true }))}
                        testID={`skip-reminder-${reminder.id}`}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="alarm-outline"
            title={t('কোনো ওষুধের রিমাইন্ডার নেই', 'No active medication reminders')}
            description={t('ভেট প্রেসক্রিপশন দিলে স্বয়ংক্রিয়ভাবে এখানে ওষুধের রিমাইন্ডার তৈরি হয়।', 'Medication reminders are created automatically when a veterinarian issues a prescription.')}
          />
        )}
      </Section>

      <Section title={t('পরবর্তী টিকা ও পরীক্ষা', 'Upcoming vaccinations & checkups')}>
        {dueRecords.length ? (
          dueRecords.map(record => {
            const animal = state.animals.find(a => a.id === record.animalId);
            return (
              <Card key={record.id} onPress={() => animal && go('animal', animal.id)}>
                <Row
                  title={record.title[locale]}
                  subtitle={`${animal?.name ?? ''} · ${t('পরবর্তী তারিখ', 'Next due')}: ${date(record.nextDueAt!)}`}
                  icon="shield-checkmark-outline"
                />
              </Card>
            );
          })
        ) : (
          <Card>
            <AppText color={colors.muted}>
              {t('কোনো নির্ধারিত পরবর্তী টিকা বা পরীক্ষার তারিখ নেই।', 'No upcoming vaccination or checkup due dates scheduled.')}
            </AppText>
          </Card>
        )}
      </Section>
      <DemoNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: colors.brandPale, borderColor: '#D8E9DE', alignItems: 'center', gap: 10 },
  consultationArt: { width: '100%', height: 160 },
  center: { textAlign: 'center' },
  speciesGrid: { gap: 10 },
  speciesCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  speciesCardActive: { borderColor: colors.brand, backgroundColor: colors.brandPale },
  speciesIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  speciesIconCircleActive: { backgroundColor: '#D8E9DE' },
  vetHeaderCard: { gap: 12 },
  vetCentered: { alignItems: 'center', gap: 8, paddingBottom: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandPale },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.brandPale },
  callCard: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep, gap: 12 },
});
