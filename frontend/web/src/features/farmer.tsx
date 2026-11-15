'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useMemo, useState } from 'react';
import {
  demoBalance,
  demoLoanQuote,
  maximumLoanAmount,
  type AIMessage,
  type Animal,
  type HealthAlert,
  type HealthRecord,
  type Severity,
} from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { webHref } from '@/navigation.ts';
import {
  Badge,
  Button,
  Card,
  EmptyWorkspaceState,
  Field,
  HealthScoreBar,
  KpiCard,
  SelectField,
  SplitWorkbench,
  TabsBar,
  TextareaField,
  toneForStatus,
} from '@/components/ui.tsx';

type FarmerSection =
  | 'home'
  | 'animals'
  | 'devices'
  | 'care'
  | 'ai'
  | 'wallet'
  | 'market'
  | 'education';

export function FarmerWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  const router = useRouter();
  const { state, user, locale, t, money, date, dateTime, run, busy, openMobileHandoff } =
    useWebApp();

  const mappedInitial: FarmerSection = [
    'animals',
    'animal',
    'animal-add',
    'animal-edit',
    'record-add',
    'farm',
  ].includes(screen)
    ? 'animals'
    : ['devices', 'device', 'vitals', 'alerts', 'alert'].includes(screen)
      ? 'devices'
      : [
            'care',
            'vets',
            'vet',
            'book',
            'appointments',
            'appointment',
            'emergency',
            'prescriptions',
            'prescription',
            'reminders',
          ].includes(screen)
        ? 'care'
        : screen === 'ai'
          ? 'ai'
          : [
                'wallet',
                'loans',
                'loan',
                'loan-apply',
                'insurance',
                'insurance-apply',
                'policy',
                'policies',
                'claims',
                'claim',
                'claim-apply',
              ].includes(screen)
            ? 'wallet'
            : ['market', 'shop', 'orders', 'order'].includes(screen)
              ? 'market'
              : ['education', 'article'].includes(screen)
                ? 'education'
                : 'home';

  const section: FarmerSection = mappedInitial;

  const myAnimals = state.animals.filter(
    (a) => a.ownerId === user?.id && a.status !== 'sold',
  );
  const myAnimalIds = new Set(myAnimals.map((a) => a.id));
  const myAlerts = state.alerts.filter((al) => myAnimalIds.has(al.animalId));
  const myLoans = state.loans.filter((l) => l.farmerId === user?.id);
  const myPolicies = state.policies.filter((p) => p.farmerId === user?.id);
  const myClaims = state.claims.filter((c) => c.farmerId === user?.id);
  const myAppointments = state.appointments.filter((a) => a.farmerId === user?.id);
  const myPrescriptions = state.prescriptions.filter((p) => p.farmerId === user?.id);
  const myReminders = state.reminders.filter((r) => myAnimalIds.has(r.animalId));
  const myOrders = state.orders.filter((o) => o.farmerId === user?.id);
  const myPayments = state.payments.filter((p) => p.userId === user?.id);
  const walletBalance = user ? demoBalance(state, user.id) : 0;

  // Animal & Passport state
  const resolvedAnimalFromId = (() => {
    if (!id) return undefined;
    if (myAnimals.some((a) => a.id === id)) return id;
    const matchedAlert = myAlerts.find((a) => a.id === id);
    if (matchedAlert) return matchedAlert.animalId;
    const matchedDevice = state.devices.find((d) => d.id === id && myAnimalIds.has(d.animalId));
    if (matchedDevice) return matchedDevice.animalId;
    const matchedAppt = myAppointments.find((a) => a.id === id);
    if (matchedAppt) return matchedAppt.animalId;
    const matchedRx = myPrescriptions.find((p) => p.id === id);
    if (matchedRx) return matchedRx.animalId;
    const matchedLoan = myLoans.find((l) => l.id === id);
    if (matchedLoan) return matchedLoan.animalId;
    const matchedPolicy = myPolicies.find((p) => p.id === id);
    if (matchedPolicy) return matchedPolicy.animalId;
    const matchedClaim = myClaims.find((c) => c.id === id);
    if (matchedClaim) return matchedClaim.animalId;
    return undefined;
  })();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    resolvedAnimalFromId ?? myAnimals[0]?.id ?? '',
  );
  const [passportSubTab, setPassportSubTab] = useState<'overview' | 'records' | 'gallery'>(
    screen === 'record-add' ? 'records' : 'overview',
  );
  const [animalName, setAnimalName] = useState('রূপা / Rupa');
  const [animalSpecies, setAnimalSpecies] = useState<Animal['species']>('cattle');
  const [animalBreed, setAnimalBreed] = useState('Sahiwal Cross');
  const [animalSex, setAnimalSex] = useState<Animal['sex']>('female');
  const [animalBirth, setAnimalBirth] = useState('2023-04-15');
  const [animalWeight, setAnimalWeight] = useState('340');
  const [animalValue, setAnimalValue] = useState('140000');

  const [editAnimalName, setEditAnimalName] = useState('');
  const [editAnimalBreed, setEditAnimalBreed] = useState('');
  const [editAnimalWeight, setEditAnimalWeight] = useState('');
  const [editAnimalValue, setEditAnimalValue] = useState('');

  const [recKind, setRecKind] = useState<HealthRecord['kind']>('checkup');
  const [recTitleBn, setRecTitleBn] = useState('নিয়মিত স্বাস্থ্য পর্যবেক্ষণ');
  const [recTitleEn, setRecTitleEn] = useState('Routine Owner Health Check');
  const [recNote, setRecNote] = useState('Normal appetite and rumination observed.');
  const [recNextDueAt, setRecNextDueAt] = useState('');

  // IoT & Vitals state
  const [collarSerial, setCollarSerial] = useState('PLT-CLR-908');
  const [simKind, setSimKind] = useState<HealthAlert['kind']>('temperature');
  const [simSeverity, setSimSeverity] = useState<Severity>('critical');
  const [selectedAlertId] = useState<string>(
    screen === 'care' && id && myAlerts.some((a) => a.id === id) ? id : '',
  );

  // Vet Care & Reminders state
  const vets = state.users.filter((u) => u.role === 'vet' && u.status === 'active');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'cattle' | 'goat'>('all');
  const [selectedVetId, setSelectedVetId] = useState<string>(vets[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<string>('wallet');
  const [apptMode, setApptMode] = useState<'video' | 'visit'>('video');
  const [apptPriority, setApptPriority] = useState<'routine' | 'urgent' | 'emergency'>(
    'urgent',
  );
  const [apptReason, setApptReason] = useState(
    'Elevated collar temperature and reduced morning feed intake.',
  );
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [micMuted, setMicMuted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // AI Scan state
  const [aiMode, setAiMode] = useState<AIMessage['mode']>('text');
  const [aiPrompt, setAiPrompt] = useState(
    'গাভীর তাপমাত্রা ৩৯.৬°সে এবং জাবর কাটা কমে গেছে, এখন করণীয় কী?',
  );

  // Finance (Loan & Insurance) state
  const [loanAmount, setLoanAmount] = useState('70000');
  const [loanTerm, setLoanTerm] = useState('12');
  const [loanPurpose, setLoanPurpose] = useState('Dairy feed & automated milking unit');
  const [loanRepaySource] = useState('Daily milk collection revenue');
  const [repayInput, setRepayInput] = useState('5000');

  const insurers = state.users.filter((u) => u.role === 'insurer' && u.status === 'active');
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>(
    insurers[0]?.id ?? 'insurer-suraksha',
  );
  const [coverageInput, setCoverageInput] = useState('120000');
  const [claimKind, setClaimKind] = useState<'illness' | 'death'>('illness');
  const [claimAmount, setClaimAmount] = useState('25000');
  const [claimDesc, setClaimDesc] = useState(
    'Acute fever verified by collar telemetry and treated by veterinarian.',
  );
  const [claimPhoto, setClaimPhoto] = useState(true);
  const [claimLocation, setClaimLocation] = useState(true);

  // Marketplace state
  const [deliveryAddress, setDeliveryAddress] = useState(
    'শাহজাদপুর ডেইরি ক্লাস্টার, সিরাজগঞ্জ',
  );

  const activeAnimal =
    myAnimals.find((a) => a.id === selectedAnimalId) ?? myAnimals[0];
  const activeDevice = activeAnimal
    ? state.devices.find((d) => d.animalId === activeAnimal.id)
    : undefined;
  const activeAnimalRecords = activeAnimal
    ? state.records.filter((r) => r.animalId === activeAnimal.id)
    : [];

  const dailyVitals = useMemo(() => {
    const readings = activeDevice?.readings ?? [];
    const byDay = new Map<
      string,
      { day: string; temp: number; hr: number; act: number; count: number }
    >();
    for (const r of readings) {
      const dayKey = r.at.slice(0, 10);
      const prev = byDay.get(dayKey);
      if (!prev) {
        byDay.set(dayKey, {
          day: dayKey,
          temp: r.temperature,
          hr: r.heartRate,
          act: r.activity,
          count: 1,
        });
      } else {
        prev.temp += r.temperature;
        prev.hr += r.heartRate;
        prev.act += r.activity;
        prev.count += 1;
      }
    }
    return Array.from(byDay.values())
      .slice(0, 7)
      .map((d) => ({
        day: d.day,
        temperature: Number((d.temp / d.count).toFixed(1)),
        heartRate: Math.round(d.hr / d.count),
        activity: Math.round(d.act / d.count),
      }));
  }, [activeDevice]);

  const filteredVets = vets.filter((v) => {
    if (speciesFilter === 'all') return true;
    const spec = (v.specialty ?? '').toLowerCase();
    return speciesFilter === 'goat'
      ? spec.includes('goat') || spec.includes('sheep')
      : spec.includes('cattle') || spec.includes('dairy') || !spec.includes('goat');
  });

  const activeLoanQuote = activeAnimal ? demoLoanQuote(activeAnimal) : null;
  const annualRate = activeLoanQuote?.annualRate ?? 9;
  const estMonthlyInstallment = (() => {
    const amt = Math.max(1000, Number(loanAmount) || 50000);
    const months = Math.max(3, Number(loanTerm) || 12);
    const rate = annualRate;
    return Math.ceil((amt * (1 + (rate / 100) * (months / 12))) / months);
  })();

  const myCart = user ? state.carts[user.id] ?? [] : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Farmer Top KPI & Mobile Parity Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('আমার প্রাণী সংখ্যা', 'Registered Herd')}
          value={myAnimals.length}
          hint={t('ডিজিটাল স্বাস্থ্য পাসপোর্টসহ', 'With digital health passports')}
          tone="brand"
          icon="paw"
        />
        <KpiCard
          label={t('খোলা স্বাস্থ্য সতর্কতা', 'Open Health Alerts')}
          value={myAlerts.filter((a) => ['open', 'escalated'].includes(a.status)).length}
          hint={t(
            `${myAlerts.filter((a) => a.status !== 'resolved').length}টি অমীমাংসিত · ২৪/৭ আইওটি পর্যবেক্ষণ`,
            `${myAlerts.filter((a) => a.status !== 'resolved').length} unresolved · 24/7 IoT monitoring`,
          )}
          tone={
            myAlerts.some((a) => ['open', 'escalated'].includes(a.status)) ? 'danger' : 'success'
          }
          icon="radio"
        />
        <KpiCard
          label={t('পালিতো ওয়ালেট ব্যালেন্স', 'Palito Wallet Balance')}
          value={money(walletBalance)}
          hint={t('ঋণ বিতরণ, কিস্তি ও পেআউট', 'Loans, repayments & payouts')}
          tone="success"
          icon="wallet"
        />
        <KpiCard
          label={t('সক্রিয় ঋণ ও বীমা পলিসি', 'Active Loans & Policies')}
          value={`${myLoans.filter((l) => ['submitted', 'offered', 'approved', 'active'].includes(l.status)).length} / ${myPolicies.filter((p) => ['submitted', 'active'].includes(p.status)).length}`}
          hint={t('৭০% জামানত ঋণ ও সুরক্ষা', '70% LTV credit & livestock cover')}
          tone="info"
          icon="shield-check"
        />
      </div>

      {/* SECTION 1: OVERVIEW */}
      {section === 'home' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card tinted className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge tone="brand">{t('২৪/৭ সক্রিয় সেবা', '24/7 Active Care')}</Badge>
                <h2 className="text-lg font-bold text-[#0A401E] mt-1">
                  {t(
                    'মোবাইল ও ওয়েব — উভয় মাধ্যমেই সম্পূর্ণ খামার ব্যবস্থাপনা',
                    'Complete Farm, Veterinary & Financial Workflows in Your Browser',
                  )}
                </h2>
                <p className="text-xs text-[#0F602D] mt-0.5">
                  {t(
                    'প্রাণী নিবন্ধন, কলার ভাইটালস, জরুরি ভেট বুকিং, AI স্ক্যান, ৭০% জামানত ঋণ এবং বীমা দাবি এখান থেকেই সম্পন্ন করুন।',
                    'Register animals, pair collars, dispatch emergency vets, run AI scans, apply for 70% LTV loans, and file insurance claims right here.',
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  icon="phone"
                  onClick={() => router.push(webHref('farmer', 'care'))}
                >
                  {t('জরুরি ভেট কল', 'Emergency Vet')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon="scan"
                  onClick={() => router.push(webHref('farmer', 'ai'))}
                >
                  {t('AI লক্ষণ স্ক্যান', 'AI Symptom Scan')}
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t('আমার প্রাণী তালিকা (স্বাস্থ্য পাসপোর্ট)', 'My Herd & Health Passports')}
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  onClick={() => router.push(webHref('farmer', 'animals'))}
                >
                  {t('প্রাণী যোগ / সম্পাদনা', 'Manage Animals')}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myAnimals.map((animal) => {
                  const insured = myPolicies.some(
                    (p) => p.animalId === animal.id && p.status === 'active',
                  );
                  const pledged = myLoans.some(
                    (l) =>
                      l.animalId === animal.id &&
                      ['submitted', 'approved', 'active'].includes(l.status),
                  );
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => {
                        router.push(webHref('farmer', 'animals', animal.id));
                      }}
                      className="rounded-[14px] border border-[#E2E8F0] bg-white p-3.5 text-left hover:border-[#15803D] transition-colors cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Image
                unoptimized
                width={44}
                height={44}
                            src="/images/cow.jpg"
                            alt={animal.name}
                            className="w-11 h-11 rounded-[10px] object-cover"
                          />
                          <div>
                            <div className="text-sm font-bold text-[#1F2937]">
                              {animal.name} ({animal.tag})
                            </div>
                            <div className="text-xs text-[#64748B] tabular-nums">
                              {animal.breed} · {animal.weightKg} kg
                            </div>
                          </div>
                        </div>
                        <Badge tone={toneForStatus(animal.status)}>{animal.status}</Badge>
                      </div>
                      <HealthScoreBar score={animal.healthScore} />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge tone="neutral">{money(animal.value)}</Badge>
                        {insured ? (
                          <Badge tone="success">{t('বীমাকৃত', 'Insured')}</Badge>
                        ) : null}
                        {pledged ? (
                          <Badge tone="info">{t('জামানতকৃত', 'Pledged')}</Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Active Vets Portrait Rail */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t('যাচাইকৃত পশুচিকিৎসক প্যানেল', 'Verified Veterinarians')}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => router.push(webHref('farmer', 'care'))}>
                  {t('সাক্ষাৎ বুক করুন', 'Book Visit')}
                </Button>
              </div>
              <div className="flex flex-col gap-2.5">
                {vets.map((v, idx) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E2E8F0] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                unoptimized
                width={44}
                height={44}
                        src={`/images/vet-avatar-${(idx % 5) + 1}.${idx === 0 ? 'png' : 'jpg'}`}
                        alt={v.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#D8E9DE]"
                      />
                      <div>
                        <div className="text-sm font-bold text-[#1F2937]">
                          {locale === 'bn' ? v.nameBn : v.name}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {v.specialty} · {v.district}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        router.push(webHref('farmer', 'care'));
                      }}
                    >
                      {money(v.fee ?? 500)}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Alerts & Reminders */}
            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('সাম্প্রতিক সতর্কতা ও ওষুধের রিমাইন্ডার', 'Recent Alerts & Dose Reminders')}
              </h3>
              {myAlerts.slice(0, 2).map((al) => (
                <div
                  key={al.id}
                  className="rounded-[10px] border border-[#FECDD3] bg-[#FFF1F2] p-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-[#BE123C]">
                      {al.title[locale]}
                    </div>
                    <div className="text-xs text-[#9F1239]">{al.message[locale]}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(webHref('farmer', 'devices'))}
                  >
                    {t('দেখুন', 'Inspect')}
                  </Button>
                </div>
              ))}
              {myReminders.slice(0, 2).map((rem) => (
                <div
                  key={rem.id}
                  className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-center justify-between gap-2"
                >
                  <div className="text-xs">
                    <strong className="text-[#1F2937]">{rem.medicine}</strong> ·{' '}
                    <span className="text-[#64748B] tabular-nums">{rem.time}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void run({ type: 'reminder.take', reminderId: rem.id })}
                  >
                    {t('ডোজ সম্পন্ন', 'Log Dose')}
                  </Button>
                </div>
              ))}
            </Card>
          </div>
        </div>
      ) : null}

      {/* SECTION 2: ANIMALS & DIGITAL HEALTH PASSPORT */}
      {section === 'animals' ? (
        <SplitWorkbench
          masterTitle={t('আমার প্রাণী ও নিবন্ধন', 'My Animals & Registration')}
          masterCount={myAnimals.length}
          masterList={
            <div className="flex flex-col gap-3">
              {myAnimals.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setSelectedAnimalId(animal.id)}
                  className={`w-full rounded-[12px] border p-3.5 text-left cursor-pointer ${
                    activeAnimal?.id === animal.id
                      ? 'border-[#15803D] bg-[#EBF4EE]/60'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F2937]">
                      {animal.name} ({animal.tag})
                    </span>
                    <Badge tone={toneForStatus(animal.status)}>{animal.status}</Badge>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                    {animal.breed} · {animal.weightKg} kg · {money(animal.value)}
                  </div>
                </button>
              ))}

              {/* Register New Animal Form */}
              <div className="border-t border-[#E2E8F0] pt-4 mt-2 flex flex-col gap-3">
                <div className="text-sm font-bold text-[#1F2937]">
                  {t('নতুন প্রাণী নিবন্ধন করুন', 'Register New Animal')}
                </div>
                <Field
                  label={t('প্রাণীর নাম', 'Animal Name')}
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    label={t('প্রজাতি', 'Species')}
                    value={animalSpecies}
                    onChange={(e) => setAnimalSpecies(e.target.value as Animal['species'])}
                    options={[
                      { value: 'cattle', label: t('গরু (Cattle)', 'Cattle') },
                      { value: 'goat', label: t('ছাগল (Goat)', 'Goat') },
                      { value: 'buffalo', label: t('মহিষ (Buffalo)', 'Buffalo') },
                    ]}
                  />
                  <SelectField
                    label={t('লিঙ্গ', 'Sex')}
                    value={animalSex}
                    onChange={(e) => setAnimalSex(e.target.value as Animal['sex'])}
                    options={[
                      { value: 'female', label: t('মাদী (Female)', 'Female') },
                      { value: 'male', label: t('মর্দা (Male)', 'Male') },
                    ]}
                  />
                </div>
                <Field
                  label={t('জাত (Breed)', 'Breed')}
                  value={animalBreed}
                  onChange={(e) => setAnimalBreed(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label={t('জন্ম তারিখ', 'Birth Date')}
                    value={animalBirth}
                    onChange={(e) => setAnimalBirth(e.target.value)}
                  />
                  <Field
                    label={t('ওজন (কেজি)', 'Weight (kg)')}
                    type="number"
                    value={animalWeight}
                    onChange={(e) => setAnimalWeight(e.target.value)}
                  />
                  <Field
                    label={t('মূল্য (৳)', 'Value (BDT)')}
                    type="number"
                    value={animalValue}
                    onChange={(e) => setAnimalValue(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  icon="plus"
                  disabled={busy}
                  onClick={() =>
                    void run({
                      type: 'animal.add',
                      animal: {
                        name: animalName,
                        species: animalSpecies,
                        breed: animalBreed,
                        sex: animalSex,
                        birthDate: animalBirth,
                        weightKg: Math.max(10, Number(animalWeight) || 250),
                        value: Math.max(5000, Number(animalValue) || 100000),
                      },
                    })
                  }
                >
                  {t('প্রাণী যুক্ত করুন', 'Add Animal to Herd')}
                </Button>
              </div>
            </div>
          }
          detailPane={
            !activeAnimal ? (
              <EmptyWorkspaceState
                title={t('কোনো প্রাণী নির্বাচন করা হয়নি', 'No animal selected')}
                description={t('বাম দিকের তালিকা থেকে প্রাণী নির্বাচন করুন।', 'Select an animal from your herd.')}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center gap-4">
                      <Image
                unoptimized
                width={64}
                height={64}
                        src="/images/cow.jpg"
                        alt={activeAnimal.name}
                        className="w-16 h-16 rounded-[14px] object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-[#1F2937]">
                            {activeAnimal.name} ({activeAnimal.tag})
                          </h3>
                          <Badge tone={toneForStatus(activeAnimal.status)}>
                            {activeAnimal.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                          {activeAnimal.breed} · {activeAnimal.weightKg} kg ·{' '}
                          {t('মূল্যায়ন:', 'Valuation:')} {money(activeAnimal.value)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="smartphone"
                        onClick={() =>
                          openMobileHandoff({
                            role: 'farmer',
                            screen: 'animal',
                            id: activeAnimal.id,
                            title: `${activeAnimal.name} (${activeAnimal.tag})`,
                          })
                        }
                      >
                        {t('মোবাইল পাসপোর্ট QR', 'Mobile Passport QR')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'animal.update',
                            animalId: activeAnimal.id,
                            animal: { weightKg: activeAnimal.weightKg + 5 },
                          })
                        }
                      >
                        {t('+৫ কেজি ওজন হালনাগাদ', '+5 kg Weight Update')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'animal.archive',
                            animalId: activeAnimal.id,
                          })
                        }
                      >
                        {t('বিক্রয়/আর্কাইভ', 'Archive')}
                      </Button>
                    </div>
                  </div>

                  {/* Figma 3-Tab Underline Bar: Overview | Records | Gallery */}
                  <TabsBar
                    ariaLabel={t('প্রাণী পাসপোর্ট ট্যাব', 'Animal passport tabs')}
                    active={passportSubTab}
                    onChange={setPassportSubTab}
                    tabs={[
                      { id: 'overview', label: t('ওভারভিউ ও পূর্বাভাস', 'Overview & Forecast') },
                      {
                        id: 'records',
                        label: t('টিকা ও চিকিৎসা রেকর্ড', 'Health & Vaccination Records'),
                        count: activeAnimalRecords.length,
                      },
                      { id: 'gallery', label: t('গ্যালারি ও পরিচয়', 'Photo Gallery') },
                    ]}
                  />

                  {passportSubTab === 'overview' ? (
                    <div className="flex flex-col gap-4">
                      <HealthScoreBar
                        score={activeAnimal.healthScore}
                        label={t('যাচাইকৃত স্বাস্থ্য স্কোর', 'Verified Health Passport Score')}
                      />

                      {/* AI Health Forecast Card */}
                      <div className="rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/70 p-4 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#0A401E]">
                            {t(
                              'এআই স্বাস্থ্য ও উৎপাদন পূর্বাভাস',
                              'AI Biometric & Lactation Health Forecast',
                            )}
                          </span>
                          <Badge tone="brand">
                            {t('৭ দিনের বিশ্লেষণ', '7-Day Telemetry')}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#0F602D]">
                          {activeAnimal.healthScore >= 80
                            ? t(
                                'রুমিনেশন ও তাপমাত্রা স্বাভাবিক সীমার মধ্যে রয়েছে। আগামী ১৪ দিনে দুগ্ধ উৎপাদন স্থিতিশীল থাকার সম্ভাবনা বেশি।',
                                'Rumination and collar temperature remain within normal reference limits. Stable milk yield projected over the next 14 days.',
                              )
                            : t(
                                'তাপমাত্রা ও সক্রিয়তার তারতম্য দেখা গেছে। দ্রুত পশুচিকিৎসকের পরামর্শ ও ইলেকট্রোলাইট প্রদানের সুপারিশ করা হচ্ছে।',
                                'Elevated temperature and reduced activity detected. Immediate veterinary consultation and electrolyte supplementation advised.',
                              )}
                        </p>
                      </div>

                      {/* Full Animal Profile Update Form (animal.update) */}
                      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col gap-3">
                        <div className="text-sm font-bold text-[#1F2937]">
                          {t('প্রাণীর তথ্য সম্পাদনা করুন (animal.update)', 'Edit Selected Animal Profile')}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <Field
                            label={t('নাম', 'Name')}
                            value={editAnimalName || activeAnimal.name}
                            onChange={(e) => setEditAnimalName(e.target.value)}
                          />
                          <Field
                            label={t('জাত (Breed)', 'Breed')}
                            value={editAnimalBreed || activeAnimal.breed}
                            onChange={(e) => setEditAnimalBreed(e.target.value)}
                          />
                          <Field
                            label={t('ওজন (কেজি)', 'Weight (kg)')}
                            type="number"
                            value={editAnimalWeight || String(activeAnimal.weightKg)}
                            onChange={(e) => setEditAnimalWeight(e.target.value)}
                          />
                          <Field
                            label={t('বাজারমূল্য (৳)', 'Valuation (BDT)')}
                            type="number"
                            value={editAnimalValue || String(activeAnimal.value)}
                            onChange={(e) => setEditAnimalValue(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="check"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'animal.update',
                                animalId: activeAnimal.id,
                                animal: {
                                  name: (editAnimalName || activeAnimal.name).trim(),
                                  breed: (editAnimalBreed || activeAnimal.breed).trim(),
                                  weightKg: Math.max(
                                    5,
                                    Number(editAnimalWeight || activeAnimal.weightKg) ||
                                      activeAnimal.weightKg,
                                  ),
                                  value: Math.max(
                                    1000,
                                    Number(editAnimalValue || activeAnimal.value) ||
                                      activeAnimal.value,
                                  ),
                                },
                              })
                            }
                          >
                            {t('প্রাণীর তথ্য হালনাগাদ করুন', 'Save Animal Profile')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {passportSubTab === 'records' ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        {activeAnimalRecords.map((rec) => (
                          <div
                            key={rec.id}
                            className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="text-sm font-bold text-[#1F2937]">
                                {rec.title[locale]}
                              </div>
                              <div className="text-xs text-[#475569]">{rec.note}</div>
                              {rec.nextDueAt ? (
                                <div className="text-[11px] font-semibold text-[#0F602D] mt-0.5">
                                  {t('পরবর্তী তারিখ:', 'Next Due:')} {date(rec.nextDueAt)}
                                </div>
                              ) : null}
                            </div>
                            <div className="text-right shrink-0">
                              <Badge tone="brand">{rec.kind}</Badge>
                              <div className="text-[11px] text-[#64748B] mt-1 tabular-nums">
                                {date(rec.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
                        <div className="text-sm font-bold text-[#1F2937]">
                          {t(
                            'স্বাস্থ্য পর্যবেক্ষণ রেকর্ড যুক্ত করুন (ভ্যাকসিনেশন পশুচিকিৎসক কর্তৃক নিবন্ধিত হয়)',
                            'Log Owner Health Check Record (Vaccinations are logged by Veterinarians)',
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <SelectField
                            label={t('ধরন', 'Type')}
                            value={recKind}
                            onChange={(e) =>
                              setRecKind(e.target.value as HealthRecord['kind'])
                            }
                            options={[
                              { value: 'checkup', label: t('চেকআপ (Checkup)', 'Checkup') },
                              { value: 'registration', label: t('নিবন্ধন (Registration)', 'Registration') },
                            ]}
                          />
                          <Field
                            label={t('শিরোনাম (বাংলা)', 'Title (BN)')}
                            value={recTitleBn}
                            onChange={(e) => setRecTitleBn(e.target.value)}
                          />
                          <Field
                            label={t('শিরোনাম (EN)', 'Title (EN)')}
                            value={recTitleEn}
                            onChange={(e) => setRecTitleEn(e.target.value)}
                          />
                          <Field
                            label={t('পরবর্তী নির্ধারিত তারিখ (ঐচ্ছিক)', 'Next Due Date (Optional)')}
                            type="date"
                            value={recNextDueAt}
                            onChange={(e) => setRecNextDueAt(e.target.value)}
                          />
                        </div>
                        <Field
                          label={t('বিবরণ / নোট', 'Notes')}
                          value={recNote}
                          onChange={(e) => setRecNote(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            icon="plus"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'record.add',
                                animalId: activeAnimal.id,
                                kind: recKind,
                                title: { bn: recTitleBn, en: recTitleEn },
                                note: recNote,
                                nextDueAt: recNextDueAt.trim() || undefined,
                              })
                            }
                          >
                            {t('রেকর্ড সংরক্ষণ করুন', 'Save Record')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {passportSubTab === 'gallery' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { src: '/images/cow.jpg', caption: t('প্রাণী প্রোফাইল ও ইয়ার-ট্যাগ', 'Primary Ear-Tag ID Photo') },
                        { src: '/images/article-cattle.jpg', caption: t('খামার শেড পরিদর্শন', 'Shed & Posture Verification') },
                        { src: '/images/article-farm.jpg', caption: t('চারণ ও স্বাস্থ্য পরীক্ষা', 'Field Grazing Inspection') },
                      ].map((img, i) => (
                        <div
                          key={i}
                          className="rounded-[12px] border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]"
                        >
                          <Image
                unoptimized
                width={320}
                height={320}
                            src={img.src}
                            alt={img.caption}
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-2.5 text-xs font-medium text-[#475569]">
                            {img.caption}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </div>
            )
          }
        />
      ) : null}

      {/* SECTION 3: IOT DEVICES, 7-DAY VITALS & ALERTS */}
      {section === 'devices' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('আইওটি কলার পেয়ারিং ও সংযোগ', 'IoT Collar Pairing & Status')}
              </h3>
              <SelectField
                label={t('প্রাণী নির্বাচন করুন', 'Select Animal')}
                value={activeAnimal?.id ?? ''}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                options={myAnimals.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.tag})`,
                }))}
              />
              {activeDevice ? (
                <div className="rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/60 p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0A401E] tabular-nums">
                      Serial: {activeDevice.serial}
                    </span>
                    <Badge tone={activeDevice.connected ? 'success' : 'danger'}>
                      {activeDevice.connected
                        ? t('সংযুক্ত', 'Connected')
                        : t('বিচ্ছিন্ন', 'Disconnected')}
                    </Badge>
                  </div>
                  <div className="text-xs text-[#0F602D] tabular-nums">
                    {t('ব্যাটারি:', 'Battery:')} {activeDevice.battery}% ·{' '}
                    {t('সর্বশেষ সিঙ্ক:', 'Last Seen:')} {dateTime(activeDevice.lastSeenAt)}
                  </div>
                  {activeDevice.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run({
                          type: 'device.disconnect',
                          deviceId: activeDevice.id,
                        })
                      }
                    >
                      {t('কলার সংযোগ বিচ্ছিন্ন করুন', 'Disconnect Collar')}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                <Field
                  label={t('কলার সিরিয়াল নম্বর', 'Collar Serial Number')}
                  value={collarSerial}
                  onChange={(e) => setCollarSerial(e.target.value)}
                />
                <Button
                  variant="primary"
                  icon="radio"
                  disabled={busy || !activeAnimal}
                  onClick={() =>
                    activeAnimal &&
                    void run({
                      type: 'device.connect',
                      animalId: activeAnimal.id,
                      serial: collarSerial,
                    })
                  }
                >
                  {t('কলার পেয়ার করুন', 'Pair Collar')}
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('স্বাস্থ্য সতর্কতা পরীক্ষা ও অ্যাকনলেজমেন্ট', 'Health Alerts & Anomaly Check')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label={t('সতর্কতার ধরন', 'Alert Type')}
                  value={simKind}
                  onChange={(e) => setSimKind(e.target.value as HealthAlert['kind'])}
                  options={[
                    { value: 'temperature', label: t('উচ্চ তাপমাত্রা', 'Fever / Temp') },
                    { value: 'heart_rate', label: t('হৃদস্পন্দন', 'Heart Rate') },
                    { value: 'inactivity', label: t('নিষ্ক্রিয়তা', 'Inactivity') },
                    { value: 'disconnected', label: t('কলার সংযোগ বিচ্ছিন্ন', 'Collar Disconnected') },
                    { value: 'emergency', label: t('জরুরি অসুস্থতা (Emergency)', 'Acute Emergency') },
                  ]}
                />
                <SelectField
                  label={t('তীব্রতা', 'Severity')}
                  value={simSeverity}
                  onChange={(e) => setSimSeverity(e.target.value as Severity)}
                  options={[
                    { value: 'critical', label: 'Critical' },
                    { value: 'warning', label: 'Warning' },
                  ]}
                />
              </div>
              <Button
                variant="secondary"
                icon="alert"
                disabled={busy || !activeAnimal}
                onClick={() =>
                  activeAnimal &&
                  void run({
                    type: 'alert.simulate',
                    animalId: activeAnimal.id,
                    kind: simKind,
                    severity: simSeverity,
                  })
                }
              >
                {t('নতুন সতর্কতা তৈরি করুন', 'Log Biometric Alert')}
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t(
                    '৭-দিনের দৈনিক ভাইটালস ও আদর্শ ক্লিনিক্যাল সীমা',
                    '7-Day Daily Vitals & Clinical Reference Ranges',
                  )}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#0F602D]">
                  <span className="rounded bg-[#EBF4EE] px-2 py-0.5">
                    {t('তাপমাত্রা: ৩৮.০–৩৯.০°সে', 'Temp: 38.0–39.0°C')}
                  </span>
                  <span className="rounded bg-[#EBF4EE] px-2 py-0.5">
                    {t('হৃদস্পন্দন: ৬০–৮০ /মিনিট', 'HR: 60–80 bpm')}
                  </span>
                  <span className="rounded bg-[#EBF4EE] px-2 py-0.5">
                    {t('সক্রিয়তা: ৭০%+', 'Activity: 70%+')}
                  </span>
                </div>
              </div>

              {!activeDevice?.connected ||
              (activeDevice &&
                Date.parse(state.now) - Date.parse(activeDevice.lastSeenAt) >
                  4 * 3_600_000) ? (
                <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs font-semibold text-[#92400E]">
                  {t(
                    'সতর্কতা: আইওটি কলার অফলাইন বা দীর্ঘ সময় সিঙ্ক হয়নি (Stale Telemetry)। কলার সংযোগ ও ব্যাটারি পরীক্ষা করুন।',
                    'Warning: IoT collar is disconnected or telemetry is stale (>4h since last sync). Check collar battery and pairing.',
                  )}
                </div>
              ) : null}

              {activeAnimal?.productionDrop ? (
                <div className="rounded-[10px] border border-[#FECDD3] bg-[#FFF1F2] p-3 text-xs font-semibold text-[#BE123C]">
                  {t(
                    'দুধ উৎপাদন হ্রাস শনাক্ত হয়েছে: ব্যাংক কিস্তি বিরতি ও জরুরি চিকিৎসার জন্য উপযুক্ত।',
                    'Verified Milk Yield Drop Detected: Eligible for bank loan grace period and priority care.',
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {dailyVitals.map((v) => (
                  <div
                    key={v.day}
                    className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs tabular-nums"
                  >
                    <div className="text-[#64748B] font-semibold">{v.day.slice(5)}</div>
                    <div className="text-base font-bold text-[#15803D] mt-1">
                      {v.temperature}°C
                    </div>
                    <div className="text-[#475569] mt-0.5">{v.heartRate} bpm</div>
                    <div className="text-[#0F602D] font-semibold">{v.activity}% act</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('সক্রিয় সতর্কতা তালিকা', 'Active Herd Alerts')} ({myAlerts.length})
              </h3>
              {myAlerts.map((al) => {
                const an = myAnimals.find((a) => a.id === al.animalId);
                const highlighted = id === al.id;
                return (
                  <div
                    key={al.id}
                    className={`rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-wrap items-center justify-between gap-3 ${
                      highlighted ? 'ring-2 ring-[#15803D] bg-[#EBF4EE]/30' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1F2937]">
                          {an?.name} ({an?.tag}) — {al.title[locale]}
                        </span>
                        <Badge tone={toneForStatus(al.status)}>{al.status}</Badge>
                      </div>
                      <p className="text-xs text-[#475569] mt-0.5">{al.message[locale]}</p>
                      <span className="text-[11px] text-[#64748B] tabular-nums">
                        {dateTime(al.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['open', 'escalated'].includes(al.status) ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({ type: 'alert.acknowledge', alertId: al.id })
                          }
                        >
                          {t('সতর্কতা গ্রহণ করুন', 'Acknowledge')}
                        </Button>
                      ) : null}
                      {al.kind === 'emergency' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(webHref('farmer', 'wallet'))}
                        >
                          {t('জরুরি চিকিৎসা ঋণ', 'Emergency Medical Loan Options')}
                        </Button>
                      ) : null}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          router.push(webHref('farmer', 'care', al.id));
                        }}
                      >
                        {t('ভেট বুক করুন', 'Book Vet')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      ) : null}

      {/* SECTION 4: VET CARE, EMERGENCY DISPATCH, PRESCRIPTIONS & REMINDERS */}
      {section === 'care' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t('পশুচিকিৎসক নির্বাচন ও সাক্ষাৎ বুকিং', 'Veterinarian Discovery & Booking')}
                </h3>
                <div className="flex gap-1.5">
                  {(['all', 'cattle', 'goat'] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSpeciesFilter(sp)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                        speciesFilter === sp
                          ? 'bg-[#15803D] text-white'
                          : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
                      }`}
                    >
                      {sp === 'all'
                        ? t('সব বিশেষজ্ঞ', 'All')
                        : sp === 'cattle'
                          ? t('গরু ও ডেইরি', 'Cattle & Dairy')
                          : t('ছাগল ও ভেড়া', 'Goat & Sheep')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredVets.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVetId(v.id)}
                    className={`rounded-[12px] border p-3.5 text-left cursor-pointer flex items-center justify-between ${
                      selectedVetId === v.id
                        ? 'border-[#15803D] bg-[#EBF4EE]/60'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1F2937]">
                        {locale === 'bn' ? v.nameBn : v.name}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {v.specialty} · {v.district} · ⭐ {v.rating ?? 4.9}
                      </div>
                    </div>
                    <Badge tone="brand">{money(v.fee ?? 500)}</Badge>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label={t('প্রাণী নির্বাচন', 'Animal')}
                  value={activeAnimal?.id ?? ''}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  options={myAnimals.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${a.tag})`,
                  }))}
                />
                <SelectField
                  label={t('পরামর্শের মাধ্যম', 'Consultation Mode')}
                  value={apptMode}
                  onChange={(e) => setApptMode(e.target.value as 'video' | 'visit')}
                  options={[
                    { value: 'video', label: t('ভিডিও কল (Video)', 'Video Call') },
                    { value: 'visit', label: t('খামার পরিদর্শন (Visit)', 'Farm Visit') },
                  ]}
                />
                <SelectField
                  label={t('অগ্রাধিকার', 'Priority')}
                  value={apptPriority}
                  onChange={(e) =>
                    setApptPriority(
                      e.target.value as 'routine' | 'urgent' | 'emergency',
                    )
                  }
                  options={[
                    { value: 'routine', label: t('নিয়মিত (Routine)', 'Routine') },
                    { value: 'urgent', label: t('জরুরি (Urgent)', 'Urgent') },
                    { value: 'emergency', label: t('তাৎক্ষণিক জরুরি (Emergency)', 'Emergency') },
                  ]}
                />
                <SelectField
                  label={t('পেমেন্ট মাধ্যম', 'Payment Method')}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'wallet', label: 'Palito Wallet' },
                    { value: 'bkash', label: 'bKash' },
                    { value: 'nagad', label: 'Nagad' },
                    { value: 'card', label: 'Debit / Credit Card' },
                  ]}
                />
              </div>

              <TextareaField
                label={t('রোগের লক্ষণ ও বিবরণ', 'Symptoms & Reason')}
                value={apptReason}
                onChange={(e) => setApptReason(e.target.value)}
              />

              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="primary"
                  icon="calendar"
                  disabled={busy || !activeAnimal || !selectedVetId}
                  onClick={() => {
                    if (!activeAnimal) return;
                    const linkedAlertId =
                      selectedAlertId ||
                      myAlerts.find(
                        (a) =>
                          a.animalId === activeAnimal.id &&
                          ['open', 'escalated', 'acknowledged'].includes(a.status) &&
                          !a.appointmentId,
                      )?.id;
                    void run({
                      type: 'appointment.book',
                      animalId: activeAnimal.id,
                      vetId: selectedVetId,
                      alertId: linkedAlertId,
                      scheduledAt: new Date(Date.parse(state.now) + 3_600_000).toISOString(),
                      mode: apptMode,
                      priority: apptPriority,
                      reason: apptReason,
                    });
                  }}
                >
                  {t('সাক্ষাৎ বুক করুন', 'Confirm Appointment')}
                </Button>
                <Button
                  variant="danger"
                  icon="phone"
                  disabled={busy || !activeAnimal || !selectedVetId}
                  onClick={async () => {
                    if (!activeAnimal) return;
                    const existingEmergency = myAlerts.find(
                      (a) =>
                        a.animalId === activeAnimal.id &&
                        a.kind === 'emergency' &&
                        a.status !== 'resolved',
                    );
                    if (!existingEmergency) {
                      await run({
                        type: 'alert.simulate',
                        animalId: activeAnimal.id,
                        kind: 'emergency',
                        severity: 'critical',
                      });
                    }
                    await run({
                      type: 'appointment.book',
                      animalId: activeAnimal.id,
                      vetId: selectedVetId,
                      alertId: existingEmergency?.id,
                      scheduledAt: state.now,
                      mode: 'video',
                      priority: 'emergency',
                      reason: 'Emergency dispatch notice: acute distress & fever',
                    });
                  }}
                >
                  {t('১-ক্লিক জরুরি ভেট ডিসপ্যাচ', '1-Click Emergency Dispatch')}
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('আমার অ্যাপয়েন্টমেন্ট ও টেলিমেডিসিন রুম', 'My Appointments & Telemedicine Room')} ({myAppointments.length})
              </h3>
              {myAppointments.map((appt) => {
                const an = myAnimals.find((a) => a.id === appt.animalId);
                const receipt = myPayments.find((p) => p.referenceId === appt.id);
                return (
                  <div
                    key={appt.id}
                    className="rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-col gap-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1F2937]">
                            {an?.name} ({an?.tag})
                          </span>
                          <Badge tone={toneForStatus(appt.status)}>{appt.status}</Badge>
                          {receipt ? (
                            <Badge tone="success">
                              {t('ফি পরিশোধিত', 'Fee Paid')} ({receipt.id})
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-xs text-[#64748B] tabular-nums">
                          {dateTime(appt.scheduledAt)} · {appt.mode}
                        </div>
                      </div>
                      {['requested', 'accepted'].includes(appt.status) ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'appointment.reschedule',
                                appointmentId: appt.id,
                                scheduledAt: new Date(
                                  Date.parse(appt.scheduledAt) + 86_400_000,
                                ).toISOString(),
                              })
                            }
                          >
                            {t('সময় পরিবর্তন', 'Reschedule')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'appointment.cancel',
                                appointmentId: appt.id,
                                reason: 'Cancelled by farmer',
                              })
                            }
                          >
                            {t('বাতিল', 'Cancel')}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    {['accepted', 'in_progress'].includes(appt.status) ? (
                      <div className="rounded-[10px] border border-[#D8E9DE] bg-[#EBF4EE]/65 p-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-[#0A401E]">
                          <strong className="block">
                            {callEnded
                              ? t('টেলিমেডিসিন কল বিরতিতে রয়েছে', 'Telemedicine Call Paused')
                              : t('লাইভ টেলিমেডিসিন কনসালটেশন রুম সক্রিয়', 'Live Telemedicine Room Connected')}
                          </strong>
                          <span>
                            {micMuted
                              ? t('মাইক্রোফোন মিউট করা আছে', 'Microphone Muted')
                              : t('অডিও ও কলার টেলিমেট্রি স্ট্রিম সক্রিয়', 'Audio & live collar telemetry stream active')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMicMuted((m) => !m)}
                          >
                            {micMuted ? t('আনমিউট করুন', 'Unmute Mic') : t('মিউট করুন', 'Mute Mic')}
                          </Button>
                          <Button
                            variant={callEnded ? 'primary' : 'danger'}
                            size="sm"
                            onClick={() => setCallEnded((c) => !c)}
                          >
                            {callEnded ? t('পুনরায় যুক্ত হোন', 'Reconnect Call') : t('কল শেষ করুন', 'End Call')}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </Card>

            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('ডিজিটাল প্রেসক্রিপশন, টিকা ও ওষুধ রিমাইন্ডার', 'Prescriptions, Upcoming Checkups & Medication Reminders')}
              </h3>
              {state.records
                .filter((r) => myAnimalIds.has(r.animalId) && Boolean(r.nextDueAt))
                .map((dueRec) => {
                  const dueAnimal = myAnimals.find((a) => a.id === dueRec.animalId);
                  return (
                    <div
                      key={dueRec.id}
                      className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#92400E]">
                          {dueAnimal?.name}: {dueRec.title[locale]}
                        </span>
                      </div>
                      <Badge tone="warning">
                        {t('পরবর্তী তারিখ:', 'Due:')} {date(dueRec.nextDueAt!)}
                      </Badge>
                    </div>
                  );
                })}
              {myPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-3.5 text-xs flex flex-col gap-1"
                >
                  <div className="font-bold text-sm text-[#0A401E]">{rx.diagnosis}</div>
                  <div className="text-[#0F602D]">{rx.advice}</div>
                  <div className="text-[#475569] mt-1">
                    {rx.medicines
                      .map((m) => `${m.name} (${m.dose}, ${m.frequency}, ${m.days}d)`)
                      .join(' · ')}
                  </div>
                </div>
              ))}

              {myReminders.map((rem) => {
                const isSkipped = skippedIds.includes(rem.id);
                return (
                  <div
                    key={rem.id}
                    className="rounded-[10px] border border-[#E2E8F0] p-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1F2937]">
                        {rem.medicine}
                      </div>
                      <div className="text-xs text-[#64748B] tabular-nums">
                        {rem.time} · {rem.takenDates.length} {t('বার গৃহীত', 'doses logged')}
                        {isSkipped ? ` · ${t('আজ বাদ দেওয়া হয়েছে', 'Skipped today')}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({ type: 'reminder.take', reminderId: rem.id })
                        }
                      >
                        {t('ডোজ দিন', 'Take Dose')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSkippedIds((prev) =>
                            prev.includes(rem.id) ? prev : [...prev, rem.id],
                          )
                        }
                      >
                        {t('আজকের ডোজ বাদ দিন', 'Skip today')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'reminder.toggle',
                            reminderId: rem.id,
                            enabled: !rem.enabled,
                          })
                        }
                      >
                        {rem.enabled ? t('চালু', 'On') : t('বন্ধ', 'Off')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      ) : null}

      {/* SECTION 5: AI TEXT / PHOTO / VOICE SCAN */}
      {section === 'ai' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('পালিতো AI লক্ষণ, ছবি ও ভয়েস পরামর্শক', 'Palito AI Symptom, Photo & Voice Advisor')}
              </h3>
              <Badge tone="brand">24/7 Active</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['text', 'photo', 'voice'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAiMode(m)}
                  className={`rounded-[10px] border py-2 text-xs font-bold cursor-pointer ${
                    aiMode === m
                      ? 'border-[#15803D] bg-[#EBF4EE] text-[#0F602D]'
                      : 'border-[#E2E8F0] bg-white text-[#475569]'
                  }`}
                >
                  {m === 'text'
                    ? t('টেক্সট প্রশ্ন', 'Text Query')
                    : m === 'photo'
                      ? t('ছবি স্ক্যান', 'Photo Scan')
                      : t('ভয়েস বার্তা', 'Voice Note')}
                </button>
              ))}
            </div>

            <TextareaField
              label={t(
                'প্রাণীর লক্ষণ বা ছবির বিবরণ লিখুন',
                'Describe symptoms, photo findings, or voice question',
              )}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                icon="scan"
                disabled={busy || !aiPrompt.trim()}
                onClick={() =>
                  void run({ type: 'ai.ask', text: aiPrompt, mode: aiMode })
                }
              >
                {t('AI বিশ্লেষণ চালান', 'Run AI Assessment')}
              </Button>
              <Button
                variant="outline"
                icon="smartphone"
                onClick={() =>
                  openMobileHandoff({
                    role: 'farmer',
                    screen: 'ai',
                    title: t('মোবাইল ক্যামেরা ও ভয়েস স্ক্যান', 'Mobile Camera & Voice Scan'),
                  })
                }
              >
                {t('মোবাইল ক্যামেরায় খুলুন', 'Open Camera on Mobile')}
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-7 flex flex-col gap-3">
            <h3 className="text-base font-bold text-[#1F2937]">
              {t('AI পরামর্শ ও কথোপকথন ইতিহাস', 'AI Consultation History')}
            </h3>
            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
              {state.aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-[12px] p-3.5 text-sm ${
                    msg.role === 'assistant'
                      ? 'bg-[#EBF4EE] border border-[#D8E9DE] text-[#0A401E]'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1F2937]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>
                      {msg.role === 'assistant'
                        ? t('পালিতো AI পরামর্শক', 'Palito AI Advisor')
                        : t('খামারি', 'Farmer')}{' '}
                      ({msg.mode})
                    </span>
                    <span className="tabular-nums text-[#64748B]">
                      {dateTime(msg.at)}
                    </span>
                  </div>
                  <p>{msg.text[locale]}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {/* SECTION 6: WALLET, 70% LTV LOANS & INSURANCE */}
      {section === 'wallet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* 70% LTV Collateral Loan Calculator & Application */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t('৭০% জামানত কৃষি ঋণ আবেদন', '70% LTV Livestock Collateral Loan')}
                </h3>
                <Badge tone="brand">Max 70% Valuation</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label={t('জামানত প্রাণী নির্বাচন', 'Collateral Animal')}
                  value={activeAnimal?.id ?? ''}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  options={myAnimals.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${a.tag}) — Max ${money(maximumLoanAmount(a.value))}`,
                  }))}
                />
                <Field
                  label={t('আবেদনকৃত ঋণ (৳)', 'Loan Amount (BDT)')}
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  hint={
                    activeAnimal
                      ? `${t('সর্বোচ্চ ৭০% সীমা:', '70% LTV Cap:')} ${money(maximumLoanAmount(activeAnimal.value))}`
                      : undefined
                  }
                />
                <Field
                  label={t('মেয়াদ (মাস)', 'Term (Months)')}
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                />
                <Field
                  label={t('ঋণের উদ্দেশ্য', 'Purpose')}
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                />
              </div>

              {activeLoanQuote ? (
                <div className="rounded-[12px] bg-[#EBF4EE]/60 border border-[#D8E9DE] p-3.5 grid grid-cols-3 gap-2 text-xs tabular-nums">
                  <div>
                    <span className="text-[#64748B] block">{t('সর্বোচ্চ সীমা', '70% Cap')}</span>
                    <strong className="text-sm text-[#15803D]">
                      {money(activeLoanQuote.maximumAmount)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">{t('বার্ষিক সুদ', 'Annual Rate')}</span>
                    <strong className="text-sm text-[#1F2937]">
                      {activeLoanQuote.annualRate}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">{t('মাসিক কিস্তি', 'Monthly Installment')}</span>
                    <strong className="text-sm text-[#0F602D]">
                      {money(estMonthlyInstallment)}
                    </strong>
                  </div>
                </div>
              ) : null}

              <Button
                variant="primary"
                icon="landmark"
                disabled={busy || !activeAnimal}
                onClick={() =>
                  activeAnimal &&
                  void run({
                    type: 'loan.offer',
                    animalId: activeAnimal.id,
                    amount: Math.max(1000, Number(loanAmount) || 50000),
                    termMonths: Math.max(3, Number(loanTerm) || 12),
                    purpose: loanPurpose,
                    repaymentSource: loanRepaySource,
                  })
                }
              >
                {t('ঋণ প্রস্তাব তৈরি করুন', 'Generate Loan Offer')}
              </Button>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-col gap-2.5">
                <Field
                  label={t('কিস্তি পরিশোধের পরিমাণ (৳)', 'Custom Installment Repayment Amount (BDT)')}
                  type="number"
                  value={repayInput}
                  onChange={(e) => setRepayInput(e.target.value)}
                />
              </div>

              {myLoans.map((l) => (
                <div
                  key={l.id}
                  className="rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F2937] tabular-nums">
                        {money(l.amount)} ({l.purpose})
                      </span>
                      <Badge tone={toneForStatus(l.status)}>{l.status}</Badge>
                    </div>
                    <div className="text-xs text-[#64748B] tabular-nums">
                      {t('বকেয়া:', 'Outstanding:')} {money(l.outstanding)} · {l.annualRate}%
                      {l.graceUntil ? ` · ${t('গ্রেস মেয়াদ:', 'Grace Until:')} ${date(l.graceUntil)}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {l.status === 'offered' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({ type: 'loan.accept', loanId: l.id })
                        }
                      >
                        {t('শর্ত গ্রহণ ও জমা দিন', 'Accept & Submit to Bank')}
                      </Button>
                    ) : null}
                    {l.status === 'active' && l.outstanding > 0 ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'loan.repay',
                              loanId: l.id,
                              amount: Math.min(
                                l.outstanding,
                                Math.max(500, Number(repayInput) || 5000),
                              ),
                            })
                          }
                        >
                          {t(`কিস্তি পরিশোধ (${money(Number(repayInput) || 5000)})`, 'Pay Installment')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'loan.repay',
                              loanId: l.id,
                              amount: l.outstanding,
                            })
                          }
                        >
                          {t('সম্পূর্ণ বকেয়া পরিশোধ', 'Pay Full Balance')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Livestock Insurance & Claim Submission */}
            <Card className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('প্রাণী বীমা ও দাবি দাখিল', 'Livestock Insurance & Claims')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <SelectField
                  label={t('বীমা প্রতিষ্ঠান নির্বাচন করুন', 'Select Insurer')}
                  value={selectedInsurerId}
                  onChange={(e) => setSelectedInsurerId(e.target.value)}
                  options={insurers.map((ins) => ({
                    value: ins.id,
                    label: locale === 'bn' ? ins.nameBn : ins.name,
                  }))}
                />
                <Field
                  label={t('বীমা কভারেজ পরিমাণ (৳)', 'Coverage Amount (BDT)')}
                  type="number"
                  value={coverageInput}
                  onChange={(e) => setCoverageInput(e.target.value)}
                />
                <Button
                  variant="primary"
                  icon="shield-check"
                  disabled={busy || !activeAnimal || !selectedInsurerId}
                  onClick={() =>
                    activeAnimal &&
                    selectedInsurerId &&
                    void run({
                      type: 'policy.apply',
                      animalId: activeAnimal.id,
                      insurerId: selectedInsurerId,
                      coverage: Math.max(10000, Number(coverageInput) || 100000),
                    })
                  }
                >
                  {t('বীমা পলিসির আবেদন করুন', 'Apply for Insurance Policy')}
                </Button>
              </div>

              {myPolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F2937] tabular-nums">
                      {t('কভারেজ:', 'Coverage:')} {money(pol.coverage)} ·{' '}
                      {t('প্রিমিয়াম:', 'Premium:')} {money(pol.premium)}
                    </span>
                    <Badge tone={toneForStatus(pol.status)}>{pol.status}</Badge>
                  </div>
                  {pol.status === 'expired' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run({ type: 'policy.renew', policyId: pol.id })
                      }
                    >
                      {t('পলিসি নবায়ন করুন', 'Renew Policy')}
                    </Button>
                  ) : null}
                  {pol.status === 'active' ? (
                    <div className="border-t border-[#E2E8F0] pt-2 mt-1 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <SelectField
                          label={t('দাবির ধরন', 'Claim Type')}
                          value={claimKind}
                          onChange={(e) =>
                            setClaimKind(e.target.value as 'illness' | 'death')
                          }
                          options={[
                            { value: 'illness', label: t('অসুস্থতা (Illness)', 'Illness') },
                            { value: 'death', label: t('মৃত্যু (Mortality)', 'Mortality') },
                          ]}
                        />
                        <Field
                          label={t('দাবির পরিমাণ (৳)', 'Claim Amount')}
                          type="number"
                          value={claimAmount}
                          onChange={(e) => setClaimAmount(e.target.value)}
                        />
                      </div>
                      <Field
                        label={t('প্রমাণ ও বিবরণ (Photo + GPS যুক্ত)', 'Evidence Description')}
                        value={claimDesc}
                        onChange={(e) => setClaimDesc(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#475569] py-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={claimPhoto}
                            onChange={(e) => setClaimPhoto(e.target.checked)}
                            className="accent-[#15803D]"
                          />
                          {t('ইয়ার-ট্যাগ ছবি সংযুক্ত (Photo)', 'Attach Ear-Tag Photo')}
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={claimLocation}
                            onChange={(e) => setClaimLocation(e.target.checked)}
                            className="accent-[#15803D]"
                          />
                          {t('জিপিএস লোকেশন সংযুক্ত (GPS)', 'Attach GPS Coordinates')}
                        </label>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'claim.submit',
                            policyId: pol.id,
                            kind: claimKind,
                            amount: Math.min(
                              pol.coverage,
                              Math.max(1000, Number(claimAmount) || 20000),
                            ),
                            evidence: {
                              photo: claimPhoto,
                              location: claimLocation,
                              description: claimDesc,
                              capturedAt: state.now,
                              latitude: 24.3396,
                              longitude: 89.6011,
                            },
                          })
                        }
                      >
                        {t('ছবি ও জিপিএস প্রমাণসহ দাবি জমা দিন', 'Submit Claim with Photo & GPS')}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}

              {myClaims.length > 0 ? (
                <div className="border-t border-[#E2E8F0] pt-3 flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#64748B]">
                    {t('জমাকৃত দাবি তালিকা', 'Submitted Claims')}
                  </span>
                  {myClaims.map((cl) => (
                    <div
                      key={cl.id}
                      className="flex items-center justify-between text-xs rounded-[8px] bg-[#F8FAFC] p-2.5 tabular-nums"
                    >
                      <span>
                        {cl.kind.toUpperCase()} · {money(cl.amount)}
                      </span>
                      <Badge tone={toneForStatus(cl.status)}>{cl.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}

              {myPayments.length > 0 ? (
                <div className="border-t border-[#E2E8F0] pt-3 flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#64748B]">
                    {t('ওয়ালেট লেনদেন ও পেমেন্ট রশিদ খতিয়ান', 'Wallet Transactions & Payment Receipts')}
                  </span>
                  <div className="divide-y divide-[#E2E8F0] rounded-[10px] border border-[#E2E8F0] bg-white">
                    {myPayments.slice(0, 8).map((pmt) => (
                      <div
                        key={pmt.id}
                        className="flex items-center justify-between px-3 py-2 text-xs tabular-nums"
                      >
                        <div>
                          <span className="font-semibold text-[#1F2937]">{pmt.kind}</span>
                          <span className="text-[#64748B] ml-2">
                            {pmt.direction.toUpperCase()} · {pmt.id}
                          </span>
                        </div>
                        <span className="font-bold text-[#0F602D]">
                          {money(pmt.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}

      {/* SECTION 7: MARKETPLACE & ORDERS */}
      {section === 'market' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.products.map((prod) => {
              const inCart =
                myCart.find((c) => c.productId === prod.id)?.quantity ?? 0;
              const hasValidPrescription = myPrescriptions.some(
                (p) => p.medicines.length > 0,
              );
              const rxLocked = prod.requiresPrescription && !hasValidPrescription;
              return (
                <Card key={prod.id} className="flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="brand">{prod.category}</Badge>
                      {prod.requiresPrescription ? (
                        <Badge tone={rxLocked ? 'danger' : 'warning'}>
                          {rxLocked
                            ? t('প্রেসক্রিপশন ছাড়া লকড', 'Rx Required (Locked)')
                            : t('প্রেসক্রিপশন যাচাইকৃত', 'Rx Verified')}
                        </Badge>
                      ) : null}
                    </div>
                    <h4 className="text-base font-bold text-[#1F2937] mt-2">
                      {prod.name[locale]}
                    </h4>
                    <div className="text-sm font-bold text-[#0F602D] tabular-nums mt-1">
                      {money(prod.price)} / {prod.unit[locale]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B] tabular-nums">
                      {t('স্টক:', 'Stock:')} {prod.stock} · {t('কার্টে:', 'In Cart:')} {inCart}
                    </span>
                    <div className="flex gap-1.5">
                      {inCart > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'cart.set',
                              productId: prod.id,
                              quantity: inCart - 1,
                            })
                          }
                        >
                          -
                        </Button>
                      ) : null}
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy || rxLocked || prod.stock <= inCart}
                        onClick={() =>
                          void run({
                            type: 'cart.set',
                            productId: prod.id,
                            quantity: inCart + 1,
                          })
                        }
                      >
                        {t('কার্টে যোগ', 'Add +1')}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('চেকআউট ও অর্ডার ট্র্যাকিং', 'Checkout & Order Tracking')}
              </h3>
              <Field
                label={t('ডেলিভারি ঠিকানা', 'Delivery Address')}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <Button
                variant="primary"
                icon="shopping-bag"
                disabled={busy || myCart.length === 0}
                onClick={() =>
                  void run({ type: 'order.place', address: deliveryAddress })
                }
              >
                {t('অর্ডার নিশ্চিত করুন', 'Place Order from Wallet')}
              </Button>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-col gap-2.5">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-[10px] border border-[#E2E8F0] p-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1F2937] tabular-nums">
                        {money(ord.total)} · {ord.address}
                      </div>
                      <div className="text-xs text-[#64748B] tabular-nums">
                        {dateTime(ord.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={toneForStatus(ord.status)}>{ord.status}</Badge>
                      {['placed', 'confirmed'].includes(ord.status) ? (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({ type: 'order.cancel', orderId: ord.id })
                          }
                        >
                          {t('বাতিল ও রিফান্ড', 'Cancel & Refund')}
                        </Button>
                      ) : null}
                      {!['delivered', 'cancelled'].includes(ord.status) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run({ type: 'order.advance', orderId: ord.id })
                          }
                        >
                          {t('পরবর্তী ধাপ', 'Advance')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* SECTION 8: KNOWLEDGE HUB */}
      {section === 'education' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.content
            .filter((c) => c.status === 'published')
            .map((art) => (
              <Card key={art.id} className="flex flex-col gap-2.5">
                <Badge tone="brand">{art.category}</Badge>
                <h3 className="text-base font-bold text-[#1F2937]">
                  {art.title[locale]}
                </h3>
                <p className="text-sm text-[#475569]">{art.body[locale]}</p>
                <div className="text-xs text-[#64748B] mt-auto pt-2 tabular-nums">
                  {date(art.updatedAt)}
                </div>
              </Card>
            ))}
        </div>
      ) : null}
    </div>
  );
}
