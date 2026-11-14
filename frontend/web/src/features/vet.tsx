'use client';

import { useMemo, useState } from 'react';
import { hasIoTEvidence, type HealthRecord, type Medicine } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
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
  WebIcon,
} from '@/components/ui.tsx';

export function VetWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  const { state, user, locale, t, money, date, dateTime, run, busy, openMobileHandoff } =
    useWebApp();

  const myAppointments = useMemo(
    () =>
      state.appointments.filter(
        (a) => !user?.id || user.role !== 'vet' || a.vetId === user.id,
      ),
    [state.appointments, user?.id, user?.role],
  );
  const myClaims = useMemo(
    () =>
      state.claims.filter(
        (c) => !user?.id || user.role !== 'vet' || c.vetId === user.id,
      ),
    [state.claims, user?.id, user?.role],
  );
  const linkedAnimals = useMemo(() => {
    if (!user?.id || user.role !== 'vet') return state.animals;
    return state.animals.filter(
      (animal) =>
        state.appointments.some(
          (a) =>
            a.animalId === animal.id &&
            a.vetId === user.id &&
            !['rejected', 'cancelled'].includes(a.status),
        ) ||
        state.claims.some(
          (c) =>
            c.animalId === animal.id &&
            c.vetId === user.id &&
            c.status === 'vet_review',
        ),
    );
  }, [state.animals, state.appointments, state.claims, user?.id, user?.role]);

  const initialTab =
    screen === 'animals' || screen === 'animal' || screen === 'passport'
      ? 'patients'
      : screen === 'reviews' ||
          screen === 'claims' ||
          screen === 'claim' ||
          screen === 'review-overdue'
        ? 'claims'
        : screen === 'emergency'
          ? 'emergency'
          : screen === 'schedule'
            ? 'schedule'
            : 'consultations';
  const [tab, setTab] = useState<
    'consultations' | 'patients' | 'claims' | 'emergency' | 'schedule'
  >(initialTab);

  // Consultations state
  const [selectedApptId, setSelectedApptId] = useState<string>(
    initialTab === 'consultations' && id
      ? id
      : (myAppointments[0]?.id ?? state.appointments[0]?.id ?? ''),
  );
  const [decisionNote, setDecisionNote] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('2026-04-20T15:00:00.000Z');
  const [diagnosis, setDiagnosis] = useState('Acute ruminal acidosis & mild pyrexia');
  const [advice, setAdvice] = useState(
    'Provide clean drinking water, oral buffer electrolytes, and monitor collar temperature every 6 hours.',
  );
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: 'Ketoprofen Bolus', dose: '1 bolus', frequency: 'Twice daily', days: 3 },
    { name: 'Rumenotoric Powder', dose: '50g', frequency: 'With warm water', days: 5 },
  ]);

  // Patient record state
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    initialTab === 'patients' && id
      ? id
      : (linkedAnimals[0]?.id ?? state.animals[0]?.id ?? ''),
  );
  const [recKind, setRecKind] = useState<HealthRecord['kind']>('checkup');
  const [recTitleBn, setRecTitleBn] = useState('নিয়মিত স্বাস্থ্য পরীক্ষা');
  const [recTitleEn, setRecTitleEn] = useState('Routine Clinical Checkup');
  const [recNote, setRecNote] = useState(
    'Normal auscultation, mucous membranes pink, appetite normal.',
  );
  const [recNextDueAt, setRecNextDueAt] = useState('');

  // Claim review state
  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    initialTab === 'claims' && id
      ? id
      : (myClaims.find((c) => c.status === 'vet_review')?.id ??
        myClaims[0]?.id ??
        state.claims[0]?.id ??
        ''),
  );
  const [vetOpinion, setVetOpinion] = useState(
    'Clinical history and IoT collar telemetry corroborate acute onset prior to incident.',
  );

  // Schedule state
  const [scheduleSpecialty, setScheduleSpecialty] = useState(
    user?.specialty ?? 'Dairy & Large Ruminant Medicine',
  );
  const [scheduleHours, setScheduleHours] = useState(
    user?.schedule ?? 'Sat–Thu, 09:00 AM – 06:00 PM',
  );
  const [scheduleAvailable, setScheduleAvailable] = useState(user?.available ?? true);

  const escalatedAlerts = state.alerts.filter((a) =>
    ['open', 'escalated'].includes(a.status),
  );
  const activeAppt =
    myAppointments.find((a) => a.id === selectedApptId) ?? myAppointments[0];
  const apptAnimal = activeAppt
    ? state.animals.find((a) => a.id === activeAppt.animalId)
    : undefined;
  const apptFarmer = activeAppt
    ? state.users.find((u) => u.id === activeAppt.farmerId)
    : undefined;
  const apptDevice = apptAnimal
    ? state.devices.find((d) => d.animalId === apptAnimal.id)
    : undefined;

  const dailyVitals = useMemo(() => {
    const readings = apptDevice?.readings ?? [];
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
  }, [apptDevice]);

  const activePatient =
    linkedAnimals.find((a) => a.id === selectedAnimalId) ??
    state.animals.find((a) => a.id === selectedAnimalId) ??
    linkedAnimals[0] ??
    state.animals[0];
  const patientRecords = activePatient
    ? state.records.filter((r) => r.animalId === activePatient.id)
    : [];

  const activeClaim =
    myClaims.find((c) => c.id === selectedClaimId) ??
    state.claims.find((c) => c.id === selectedClaimId) ??
    myClaims[0] ??
    state.claims[0];
  const claimAnimal = activeClaim
    ? state.animals.find((a) => a.id === activeClaim.animalId)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Clinical Command KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('সক্রিয় ও এসকেলেটেড সতর্কতা', 'Open & Escalated Alerts')}
          value={escalatedAlerts.length}
          hint={t('UC-001 ৪ ঘণ্টা SLA পর্যবেক্ষণ', 'UC-001 4-hour SLA monitoring')}
          tone={escalatedAlerts.length > 0 ? 'danger' : 'brand'}
          icon="alert"
        />
        <KpiCard
          label={t('সাক্ষাৎ ও টেলিমেডিসিন কিউ', 'Consultation Queue')}
          value={myAppointments.length}
          hint={t(
            `${myAppointments.filter((a) => a.priority === 'emergency').length}টি জরুরি কল`,
            `${myAppointments.filter((a) => a.priority === 'emergency').length} emergency priority`,
          )}
          tone="brand"
          icon="calendar"
        />
        <KpiCard
          label={t('প্রদত্ত ডিজিটাল প্রেসক্রিপশন', 'Digital Prescriptions')}
          value={state.prescriptions.length}
          hint={t('ওষুধ রিমাইন্ডারের সাথে যুক্ত', 'Synced with farmer reminders')}
          tone="success"
          icon="stethoscope"
        />
        <KpiCard
          label={t('বীমা দাবি পর্যালোচনা', 'Insurance Claim Reviews')}
          value={state.claims.filter((c) => c.status === 'vet_review').length}
          hint={t('ক্লিনিক্যাল মতামতের অপেক্ষায়', 'Awaiting veterinary opinion')}
          tone="info"
          icon="shield-check"
        />
      </div>

      {/* Urgent / Escalated Alerts Strip */}
      {escalatedAlerts.length > 0 ? (
        <div className="rounded-[14px] border border-[#FECDD3] bg-[#FFF1F2] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-[10px] bg-[#BE123C] text-white shrink-0">
              <WebIcon name="alert" className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-bold text-[#BE123C]">
                {t(
                  `জরুরি ক্লিনিক্যাল ট্রায়াজ প্রয়োজন (${escalatedAlerts.length}টি সতর্কতা)`,
                  `Urgent Clinical Triage Required (${escalatedAlerts.length} active alerts)`,
                )}
              </div>
              <div className="text-xs text-[#9F1239] mt-0.5">
                {escalatedAlerts
                  .map((al) => {
                    const an = state.animals.find((a) => a.id === al.animalId);
                    return `${an?.name ?? al.animalId}: ${al.title[locale]} (${al.status})`;
                  })
                  .join(' · ')}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon="smartphone"
            onClick={() =>
              openMobileHandoff({
                role: 'vet',
                screen: screen || 'home',
                title: t('পশুচিকিৎসক ট্রায়াজ ডেস্ক', 'Veterinary Clinical Triage'),
              })
            }
          >
            {t('মোবাইল টেলিমেডিসিন লিংক', 'Mobile Telemedicine Link')}
          </Button>
        </div>
      ) : null}

      <TabsBar
        ariaLabel={t('পশুচিকিৎসক ওয়ার্কবেঞ্চ ট্যাব', 'Veterinarian workbench tabs')}
        active={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'consultations',
            label: t('সাক্ষাৎ, ৭-দিনের ভাইটালস ও প্রেসক্রিপশন', 'Consultations, 7-Day Vitals & Rx'),
            count: myAppointments.length,
          },
          {
            id: 'patients',
            label: t('প্রাণী ডিরেক্টরি ও ক্লিনিক্যাল রেকর্ড', 'Patient Registry & Health Records'),
            count: linkedAnimals.length,
          },
          {
            id: 'claims',
            label: t('বীমা দাবি ক্লিনিক্যাল যাচাই (UC-002)', 'Insurance Claim Clinical Reviews'),
            count: myClaims.length,
          },
          {
            id: 'emergency',
            label: t('জরুরি ট্রায়াজ কিউ (UC-001)', 'Emergency Alert Triage (UC-001)'),
            count: escalatedAlerts.length,
          },
          {
            id: 'schedule',
            label: t('চেম্বার সময়সূচি ও প্রাপ্যতা', 'Clinic Schedule & Availability'),
          },
        ]}
      />

      {tab === 'consultations' ? (
        <SplitWorkbench
          masterTitle={t('সাক্ষাৎ ও জরুরি কল তালিকা', 'Appointments & Emergency Queue')}
          masterCount={myAppointments.length}
          masterList={myAppointments.map((appt) => {
            const animal = state.animals.find((a) => a.id === appt.animalId);
            const farmer = state.users.find((u) => u.id === appt.farmerId);
            const selected = activeAppt?.id === appt.id;
            return (
              <button
                key={appt.id}
                type="button"
                onClick={() => setSelectedApptId(appt.id)}
                className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-[#15803D] bg-[#EBF4EE]/60'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {animal ? `${animal.name} (${animal.tag})` : appt.animalId}
                      </span>
                      <Badge
                        tone={
                          appt.priority === 'emergency'
                            ? 'danger'
                            : appt.priority === 'urgent'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {appt.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : appt.farmerId}{' '}
                      · {appt.mode === 'video' ? t('ভিডিও কল', 'Video Call') : t('খামার পরিদর্শন', 'Farm Visit')}
                    </div>
                  </div>
                  <Badge tone={toneForStatus(appt.status)}>{appt.status}</Badge>
                </div>
                <p className="text-xs text-[#475569] mt-2 line-clamp-1">{appt.reason}</p>
                <div className="text-[11px] text-[#64748B] mt-1 tabular-nums">
                  {dateTime(appt.scheduledAt)}
                </div>
              </button>
            );
          })}
          detailPane={
            !activeAppt ? (
              <EmptyWorkspaceState
                title={t('কোনো সাক্ষাৎ নির্বাচিত নেই', 'No appointment selected')}
                description={t(
                  'বাম পাশের তালিকা থেকে একটি অ্যাপয়েন্টমেন্ট নির্বাচন করুন।',
                  'Select an appointment from the queue to inspect vitals and write a prescription.',
                )}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {/* Patient Header & 7-Day Daily Vitals Card */}
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="/images/cow.jpg"
                        alt={apptAnimal?.name ?? 'Animal'}
                        className="w-14 h-14 rounded-[12px] object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#1F2937]">
                            {apptAnimal
                              ? `${apptAnimal.name} (${apptAnimal.tag})`
                              : activeAppt.animalId}
                          </h3>
                          <Badge tone={toneForStatus(activeAppt.status)}>
                            {activeAppt.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#64748B] mt-0.5">
                          {apptAnimal?.breed} · {apptAnimal?.weightKg} kg ·{' '}
                          {t('মালিক:', 'Owner:')}{' '}
                          {apptFarmer
                            ? locale === 'bn'
                              ? apptFarmer.nameBn
                              : apptFarmer.name
                            : activeAppt.farmerId}{' '}
                          ({apptFarmer?.phone})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        tone={
                          activeAppt.priority === 'emergency'
                            ? 'danger'
                            : activeAppt.priority === 'urgent'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {activeAppt.priority.toUpperCase()} · {activeAppt.mode.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                        {dateTime(activeAppt.scheduledAt)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm">
                    <span className="text-xs font-semibold text-[#64748B] block">
                      {t('রোগের লক্ষণ ও পরামর্শের কারণ', 'Chief Complaint & Reason for Visit')}
                    </span>
                    <p className="font-medium text-[#1F2937] mt-0.5">{activeAppt.reason}</p>
                  </div>

                  {/* 7-Day Daily Vitals Aggregation & Reference Ranges */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {t(
                          '৭-দিনের দৈনিক আইওটি ভাইটালস ও আদর্শ সীমা',
                          '7-Day Daily Aggregated Vitals & Reference Ranges',
                        )}
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#0F602D]">
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

                    {dailyVitals.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {dailyVitals.map((v) => {
                          const fever = v.temperature > 39.2;
                          return (
                            <div
                              key={v.day}
                              className={`rounded-[10px] border p-2.5 text-xs tabular-nums ${
                                fever
                                  ? 'border-[#FECDD3] bg-[#FFF1F2]'
                                  : 'border-[#E2E8F0] bg-white'
                              }`}
                            >
                              <div className="font-semibold text-[#64748B]">
                                {v.day.slice(5)}
                              </div>
                              <div
                                className={`text-sm font-bold mt-1 ${
                                  fever ? 'text-[#BE123C]' : 'text-[#15803D]'
                                }`}
                              >
                                {v.temperature}°C
                              </div>
                              <div className="text-[11px] text-[#475569]">
                                {v.heartRate} bpm · {v.activity}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-[#64748B]">
                        {t('কোনো কলার রিডিং পাওয়া যায়নি।', 'No collar readings recorded.')}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Consultation Workflow & Digital Prescription Composer */}
                <Card className="flex flex-col gap-4">
                  <h4 className="text-base font-bold text-[#1F2937]">
                    {t(
                      'সাক্ষাৎ সিদ্ধান্ত ও ডিজিটাল প্রেসক্রিপশন কম্পোজার',
                      'Consultation Controls & Digital Prescription Composer',
                    )}
                  </h4>

                  {activeAppt.status === 'requested' ? (
                    <div className="flex flex-col gap-3">
                      <Field
                        label={t('পশুচিকিৎসকের নোট', 'Clinician Note')}
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        placeholder={t(
                          'যেমন: ভিডিও পরামর্শের জন্য প্রস্তুত...',
                          'e.g., Ready for telemedicine consultation...',
                        )}
                      />
                      <div className="flex flex-wrap gap-2.5">
                        <Button
                          variant="primary"
                          icon="check"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'appointment.decide',
                              appointmentId: activeAppt.id,
                              accept: true,
                              note: decisionNote.trim() || 'Accepted by veterinarian',
                            })
                          }
                        >
                          {t('অ্যাপয়েন্টমেন্ট গ্রহণ করুন', 'Accept Appointment')}
                        </Button>
                        <Button
                          variant="danger"
                          icon="close"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'appointment.decide',
                              appointmentId: activeAppt.id,
                              accept: false,
                              note: decisionNote.trim() || 'Reschedule requested',
                            })
                          }
                        >
                          {t('প্রত্যাখ্যান করুন', 'Decline')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {['requested', 'accepted'].includes(activeAppt.status) ? (
                    <div className="flex flex-wrap items-end justify-between gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                      <div className="flex-1 min-w-[200px]">
                        <Field
                          label={t('সময় পরিবর্তন করুন (ISO / সময়)', 'Reschedule Time')}
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon="calendar"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'appointment.reschedule',
                              appointmentId: activeAppt.id,
                              scheduledAt: rescheduleTime,
                            })
                          }
                        >
                          {t('সময় পরিবর্তন (Reschedule)', 'Reschedule')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon="close"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'appointment.cancel',
                              appointmentId: activeAppt.id,
                              reason: decisionNote.trim() || 'Cancelled by veterinarian',
                            })
                          }
                        >
                          {t('অ্যাপয়েন্টমেন্ট বাতিল', 'Cancel Appointment')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {activeAppt.status === 'accepted' ? (
                    <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4">
                      <div>
                        <div className="text-sm font-bold text-[#0A401E]">
                          {t('পরামর্শ শুরু করার জন্য প্রস্তুত', 'Ready to Start Consultation')}
                        </div>
                        <div className="text-xs text-[#0F602D]">
                          {t(
                            'ভিডিও/ভিজিট সেশন শুরু করে প্রেসক্রিপশন প্রদান করুন।',
                            'Begin the active session to record diagnosis and issue a prescription.',
                          )}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        icon="stethoscope"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'consultation.start',
                            appointmentId: activeAppt.id,
                          })
                        }
                      >
                        {t('পরামর্শ শুরু করুন', 'Start Consultation')}
                      </Button>
                    </div>
                  ) : null}

                  {['accepted', 'in_progress'].includes(activeAppt.status) ? (
                    <div className="flex flex-col gap-4 border-t border-[#E2E8F0] pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label={t('রোগ নির্ণয় (Diagnosis)', 'Clinical Diagnosis')}
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                        />
                        <Field
                          label={t('খামারির প্রতি পরামর্শ', 'Care & Feeding Advice')}
                          value={advice}
                          onChange={(e) => setAdvice(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1F2937]">
                            {t('ওষুধের তালিকা (Medicines)', 'Prescribed Medicines')}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="plus"
                            onClick={() =>
                              setMedicines((prev) => [
                                ...prev,
                                {
                                  name: 'Electrolyte Mix',
                                  dose: '25g',
                                  frequency: 'Twice daily',
                                  days: 3,
                                },
                              ])
                            }
                          >
                            {t('ওষুধ যোগ করুন', 'Add Medicine')}
                          </Button>
                        </div>

                        {medicines.map((med, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3"
                          >
                            <div className="sm:col-span-4">
                              <Field
                                label={t('ওষুধের নাম', 'Medicine Name')}
                                value={med.name}
                                onChange={(e) =>
                                  setMedicines((list) =>
                                    list.map((m, i) =>
                                      i === idx ? { ...m, name: e.target.value } : m,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <Field
                                label={t('মাত্রা (Dose)', 'Dose')}
                                value={med.dose}
                                onChange={(e) =>
                                  setMedicines((list) =>
                                    list.map((m, i) =>
                                      i === idx ? { ...m, dose: e.target.value } : m,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <Field
                                label={t('নিয়ম (Frequency)', 'Frequency')}
                                value={med.frequency}
                                onChange={(e) =>
                                  setMedicines((list) =>
                                    list.map((m, i) =>
                                      i === idx ? { ...m, frequency: e.target.value } : m,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div className="sm:col-span-2 flex items-center gap-1">
                              <Field
                                label={t('দিন', 'Days')}
                                type="number"
                                value={String(med.days)}
                                onChange={(e) =>
                                  setMedicines((list) =>
                                    list.map((m, i) =>
                                      i === idx
                                        ? { ...m, days: Math.max(1, Number(e.target.value) || 1) }
                                        : m,
                                    ),
                                  )
                                }
                              />
                              {medicines.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMedicines((list) => list.filter((_, i) => i !== idx))
                                  }
                                  aria-label="Remove medicine"
                                  className="mt-5 p-2 text-[#BE123C] hover:bg-[#FFF1F2] rounded-[8px] cursor-pointer"
                                >
                                  <WebIcon name="trash" className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          icon="check"
                          disabled={busy}
                          onClick={async () => {
                            if (activeAppt.status === 'accepted') {
                              await run({
                                type: 'consultation.start',
                                appointmentId: activeAppt.id,
                              });
                            }
                            await run({
                              type: 'consultation.complete',
                              appointmentId: activeAppt.id,
                              diagnosis,
                              advice,
                              medicines,
                            });
                          }}
                        >
                          {t(
                            'পরামর্শ শেষ করুন ও প্রেসক্রিপশন পাঠান',
                            'Complete Consultation & Issue Prescription',
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              </div>
            )
          }
        />
      ) : null}

      {tab === 'patients' ? (
        <SplitWorkbench
          masterTitle={t('নিবন্ধিত প্রাণী ডিরেক্টরি', 'Assigned Patient Animals')}
          masterCount={linkedAnimals.length}
          masterList={linkedAnimals.map((animal) => {
            const selected = activePatient?.id === animal.id;
            const owner = state.users.find((u) => u.id === animal.ownerId);
            return (
              <button
                key={animal.id}
                type="button"
                onClick={() => setSelectedAnimalId(animal.id)}
                className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-[#15803D] bg-[#EBF4EE]/60'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-[#1F2937]">
                      {animal.name} ({animal.tag})
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {animal.breed} · {animal.weightKg} kg ·{' '}
                      {owner ? (locale === 'bn' ? owner.nameBn : owner.name) : animal.ownerId}
                    </div>
                  </div>
                  <Badge tone={toneForStatus(animal.status)}>{animal.status}</Badge>
                </div>
                <div className="mt-2">
                  <HealthScoreBar score={animal.healthScore} />
                </div>
              </button>
            );
          })}
          detailPane={
            !activePatient ? null : (
              <div className="flex flex-col gap-4">
                <Card className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2937]">
                        {activePatient.name} ({activePatient.tag}) —{' '}
                        {t('ক্লিনিক্যাল পাসপোর্ট', 'Clinical Passport')}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        {activePatient.breed} · {activePatient.weightKg} kg ·{' '}
                        {t('মূল্যায়ন:', 'Valuation:')} {money(activePatient.value)}
                      </p>
                    </div>
                    <Badge tone={toneForStatus(activePatient.status)}>
                      {activePatient.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-bold text-[#1F2937]">
                      {t('চিকিৎসা ও টিকার ইতিহাস', 'Vaccination & Clinical History')} (
                      {patientRecords.length})
                    </div>
                    {patientRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#1F2937]">
                            {rec.title[locale]}
                          </div>
                          <div className="text-xs text-[#475569] mt-0.5">{rec.note}</div>
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
                </Card>

                <Card className="flex flex-col gap-4">
                  <h4 className="text-base font-bold text-[#1F2937]">
                    {t('নতুন ক্লিনিক্যাল রেকর্ড বা টিকা যোগ করুন', 'Log New Clinical or Vaccination Record')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <SelectField
                      label={t('রেকর্ডের ধরন', 'Record Type')}
                      value={recKind}
                      onChange={(e) => setRecKind(e.target.value as HealthRecord['kind'])}
                      options={[
                        { value: 'checkup', label: t('স্বাস্থ্য পরীক্ষা (Checkup)', 'Checkup') },
                        { value: 'vaccination', label: t('টিকা (Vaccination)', 'Vaccination') },
                        { value: 'treatment', label: t('চিকিৎসা (Treatment)', 'Treatment') },
                      ]}
                    />
                    <Field
                      label={t('শিরোনাম (বাংলা)', 'Title (Bangla)')}
                      value={recTitleBn}
                      onChange={(e) => setRecTitleBn(e.target.value)}
                    />
                    <Field
                      label={t('শিরোনাম (English)', 'Title (English)')}
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
                  <TextareaField
                    label={t('ক্লিনিক্যাল নোট ও পর্যবেক্ষণ', 'Clinical Notes & Observations')}
                    value={recNote}
                    onChange={(e) => setRecNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      icon="plus"
                      disabled={busy}
                      onClick={() =>
                        void run({
                          type: 'record.add',
                          animalId: activePatient.id,
                          kind: recKind,
                          title: { bn: recTitleBn, en: recTitleEn },
                          note: recNote,
                          nextDueAt: recNextDueAt.trim() || undefined,
                        })
                      }
                    >
                      {t('স্বাস্থ্য পাসপোর্টে যুক্ত করুন', 'Add to Health Passport')}
                    </Button>
                  </div>
                </Card>
              </div>
            )
          }
        />
      ) : null}

      {tab === 'claims' ? (
        <SplitWorkbench
          masterTitle={t('বীমা দাবি পর্যালোচনা তালিকা', 'Insurance Claims Referred for Vet Review')}
          masterCount={myClaims.length}
          masterList={myClaims.map((claim) => {
            const animal = state.animals.find((a) => a.id === claim.animalId);
            const selected = activeClaim?.id === claim.id;
            return (
              <button
                key={claim.id}
                type="button"
                onClick={() => setSelectedClaimId(claim.id)}
                className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-[#15803D] bg-[#EBF4EE]/60'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1F2937]">
                    {animal ? `${animal.name} (${animal.tag})` : claim.animalId}
                  </span>
                  <Badge tone={toneForStatus(claim.status)}>{claim.status}</Badge>
                </div>
                <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                  {claim.kind.toUpperCase()} · {money(claim.amount)} · {dateTime(claim.createdAt)}
                </div>
              </button>
            );
          })}
          detailPane={
            !activeClaim ? null : (
              <Card className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937]">
                      {t('বীমা দাবির ক্লিনিক্যাল ফরেনসিক পর্যালোচনা', 'Clinical Claim Verification')}
                    </h3>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      Claim ID: {activeClaim.id} ·{' '}
                      {claimAnimal ? `${claimAnimal.name} (${claimAnimal.tag})` : ''}
                    </p>
                  </div>
                  <Badge tone={toneForStatus(activeClaim.status)}>{activeClaim.status}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">
                      {t('দাবির ধরন ও পরিমাণ', 'Claim Type & Amount')}
                    </span>
                    <strong className="text-sm text-[#1F2937] tabular-nums">
                      {activeClaim.kind} · {money(activeClaim.amount)}
                    </strong>
                  </div>
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">
                      {t('ছবি ও জিপিএস প্রমাণ', 'Photo & GPS Evidence')}
                    </span>
                    <strong className="text-sm text-[#15803D]">
                      {activeClaim.evidence.photo ? 'Photo ✓' : 'No Photo'} ·{' '}
                      {activeClaim.evidence.location ? 'GPS ✓' : 'No GPS'}
                    </strong>
                  </div>
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">
                      {t('আইওটি কলার টেলিমেট্রি', 'IoT Collar Telemetry')}
                    </span>
                    <strong className="text-sm text-[#0F602D]">
                      {claimAnimal &&
                      hasIoTEvidence(
                        state,
                        claimAnimal.id,
                        activeClaim.evidence.capturedAt ?? activeClaim.createdAt,
                      )
                        ? t('যাচাইকৃত (Verified)', 'Verified')
                        : t('ম্যানুয়াল যাচাই', 'Manual Check')}
                    </strong>
                  </div>
                </div>

                <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm">
                  <span className="text-xs font-semibold text-[#64748B] block">
                    {t('খামারির প্রদত্ত বিবরণ', 'Incident Evidence Description')}
                  </span>
                  <p className="text-[#1F2937] mt-1">{activeClaim.evidence.description}</p>
                </div>

                {activeClaim.vetOpinion ? (
                  <div className="rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-3.5 text-sm">
                    <span className="text-xs font-semibold text-[#0F602D] block">
                      {t('পশুচিকিৎসকের জমাকৃত মতামত', 'Submitted Veterinary Opinion')}
                    </span>
                    <p className="text-[#0A401E] mt-1">{activeClaim.vetOpinion}</p>
                  </div>
                ) : null}

                {activeClaim.status === 'vet_review' ? (
                  <div className="flex flex-col gap-3">
                    <TextareaField
                      label={t('ক্লিনিক্যাল মতামত লিখুন', 'Veterinary Clinical Assessment')}
                      value={vetOpinion}
                      onChange={(e) => setVetOpinion(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        icon="shield-check"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'claim.vetReview',
                            claimId: activeClaim.id,
                            opinion: vetOpinion,
                          })
                        }
                      >
                        {t('ক্লিনিক্যাল মতামত জমা দিন', 'Submit Clinical Opinion to Insurer')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            )
          }
        />
      ) : null}

      {tab === 'emergency' ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">
                {t('জরুরি সতর্কতা ও ৪-ঘণ্টা SLA ট্রায়াজ কিউ (UC-001)', 'Emergency Alert & 4-Hour SLA Triage Queue (UC-001)')}
              </h2>
              <p className="text-xs text-[#64748B]">
                {t(
                  '৪ ঘণ্টার মধ্যে সমাধান না হওয়া গুরুতর সতর্কতা স্বয়ংক্রিয়ভাবে এসকেলেট হয়।',
                  'Critical collar alerts unresolved after 4 hours automatically escalate here for rapid clinical intervention.',
                )}
              </p>
            </div>
            <Badge tone={escalatedAlerts.length > 0 ? 'danger' : 'success'}>
              {escalatedAlerts.length} {t('টি সক্রিয়', 'Active')}
            </Badge>
          </div>

          {escalatedAlerts.length === 0 ? (
            <EmptyWorkspaceState
              title={t('কোনো জরুরি সতর্কতা নেই', 'No active emergency alerts')}
              description={t(
                'সকল নিবন্ধিত প্রাণীর কলার ভাইটালস স্বাভাবিক সীমার মধ্যে রয়েছে।',
                'All monitored livestock vitals are currently within normal thresholds.',
              )}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escalatedAlerts.map((alert) => {
                const animal = state.animals.find((a) => a.id === alert.animalId);
                const linkedAppt = myAppointments.find((ap) => ap.alertId === alert.id);
                return (
                  <div
                    key={alert.id}
                    className="rounded-[14px] border border-[#FECDD3] bg-[#FFF1F2]/70 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-[#BE123C]">
                          {alert.title[locale]}
                        </div>
                        <div className="text-xs text-[#9F1239] mt-0.5">
                          {animal ? `${animal.name} (${animal.tag})` : alert.animalId} ·{' '}
                          {dateTime(alert.createdAt)}
                        </div>
                      </div>
                      <Badge tone="danger">{alert.status}</Badge>
                    </div>
                    <p className="text-xs text-[#881337]">{alert.message[locale]}</p>
                    <div className="flex flex-wrap gap-2">
                      {linkedAppt ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedApptId(linkedAppt.id);
                            setTab('consultations');
                          }}
                        >
                          {t('জরুরি সাক্ষাৎ খুলুন', 'Open Linked Consultation')}
                        </Button>
                      ) : null}
                      {animal ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnimalId(animal.id);
                            setTab('patients');
                          }}
                        >
                          {t('প্রাণীর পাসপোর্ট দেখুন', 'Inspect Patient Passport')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : null}

      {tab === 'schedule' ? (
        <Card className="flex flex-col gap-4 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('চেম্বার সময়সূচি, বিশেষত্ব ও প্রাপ্যতা', 'Clinical Specialty, Schedule & Availability')}
            </h2>
            <p className="text-xs text-[#64748B]">
              {t(
                'খামারিরা পশুচিকিৎসক ডিরেক্টরিতে আপনার এই প্রাপ্যতা ও সময়সূচি দেখতে পাবেন।',
                'Farmers see your live availability and clinic hours when booking consultations.',
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t('বিশেষত্ব (Specialty)', 'Clinical Specialty')}
              value={scheduleSpecialty}
              onChange={(e) => setScheduleSpecialty(e.target.value)}
            />
            <Field
              label={t('চেম্বার ও টেলিমেডিসিন সময়সূচি', 'Consultation Hours')}
              value={scheduleHours}
              onChange={(e) => setScheduleHours(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-[#1F2937] cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleAvailable}
              onChange={(e) => setScheduleAvailable(e.target.checked)}
              className="h-4 w-4 accent-[#15803D]"
            />
            {t('নতুন সাক্ষাৎ ও জরুরি কলের জন্য উপলব্ধ (Available)', 'Available for new bookings & emergency dispatches')}
          </label>
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon="check"
              disabled={busy}
              onClick={() =>
                void run({
                  type: 'profile.update',
                  name: user?.name ?? 'Dr. Farhana Rahman',
                  district: user?.district ?? 'Sirajganj',
                  specialty: scheduleSpecialty,
                  schedule: scheduleHours,
                  available: scheduleAvailable,
                })
              }
            >
              {t('সময়সূচি সংরক্ষণ করুন', 'Save Clinic Schedule')}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
