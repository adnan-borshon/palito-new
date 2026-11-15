'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasIoTEvidence } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { webHref } from '@/navigation.ts';
import {
  Badge,
  Button,
  Card,
  EmptyWorkspaceState,
  HealthScoreBar,
  KpiCard,
  SelectField,
  SplitWorkbench,
  TextareaField,
  toneForStatus,
} from '@/components/ui.tsx';

export function InsurerWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  const router = useRouter();
  const { state, locale, t, money, date, dateTime, run, busy, openMobileHandoff, user } =
    useWebApp();

  const myClaims = state.claims.filter(
    (c) => !user?.id || user.role !== 'insurer' || c.insurerId === user.id,
  );
  const myPolicies = state.policies.filter(
    (p) => !user?.id || user.role !== 'insurer' || p.insurerId === user.id,
  );

  const tab: 'claims' | 'policies' | 'passport' =
    screen === 'applications' || screen === 'policies' || screen === 'policy'
      ? 'policies'
      : screen === 'passport'
        ? 'passport'
        : 'claims';

  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    tab === 'claims' && id ? id : (myClaims[0]?.id ?? ''),
  );
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    tab === 'policies' && id ? id : (myPolicies[0]?.id ?? ''),
  );
  const [selectedPassportAnimalId, setSelectedPassportAnimalId] = useState<string>(
    tab === 'passport' && id ? id : '',
  );
  const vets = state.users.filter((u) => u.role === 'vet' && u.status === 'active');
  const [referVetId, setReferVetId] = useState<string>(vets[0]?.id ?? '');
  const [claimNote, setClaimNote] = useState(
    'Verified telemetry, GPS coordinates, and veterinary clinical report.',
  );
  const [policyNote, setPolicyNote] = useState(
    'Approved after digital health passport and vaccination check.',
  );

  const activeClaim =
    myClaims.find((c) => c.id === selectedClaimId) ?? myClaims[0];
  const claimAnimal = activeClaim
    ? state.animals.find((a) => a.id === activeClaim.animalId)
    : undefined;
  const claimFarmer = activeClaim
    ? state.users.find((u) => u.id === activeClaim.farmerId)
    : undefined;
  const securedLoan = activeClaim
    ? state.loans.find(
        (l) =>
          l.animalId === activeClaim.animalId &&
          ['active', 'approved'].includes(l.status) &&
          l.outstanding > 0,
      )
    : undefined;

  const estimatedDebtCut =
    activeClaim && securedLoan
      ? Math.min(activeClaim.amount, securedLoan.outstanding)
      : 0;
  const estimatedFarmerNet = activeClaim
    ? Math.max(0, activeClaim.amount - estimatedDebtCut)
    : 0;

  const activePolicy =
    myPolicies.find((p) => p.id === selectedPolicyId) ?? myPolicies[0];
  const policyAnimal = activePolicy
    ? state.animals.find((a) => a.id === activePolicy.animalId)
    : undefined;
  const policyFarmer = activePolicy
    ? state.users.find((u) => u.id === activePolicy.farmerId)
    : undefined;
  const passportAnimal =
    state.animals.find((a) => a.id === selectedPassportAnimalId) ??
    policyAnimal ??
    claimAnimal ??
    state.animals[0];

  const totalCoverage = myPolicies
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.coverage, 0);
  const pendingClaimsCount = myClaims.filter((c) =>
    ['submitted', 'manual_review', 'vet_review', 'approved'].includes(c.status),
  ).length;
  const totalPaidClaims = myClaims
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.payout ?? c.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('অপেক্ষমাণ বীমা দাবি', 'Pending Claims Queue')}
          value={pendingClaimsCount}
          hint={t('যাচাই ও পেআউটের অপেক্ষায়', 'Awaiting verification or payout')}
          tone={pendingClaimsCount > 0 ? 'warning' : 'brand'}
          icon="shield-check"
        />
        <KpiCard
          label={t('সক্রিয় পলিসি কভারেজ', 'Active Policy Coverage')}
          value={money(totalCoverage)}
          hint={`${myPolicies.filter((p) => p.status === 'active').length} ${t('টি সক্রিয় পলিসি', 'active policies')}`}
          tone="brand"
          icon="landmark"
        />
        <KpiCard
          label={t('পলিসি আবেদন কিউ', 'Policy Applications')}
          value={myPolicies.filter((p) => p.status === 'submitted').length}
          hint={t('আন্ডাররাইটিং সিদ্ধান্তের অপেক্ষায়', 'Awaiting underwriting decision')}
          tone="info"
          icon="file-check"
        />
        <KpiCard
          label={t('পরিশোধিত দাবি (ডেট-ফার্স্ট)', 'Total Claims Paid')}
          value={money(totalPaidClaims)}
          hint={t('স্বয়ংক্রিয় ঋণ সমন্বয়সহ', 'Includes automatic bank debt routing')}
          tone="success"
          icon="check"
        />
      </div>

      {tab === 'claims' ? (
        <SplitWorkbench
          masterTitle={t('বীমা দাবি ফাইল তালিকা', 'Insurance Claims Queue')}
          masterCount={myClaims.length}
          masterToolbar={
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                icon="smartphone"
                onClick={() =>
                  openMobileHandoff({
                    role: 'insurer',
                    screen: 'claims',
                    id: activeClaim?.id,
                  })
                }
              >
                {t('মোবাইল ভিউ', 'Mobile Link')}
              </Button>
            </div>
          }
          masterList={myClaims.map((claim) => {
            const animal = state.animals.find((a) => a.id === claim.animalId);
            const farmer = state.users.find((u) => u.id === claim.farmerId);
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-[#1F2937]">
                      {animal ? `${animal.name} (${animal.tag})` : claim.animalId}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : claim.farmerId} ·{' '}
                      {claim.kind.toUpperCase()}
                    </div>
                  </div>
                  <Badge tone={toneForStatus(claim.status)}>{claim.status}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold tabular-nums">
                  <span className="text-[#0F602D]">{money(claim.amount)}</span>
                  <span className="text-[#64748B]">{dateTime(claim.createdAt)}</span>
                </div>
              </button>
            );
          })}
          detailPane={
            !activeClaim ? (
              <EmptyWorkspaceState
                title={t('একটি দাবি নির্বাচন করুন', 'Select a claim')}
                description={t(
                  'বাম পাশের তালিকা থেকে দাবি ফাইল নির্বাচন করুন।',
                  'Select a claim from the queue to inspect evidence and execute payout.',
                )}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#1F2937]">
                          {t('বীমা দাবি ও ফরেনসিক প্রমাণ যাচাই', 'Claim Evidence & Settlement Inspector')}
                        </h3>
                        <Badge tone={toneForStatus(activeClaim.status)}>
                          {activeClaim.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] tabular-nums mt-0.5">
                        Claim ID: {activeClaim.id} · Policy: {activeClaim.policyId} ·{' '}
                        {dateTime(activeClaim.createdAt)}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-xs text-[#64748B] block">
                        {t('দাবিকৃত অর্থ', 'Claimed Amount')}
                      </span>
                      <strong className="text-2xl text-[#0F602D]">
                        {money(activeClaim.amount)}
                      </strong>
                    </div>
                  </div>

                  {/* Evidence & Telemetry Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                      <span className="text-[#64748B] block">
                        {t('খামারি ও প্রাণী', 'Farmer & Insured Animal')}
                      </span>
                      <strong className="text-sm text-[#1F2937] block mt-0.5">
                        {claimAnimal ? `${claimAnimal.name} (${claimAnimal.tag})` : activeClaim.animalId}
                      </strong>
                      <span className="text-[#475569]">
                        {claimFarmer
                          ? locale === 'bn'
                            ? claimFarmer.nameBn
                            : claimFarmer.name
                          : activeClaim.farmerId}
                      </span>
                    </div>

                    <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                      <span className="text-[#64748B] block">
                        {t('ছবি ও জিপিএস অবস্থান', 'Photo & Geo-Timestamp')}
                      </span>
                      <strong className="text-sm text-[#15803D] block mt-0.5">
                        {activeClaim.evidence.photo ? 'Photo ✓' : 'Missing Photo'} ·{' '}
                        {activeClaim.evidence.location ? 'GPS ✓' : 'Missing GPS'}
                      </strong>
                      <span className="text-[#475569] tabular-nums">
                        {activeClaim.evidence.latitude
                          ? `${activeClaim.evidence.latitude.toFixed(4)}, ${activeClaim.evidence.longitude?.toFixed(4)}`
                          : t('জিও-ট্যাগ সংযুক্ত', 'Geo-tagged metadata')}
                      </span>
                    </div>

                    <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                      <span className="text-[#64748B] block">
                        {t('আইওটি কলার টেলিমেট্রি', 'IoT Biometric Evidence')}
                      </span>
                      <strong className="text-sm text-[#0F602D] block mt-0.5">
                        {claimAnimal &&
                        hasIoTEvidence(
                          state,
                          claimAnimal.id,
                          activeClaim.evidence.capturedAt ?? activeClaim.createdAt,
                        )
                          ? t('স্বয়ংক্রিয় যাচাইকৃত', 'Telemetry Verified')
                          : t('ম্যানুয়াল পর্যালোচনা প্রয়োজন', 'Manual Review Required')}
                      </strong>
                      <span className="text-[#475569]">
                        {t('ঘটনার ধরন:', 'Incident type:')} {activeClaim.kind}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm">
                    <span className="text-xs font-semibold text-[#64748B] block">
                      {t('ঘটনার বিবরণ', 'Submitted Incident Description')}
                    </span>
                    <p className="text-[#1F2937] mt-1">{activeClaim.evidence.description}</p>
                  </div>

                  {activeClaim.vetOpinion ? (
                    <div className="rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE] p-3.5 text-sm">
                      <span className="text-xs font-semibold text-[#1D4ED8] block">
                        {t('পশুচিকিৎসকের ক্লিনিক্যাল মতামত', 'Veterinary Clinical Opinion')}
                      </span>
                      <p className="text-[#1E3A8A] mt-1">{activeClaim.vetOpinion}</p>
                    </div>
                  ) : null}

                  {/* UC-002 Debt-First Settlement Routing Preview */}
                  <div className="rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/60 p-4 flex flex-col gap-2">
                    <div className="text-sm font-bold text-[#0A401E]">
                      {t(
                        'স্বয়ংক্রিয় জামানত ঋণ সমন্বয় ও পেআউট বিভাজন',
                        'Debt-First Collateral Settlement Routing',
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs tabular-nums pt-1">
                      <div>
                        <span className="text-[#64748B] block">
                          {t('মোট দাবি পেআউট', 'Gross Claim Payout')}
                        </span>
                        <strong className="text-base text-[#1F2937]">
                          {money(activeClaim.payout ?? activeClaim.amount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('ব্যাংক ঋণ সমন্বয়', 'Bank Debt Settlement')}
                        </span>
                        <strong className="text-base text-[#15803D]">
                          {money(activeClaim.debtSettlement ?? estimatedDebtCut)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('খামারির নিট প্রাপ্য', 'Net Farmer Wallet Credit')}
                        </span>
                        <strong className="text-base text-[#0F602D]">
                          {money(activeClaim.farmerPayout ?? estimatedFarmerNet)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Insurer Workflow Actions */}
                  <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
                    {activeClaim.status === 'submitted' ? (
                      <div className="flex flex-wrap gap-2.5">
                        <Button
                          variant="primary"
                          icon="shield-check"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'claim.autoReview',
                              claimId: activeClaim.id,
                            })
                          }
                        >
                          {t(
                            'স্বয়ংক্রিয় আইওটি ও প্রমাণ যাচাই চালান (Auto-Review)',
                            'Run Automated Evidence & IoT Check',
                          )}
                        </Button>
                      </div>
                    ) : null}

                    {['submitted', 'manual_review'].includes(activeClaim.status) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end rounded-[12px] border border-[#E2E8F0] p-3.5">
                        <div className="sm:col-span-2">
                          <SelectField
                            label={t(
                              'ক্লিনিক্যাল যাচাইয়ের জন্য পশুচিকিৎসক নির্বাচন করুন',
                              'Refer Complex Claim to Veterinarian',
                            )}
                            value={referVetId}
                            onChange={(e) => setReferVetId(e.target.value)}
                            options={vets.map((v) => ({
                              value: v.id,
                              label: `${locale === 'bn' ? v.nameBn : v.name} (${v.district})`,
                            }))}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          icon="stethoscope"
                          disabled={busy || !referVetId}
                          onClick={() =>
                            void run({
                              type: 'claim.refer',
                              claimId: activeClaim.id,
                              vetId: referVetId,
                            })
                          }
                        >
                          {t('ভেটের কাছে পাঠান', 'Refer to Vet')}
                        </Button>
                      </div>
                    ) : null}

                    {activeClaim.status === 'vet_review' ? (
                      <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3.5 text-xs text-[#1E3A8A]">
                        {t(
                          'এই দাবিটি বর্তমানে রেফারকৃত পশুচিকিৎসকের ক্লিনিক্যাল মতামতের (claim.vetReview) অপেক্ষায় রয়েছে। মতামত জমা দেওয়ার পর চূড়ান্ত সিদ্ধান্ত সক্রিয় হবে।',
                          'This claim is currently awaiting the referred veterinarian’s clinical opinion (claim.vetReview). Final decision controls unlock once the opinion is submitted.',
                        )}
                      </div>
                    ) : null}

                    {['submitted', 'manual_review'].includes(activeClaim.status) &&
                    (!activeClaim.vetId || Boolean(activeClaim.vetOpinion)) ? (
                      <div className="flex flex-col gap-3">
                        <TextareaField
                          label={t('চূড়ান্ত দাবি সিদ্ধান্ত নোট', 'Claim Decision Note')}
                          value={claimNote}
                          onChange={(e) => setClaimNote(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2.5">
                          <Button
                            variant="primary"
                            icon="check"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'claim.decide',
                                claimId: activeClaim.id,
                                approve: true,
                                note: claimNote,
                              })
                            }
                          >
                            {t('দাবি অনুমোদন করুন', 'Approve Claim')}
                          </Button>
                          <Button
                            variant="danger"
                            icon="close"
                            disabled={busy}
                            onClick={() =>
                              void run({
                                type: 'claim.decide',
                                claimId: activeClaim.id,
                                approve: false,
                                note: claimNote,
                              })
                            }
                          >
                            {t('দাবি প্রত্যাখ্যান করুন', 'Reject Claim')}
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {activeClaim.status === 'approved' ? (
                      <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4">
                        <div>
                          <div className="text-sm font-bold text-[#0A401E]">
                            {t('পেআউট ও ঋণ সমন্বয়ের জন্য প্রস্তুত', 'Ready for Atomic Payout')}
                          </div>
                          <div className="text-xs text-[#0F602D]">
                            {t(
                              'এক ক্লিকে ব্যাংকের বকেয়া ঋণ পরিশোধ ও অবশিষ্ট অর্থ খামারির ওয়ালেটে পাঠান।',
                              'Settle any secured bank debt first and credit the net payout to the farmer.',
                            )}
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          icon="wallet"
                          disabled={busy}
                          onClick={() =>
                            void run({ type: 'claim.pay', claimId: activeClaim.id })
                          }
                        >
                          {t('পেআউট সম্পন্ন করুন (Execute Payout)', 'Execute Atomic Payout')}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </Card>
              </div>
            )
          }
        />
      ) : null}

      {tab === 'policies' ? (
        <SplitWorkbench
          masterTitle={t('পলিসি আবেদন ও সক্রিয় পলিসি', 'Insurance Policies')}
          masterCount={myPolicies.length}
          masterList={myPolicies.map((pol) => {
            const animal = state.animals.find((a) => a.id === pol.animalId);
            const farmer = state.users.find((u) => u.id === pol.farmerId);
            const selected = activePolicy?.id === pol.id;
            return (
              <button
                key={pol.id}
                type="button"
                onClick={() => setSelectedPolicyId(pol.id)}
                className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-[#15803D] bg-[#EBF4EE]/60'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1F2937]">
                    {animal ? `${animal.name} (${animal.tag})` : pol.animalId}
                  </span>
                  <Badge tone={toneForStatus(pol.status)}>{pol.status}</Badge>
                </div>
                <div className="text-xs text-[#64748B] mt-1">
                  {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : pol.farmerId}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold tabular-nums">
                  <span className="text-[#0F602D]">
                    {t('কভারেজ:', 'Coverage:')} {money(pol.coverage)}
                  </span>
                  <span className="text-[#475569]">
                    {t('প্রিমিয়াম:', 'Premium:')} {money(pol.premium)}
                  </span>
                </div>
              </button>
            );
          })}
          detailPane={
            !activePolicy ? null : (
              <Card className="flex flex-col gap-4">
                <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937]">
                      {t('পলিসি আন্ডাররাইটিং বিবরণ', 'Policy Underwriting File')}
                    </h3>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      Policy ID: {activePolicy.id} · {date(activePolicy.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {policyAnimal ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(webHref('insurer', 'passport', policyAnimal.id));
                        }}
                      >
                        {t('স্বাস্থ্য পাসপোর্ট দেখুন', 'Open Health Passport')}
                      </Button>
                    ) : null}
                    <Badge tone={toneForStatus(activePolicy.status)}>{activePolicy.status}</Badge>
                  </div>
                </div>

                {policyAnimal ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[#1F2937]">
                        {policyAnimal.name} ({policyAnimal.tag}) — {policyAnimal.breed}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        {policyFarmer
                          ? locale === 'bn'
                            ? policyFarmer.nameBn
                            : policyFarmer.name
                          : activePolicy.farmerId}
                      </span>
                    </div>
                    <HealthScoreBar score={policyAnimal.healthScore} />
                  </div>
                ) : null}

                <div className="grid grid-cols-3 gap-3 text-xs tabular-nums">
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">{t('কভারেজ', 'Coverage')}</span>
                    <strong className="text-sm text-[#1F2937]">
                      {money(activePolicy.coverage)}
                    </strong>
                  </div>
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">{t('প্রিমিয়াম', 'Annual Premium')}</span>
                    <strong className="text-sm text-[#0F602D]">
                      {money(activePolicy.premium)}
                    </strong>
                  </div>
                  <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <span className="text-[#64748B] block">{t('আইওটি ছাড়', 'IoT Tier')}</span>
                    <strong className="text-sm text-[#15803D]">
                      {activePolicy.enhanced ? 'IoT Verified ✓' : 'Standard'}
                    </strong>
                  </div>
                </div>

                {activePolicy.status === 'submitted' ? (
                  <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-4">
                    <TextareaField
                      label={t('আন্ডাররাইটিং নোট', 'Underwriting Note')}
                      value={policyNote}
                      onChange={(e) => setPolicyNote(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2.5">
                      <Button
                        variant="primary"
                        icon="check"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'policy.decide',
                            policyId: activePolicy.id,
                            approve: true,
                            note: policyNote,
                          })
                        }
                      >
                        {t('পলিসি অনুমোদন ও ইস্যু করুন', 'Approve & Issue Policy')}
                      </Button>
                      <Button
                        variant="danger"
                        icon="close"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'policy.decide',
                            policyId: activePolicy.id,
                            approve: false,
                            note: policyNote,
                          })
                        }
                      >
                        {t('প্রত্যাখ্যান করুন', 'Reject Policy')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            )
          }
        />
      ) : null}

      {tab === 'passport' ? (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(webHref('insurer', 'claims'))}
                >
                  ← {t('দাবি কিউতে ফিরুন', 'Back to Claims')}
                </Button>
              </div>
              <h2 className="text-base font-bold text-[#1F2937]">
                {t('বীমাকৃত প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Insured Animal Digital Health Passport')}
              </h2>
              <p className="text-xs text-[#64748B]">
                {t(
                  'পলিসি আন্ডাররাইটিং ও দাবি যাচাইয়ের জন্য প্রাণীর সম্পূর্ণ ক্লিনিক্যাল পাসপোর্ট ও টিকার ইতিহাস।',
                  'Full clinical history and vaccination records for policy underwriting and claim forensics.',
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.animals.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedPassportAnimalId(a.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    passportAnimal?.id === a.id
                      ? 'bg-[#15803D] text-white'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
                  }`}
                >
                  {a.name} ({a.tag})
                </button>
              ))}
            </div>
          </div>

          {passportAnimal ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div>
                  <div className="text-base font-bold text-[#1F2937]">
                    {passportAnimal.name} ({passportAnimal.tag})
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {passportAnimal.breed} · {passportAnimal.sex} · {passportAnimal.weightKg} kg
                  </div>
                  <div className="text-sm font-bold text-[#0F602D] mt-1 tabular-nums">
                    {t('বাজারমূল্য:', 'Valuation:')} {money(passportAnimal.value)}
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-center gap-2">
                  <HealthScoreBar
                    score={passportAnimal.healthScore}
                    label={t('ক্লিনিক্যাল স্বাস্থ্য স্কোর', 'Clinical Health Score')}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      tone={
                        state.records.some(
                          (r) => r.animalId === passportAnimal.id && r.kind === 'vaccination',
                        )
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {state.records.some(
                        (r) => r.animalId === passportAnimal.id && r.kind === 'vaccination',
                      )
                        ? t('টিকাপ্রাপ্ত', 'Vaccinated')
                        : t('টিকা বাকি', 'Unvaccinated')}
                    </Badge>
                    <Badge
                      tone={
                        hasIoTEvidence(state, passportAnimal.id, state.now)
                          ? 'brand'
                          : 'neutral'
                      }
                    >
                      {hasIoTEvidence(state, passportAnimal.id, state.now)
                        ? t('আইওটি টেলিমেট্রি যাচাইকৃত', 'IoT Telemetry Verified')
                        : t('কলার অফলাইন', 'No Live Collar')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#E2E8F0] rounded-[12px] border border-[#E2E8F0]">
                {state.records
                  .filter((r) => r.animalId === passportAnimal.id)
                  .map((rec) => (
                    <div key={rec.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-[#1F2937]">
                          {rec.title[locale]} ({rec.kind})
                        </div>
                        <div className="text-[#475569] mt-0.5">{rec.note}</div>
                      </div>
                      <div className="text-[#64748B] tabular-nums shrink-0">
                        {date(rec.createdAt)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
