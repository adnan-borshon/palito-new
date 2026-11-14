'use client';

import { useMemo, useState } from 'react';
import { demoLoanQuote, hasIoTEvidence, maximumLoanAmount } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import {
  Badge,
  Button,
  Card,
  EmptyWorkspaceState,
  Field,
  HealthScoreBar,
  KpiCard,
  SplitWorkbench,
  TabsBar,
  TextareaField,
  toneForStatus,
  WebIcon,
} from '@/components/ui.tsx';

export function BankWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  const { state, locale, t, money, date, dateTime, run, busy, openMobileHandoff } =
    useWebApp();

  const [tab, setTab] = useState<'underwriting' | 'portfolio' | 'settlements'>(
    screen === 'loans' ? 'portfolio' : 'underwriting',
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    id ?? state.loans[0]?.id ?? '',
  );
  const [decisionNote, setDecisionNote] = useState('');
  const [graceDays, setGraceDays] = useState('14');
  const [graceNote, setGraceNote] = useState('Seasonal feed & milk collection cycle extension');

  const loans = useMemo(() => {
    return state.loans.filter((loan) => {
      if (statusFilter !== 'all' && loan.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const animal = state.animals.find((a) => a.id === loan.animalId);
      const farmer = state.users.find((u) => u.id === loan.farmerId);
      return (
        loan.id.toLowerCase().includes(q) ||
        loan.purpose.toLowerCase().includes(q) ||
        animal?.name.toLowerCase().includes(q) ||
        animal?.tag.toLowerCase().includes(q) ||
        farmer?.name.toLowerCase().includes(q) ||
        farmer?.nameBn.includes(q)
      );
    });
  }, [state.loans, state.animals, state.users, statusFilter, searchQuery]);

  const activeLoan =
    state.loans.find((l) => l.id === selectedLoanId) ?? loans[0] ?? state.loans[0];
  const collateralAnimal = activeLoan
    ? state.animals.find((a) => a.id === activeLoan.animalId)
    : undefined;
  const borrower = activeLoan
    ? state.users.find((u) => u.id === activeLoan.farmerId)
    : undefined;
  const borrowerFarm = borrower
    ? state.farms.find((f) => f.ownerId === borrower.id)
    : undefined;
  const collar = collateralAnimal
    ? state.devices.find((d) => d.animalId === collateralAnimal.id)
    : undefined;
  const animalPolicy = collateralAnimal
    ? state.policies.find(
        (p) => p.animalId === collateralAnimal.id && p.status === 'active',
      )
    : undefined;
  const animalRecords = collateralAnimal
    ? state.records.filter((r) => r.animalId === collateralAnimal.id)
    : [];

  const submittedCount = state.loans.filter((l) => l.status === 'submitted').length;
  const activeBookTotal = state.loans
    .filter((l) => ['active', 'approved'].includes(l.status))
    .reduce((sum, l) => sum + l.outstanding, 0);
  const settledClaims = state.claims.filter(
    (c) => c.status === 'paid' && (c.debtSettlement ?? 0) > 0,
  );
  const totalDebtSettled = settledClaims.reduce(
    (sum, c) => sum + (c.debtSettlement ?? 0),
    0,
  );

  const maxAllowedLtv = collateralAnimal
    ? maximumLoanAmount(collateralAnimal.value)
    : activeLoan
      ? maximumLoanAmount(activeLoan.collateralValue)
      : 0;
  const quote = collateralAnimal ? demoLoanQuote(collateralAnimal) : null;
  const ltvRatio =
    activeLoan && activeLoan.collateralValue > 0
      ? Math.round((activeLoan.amount / activeLoan.collateralValue) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Executive Underwriting KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('অপেক্ষমাণ ঋণ আবেদন', 'Pending Underwriting')}
          value={submittedCount}
          hint={t('সিদ্ধান্তের অপেক্ষায় থাকা আবেদন', 'Applications awaiting bank decision')}
          tone={submittedCount > 0 ? 'warning' : 'brand'}
          icon="file-check"
        />
        <KpiCard
          label={t('সক্রিয় ঋণ পোর্টফোলিও', 'Active Loan Book')}
          value={money(activeBookTotal)}
          hint={t('মোট বকেয়া আসল', 'Total outstanding principal')}
          tone="brand"
          icon="landmark"
        />
        <KpiCard
          label={t('সর্বোচ্চ জামানত সীমা (UC-003)', 'Max Collateral LTV Policy')}
          value="70%"
          hint={t('যাচাইকৃত প্রাণী মূল্যের ৭০% পর্যন্ত', 'Strict cap on verified livestock value')}
          tone="info"
          icon="shield-check"
        />
        <KpiCard
          label={t('বীমা থেকে স্বয়ংক্রিয় সমন্বয়', 'Insurance Debt Settlements')}
          value={money(totalDebtSettled)}
          hint={t('UC-002 ডেট-ফার্স্ট দাবি নিষ্পত্তি', 'Settled automatically from claims')}
          tone="success"
          icon="check"
        />
      </div>

      {/* Figma 24466:65462 Health-Score Interest Policy Banner */}
      <div className="rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/75 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#0A401E]">
          <WebIcon name="shield-check" className="w-5 h-5 text-[#15803D] shrink-0" />
          <span>
            {t(
              'উচ্চ স্বাস্থ্য স্কোর (৮৫+) ও সক্রিয় আইওটি কলারযুক্ত প্রাণীর ক্ষেত্রে অগ্রাধিকারমূলক ৯% বার্ষিক সুদের হার প্রযোজ্য।',
              'Livestock with verified Health Score 85+ and active IoT telemetry qualify for the preferential 9% annual interest tier.',
            )}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon="smartphone"
          onClick={() =>
            openMobileHandoff({
              role: 'bank',
              screen: screen || 'home',
              id: activeLoan?.id,
              title: t('ব্যাংক আন্ডাররাইটিং ডেস্ক', 'Bank Underwriting Desk'),
            })
          }
        >
          {t('মোবাইল ভিউ লিংক', 'Mobile View Link')}
        </Button>
      </div>

      {/* Primary Workbench Mode Tabs */}
      <TabsBar
        ariaLabel={t('ব্যাংক ওয়ার্কবেঞ্চ ট্যাব', 'Bank workbench sections')}
        active={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'underwriting',
            label: t('আন্ডাররাইটিং ও জামানত যাচাই কিউ', 'Underwriting & Collateral Queue'),
            count: state.loans.length,
          },
          {
            id: 'portfolio',
            label: t('সক্রিয় ঋণ ও কিস্তি সূচি টেবিল', 'Loan Portfolio & Grace Schedule'),
            count: state.loans.filter((l) => ['active', 'approved', 'paid'].includes(l.status))
              .length,
          },
          {
            id: 'settlements',
            label: t('বীমা দাবি থেকে ঋণ সমন্বয় (UC-002)', 'Collateral Insurance Settlements'),
            count: settledClaims.length,
          },
        ]}
      />

      {tab === 'underwriting' ? (
        <SplitWorkbench
          masterTitle={t('ঋণ আবেদন ও ফাইল তালিকা', 'Loan Applications & Files')}
          masterCount={loans.length}
          masterToolbar={
            <div className="flex flex-col gap-2.5">
              <Field
                label={t('খামারি, প্রাণী ট্যাগ বা উদ্দেশ্য খুঁজুন', 'Search borrower, tag, or purpose')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('যেমন: লালু, BL-101, দুগ্ধ...', 'e.g., Lalu, BL-101, Dairy...')}
              />
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'submitted', 'approved', 'active', 'settled', 'rejected'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#15803D] text-white'
                          : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
                      }`}
                    >
                      {st === 'all' ? t('সব', 'All') : st}
                    </button>
                  ),
                )}
              </div>
            </div>
          }
          masterList={
            loans.length === 0 ? (
              <EmptyWorkspaceState
                title={t('কোনো ঋণ ফাইল পাওয়া যায়নি', 'No matching loan applications')}
                description={t(
                  'ফিল্টার পরিবর্তন করে আবার দেখুন।',
                  'Try clearing your search or status filter.',
                )}
              />
            ) : (
              loans.map((loan) => {
                const animal = state.animals.find((a) => a.id === loan.animalId);
                const farmer = state.users.find((u) => u.id === loan.farmerId);
                const selected = activeLoan?.id === loan.id;
                const itemLtv =
                  loan.collateralValue > 0
                    ? Math.round((loan.amount / loan.collateralValue) * 100)
                    : 0;
                return (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#15803D] bg-[#EBF4EE]/60'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-[#1F2937]">
                          {farmer
                            ? locale === 'bn'
                              ? farmer.nameBn
                              : farmer.name
                            : loan.farmerId}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {animal ? `${animal.name} (${animal.tag})` : loan.animalId} ·{' '}
                          {loan.purpose}
                        </div>
                      </div>
                      <Badge tone={toneForStatus(loan.status)}>{loan.status}</Badge>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs font-semibold tabular-nums">
                      <span className="text-[#0F602D]">
                        {t('আবেদন:', 'Principal:')} {money(loan.amount)}
                      </span>
                      <span className="text-[#475569]">
                        LTV: {itemLtv}% · {loan.termMonths}m
                      </span>
                    </div>
                  </button>
                );
              })
            )
          }
          detailPane={
            !activeLoan ? (
              <EmptyWorkspaceState
                title={t('একটি ঋণ আবেদন নির্বাচন করুন', 'Select a loan application')}
                description={t(
                  'বাম পাশের তালিকা থেকে যেকোনো ঋণ ফাইল নির্বাচন করে বিস্তারিত যাচাই করুন।',
                  'Choose a loan from the queue to inspect the Animal Health Passport and LTV compliance.',
                )}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {/* Underwriting Header & LTV Calculator Card */}
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#1F2937]">
                          {t('ঋণ ফাইল ও জামানত মূল্যায়ন', 'Loan File & Collateral Underwriting')}
                        </h3>
                        <Badge tone={toneForStatus(activeLoan.status)}>
                          {activeLoan.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                        ID: {activeLoan.id} · {t('তৈরির তারিখ:', 'Created:')}{' '}
                        {dateTime(activeLoan.createdAt)}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="text-xs text-[#64748B]">
                        {t('আবেদনকৃত ঋণের পরিমাণ', 'Requested Principal')}
                      </div>
                      <div className="text-2xl font-bold text-[#0F602D]">
                        {money(activeLoan.amount)}
                      </div>
                    </div>
                  </div>

                  {/* 70% LTV Rule Verification Box */}
                  <div className="rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm font-bold text-[#0A401E]">
                      <span>
                        {t(
                          '৭০% জামানত সীমা যাচাই (UC-003 LTV Check)',
                          '70% Collateral LTV Cap Verification (UC-003)',
                        )}
                      </span>
                      <span className="tabular-nums">
                        {ltvRatio}% / 70% Max
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white overflow-hidden border border-[#D8E9DE]">
                      <div
                        className={`h-full rounded-full ${
                          activeLoan.amount <= maxAllowedLtv
                            ? 'bg-[#15803D]'
                            : 'bg-[#BE123C]'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((ltvRatio / 70) * 100))}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                      <div>
                        <span className="text-[#64748B] block">
                          {t('প্রাণীর যাচাইকৃত মূল্য', 'Verified Valuation')}
                        </span>
                        <strong className="text-[#1F2937] text-sm">
                          {money(activeLoan.collateralValue)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('সর্বোচ্চ অনুমোদনযোগ্য (৭০%)', 'Max Eligible (70%)')}
                        </span>
                        <strong className="text-[#15803D] text-sm">
                          {money(maxAllowedLtv)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('বার্ষিক সুদ ও মেয়াদ', 'Annual Rate & Term')}
                        </span>
                        <strong className="text-[#1F2937] text-sm">
                          {activeLoan.annualRate}% · {activeLoan.termMonths}m
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('মাসিক কিস্তি (প্রাক্কলিত)', 'Est. Monthly Installment')}
                        </span>
                        <strong className="text-[#1F2937] text-sm">
                          {money(
                            Math.ceil(
                              (activeLoan.amount *
                                (1 + (activeLoan.annualRate / 100) * (activeLoan.termMonths / 12))) /
                                activeLoan.termMonths,
                            ),
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Borrower & Repayment Source Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-[12px] border border-[#E2E8F0] p-3.5">
                      <div className="text-xs font-semibold text-[#64748B]">
                        {t('ঋণগ্রহীতা খামারির বিবরণ', 'Borrower Details')}
                      </div>
                      <div className="font-bold text-[#1F2937] mt-1">
                        {borrower
                          ? locale === 'bn'
                            ? borrower.nameBn
                            : borrower.name
                          : activeLoan.farmerId}
                      </div>
                      <div className="text-xs text-[#475569] mt-0.5 tabular-nums">
                        {borrower?.phone} · {borrowerFarm?.name ?? borrower?.district}
                      </div>
                      {borrowerFarm ? (
                        <div className="text-xs text-[#64748B] mt-0.5">
                          {borrowerFarm.address} ({borrowerFarm.size}{' '}
                          {t('টি প্রাণী', 'animals')})
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[12px] border border-[#E2E8F0] p-3.5">
                      <div className="text-xs font-semibold text-[#64748B]">
                        {t('ঋণের উদ্দেশ্য ও পরিশোধের উৎস', 'Loan Purpose & Repayment Source')}
                      </div>
                      <div className="font-bold text-[#1F2937] mt-1">{activeLoan.purpose}</div>
                      <div className="text-xs text-[#475569] mt-0.5">
                        {t('পরিশোধের উৎস:', 'Repayment source:')} {activeLoan.repaymentSource}
                      </div>
                      <div className="text-xs text-[#0F602D] font-semibold mt-1 tabular-nums">
                        {t('বর্তমান বকেয়া:', 'Current Outstanding:')}{' '}
                        {money(activeLoan.outstanding)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Collateral Animal Health Passport Inspector */}
                {collateralAnimal ? (
                  <Card className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-[#1F2937]">
                        {t(
                          'জামানত প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্ট',
                          'Collateral Animal Digital Health Passport',
                        )}
                      </h4>
                      <div className="flex items-center gap-2">
                        {hasIoTEvidence(state, collateralAnimal.id, state.now) ? (
                          <Badge tone="brand">
                            <WebIcon name="radio" className="w-3.5 h-3.5" />
                            {t('আইওটি টেলিমেট্রি সক্রিয়', 'IoT Telemetry Verified')}
                          </Badge>
                        ) : (
                          <Badge tone="warning">
                            {t('কলার অফলাইন', 'No Live Collar')}
                          </Badge>
                        )}
                        {animalPolicy ? (
                          <Badge tone="success">
                            {t('বীমাকৃত জামানত', 'Insured Collateral')}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/cow.jpg"
                          alt={collateralAnimal.name}
                          className="w-16 h-16 rounded-[12px] object-cover border border-[#E2E8F0]"
                        />
                        <div>
                          <div className="text-base font-bold text-[#1F2937]">
                            {collateralAnimal.name}
                          </div>
                          <div className="text-xs text-[#64748B] tabular-nums">
                            {collateralAnimal.tag} · {collateralAnimal.breed}
                          </div>
                          <div className="text-xs font-semibold text-[#0F602D] tabular-nums mt-0.5">
                            {collateralAnimal.weightKg} kg · {money(collateralAnimal.value)}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-2">
                        <HealthScoreBar
                          score={collateralAnimal.healthScore}
                          label={t('ক্লিনিক্যাল স্বাস্থ্য স্কোর', 'Clinical Health Score')}
                        />
                        <div className="flex flex-wrap gap-3 text-xs text-[#475569] tabular-nums">
                          <span>
                            {t('টিকা ও চেকআপ রেকর্ড:', 'Health Records:')}{' '}
                            <strong>{animalRecords.length}</strong>
                          </span>
                          {collar && collar.readings[0] ? (
                            <span>
                              {t('সর্বশেষ তাপমাত্রা:', 'Last Temp:')}{' '}
                              <strong>{collar.readings[0].temperature}°C</strong> · HR:{' '}
                              <strong>{collar.readings[0].heartRate} bpm</strong>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : null}

                {/* Bank Decision & Lifecycle Controls */}
                <Card className="flex flex-col gap-4">
                  <h4 className="text-base font-bold text-[#1F2937]">
                    {t('ব্যাংক আন্ডাররাইটিং সিদ্ধান্ত ও পদক্ষেপ', 'Bank Underwriting Actions')}
                  </h4>

                  {activeLoan.status === 'submitted' ? (
                    <div className="flex flex-col gap-3">
                      <TextareaField
                        label={t('আন্ডাররাইটিং নোট / শর্তাবলি', 'Underwriting Decision Note')}
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        placeholder={t(
                          'যেমন: স্বাস্থ্য পাসপোর্ট ও ৭০% এলটিভি যাচাই সম্পন্ন...',
                          'e.g., Verified digital health passport and 70% collateral cap compliance...',
                        )}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="primary"
                          icon="check"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'loan.decide',
                              loanId: activeLoan.id,
                              approve: true,
                              note:
                                decisionNote.trim() ||
                                'Approved after health passport and 70% LTV verification.',
                            })
                          }
                        >
                          {t('ঋণ অনুমোদন করুন', 'Approve Loan Application')}
                        </Button>
                        <Button
                          variant="danger"
                          icon="close"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'loan.decide',
                              loanId: activeLoan.id,
                              approve: false,
                              note:
                                decisionNote.trim() ||
                                'Declined during collateral underwriting review.',
                            })
                          }
                        >
                          {t('প্রত্যাখ্যান করুন', 'Reject Application')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {activeLoan.status === 'approved' ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4">
                      <div>
                        <div className="text-sm font-bold text-[#0A401E]">
                          {t('ঋণ বিতরণের জন্য প্রস্তুত', 'Ready for Disbursement')}
                        </div>
                        <div className="text-xs text-[#0F602D]">
                          {t(
                            'অনুমোদিত অর্থ খামারির পালিতো ওয়ালেটে তাৎক্ষণিকভাবে স্থানান্তর করুন।',
                            'Disburse approved funds directly into the borrower’s Palito wallet.',
                          )}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        icon="landmark"
                        disabled={busy}
                        onClick={() =>
                          void run({ type: 'loan.disburse', loanId: activeLoan.id })
                        }
                      >
                        {t('তহবিল বিতরণ করুন (Disburse)', 'Disburse Loan Funds')}
                      </Button>
                    </div>
                  ) : null}

                  {activeLoan.status === 'active' ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <Field
                          label={t('গ্রেস পিরিয়ড (দিন)', 'Grace Extension (Days)')}
                          type="number"
                          value={graceDays}
                          onChange={(e) => setGraceDays(e.target.value)}
                        />
                        <div className="sm:col-span-2">
                          <Field
                            label={t('মেয়াদ বৃদ্ধির কারণ', 'Grace Period Reason')}
                            value={graceNote}
                            onChange={(e) => setGraceNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#64748B] tabular-nums">
                          {activeLoan.dueAt
                            ? `${t('পরবর্তী কিস্তির তারিখ:', 'Due Date:')} ${date(activeLoan.dueAt)}`
                            : ''}
                          {activeLoan.graceUntil
                            ? ` · ${t('গ্রেস মেয়াদ:', 'Grace Until:')} ${date(activeLoan.graceUntil)}`
                            : ''}
                        </span>
                        <Button
                          variant="secondary"
                          icon="clock"
                          disabled={busy}
                          onClick={() =>
                            void run({
                              type: 'loan.grace',
                              loanId: activeLoan.id,
                              days: Math.max(1, Number(graceDays) || 14),
                              note: graceNote,
                            })
                          }
                        >
                          {t('গ্রেস পিরিয়ড মঞ্জুর করুন', 'Grant Grace Period')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {['offered', 'paid', 'settled', 'rejected'].includes(activeLoan.status) ? (
                    <div className="text-sm text-[#475569]">
                      {t('বর্তমান অবস্থা:', 'Current file status:')}{' '}
                      <strong className="text-[#1F2937]">{activeLoan.status}</strong>
                      {activeLoan.decisionNote ? ` — ${activeLoan.decisionNote}` : ''}
                    </div>
                  ) : null}
                </Card>
              </div>
            )
          }
        />
      ) : null}

      {tab === 'portfolio' ? (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('সক্রিয় ঋণ পোর্টফোলিও ও পরিশোধ সূচি', 'Active Loan Book & Repayment Schedule')}
            </h2>
            <Badge tone="brand" className="tabular-nums">
              {state.loans.length} {t('টি ফাইল', 'Files')}
            </Badge>
          </div>
          <div
            tabIndex={0}
            role="region"
            aria-label={t('ঋণ পোর্টফোলিও টেবিল', 'Loan portfolio table')}
            className="palito-table-region"
          >
            <table className="text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="px-5 py-3">{t('খামারি ও প্রাণী', 'Borrower & Animal')}</th>
                  <th className="px-4 py-3">{t('জামানত মূল্য', 'Collateral Value')}</th>
                  <th className="px-4 py-3">{t('ঋণের পরিমাণ', 'Principal')}</th>
                  <th className="px-4 py-3">{t('বকেয়া', 'Outstanding')}</th>
                  <th className="px-4 py-3">{t('সুদ ও মেয়াদ', 'Rate & Term')}</th>
                  <th className="px-4 py-3">{t('অবস্থা', 'Status')}</th>
                  <th className="px-5 py-3 text-right">{t('পদক্ষেপ', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {state.loans.map((loan) => {
                  const farmer = state.users.find((u) => u.id === loan.farmerId);
                  const animal = state.animals.find((a) => a.id === loan.animalId);
                  return (
                    <tr key={loan.id} className="hover:bg-[#F8FAFC]">
                      <th className="px-5 py-3.5 font-semibold text-[#1F2937]">
                        <div>
                          {farmer
                            ? locale === 'bn'
                              ? farmer.nameBn
                              : farmer.name
                            : loan.farmerId}
                        </div>
                        <div className="text-xs font-normal text-[#64748B]">
                          {animal ? `${animal.name} (${animal.tag})` : loan.animalId} ·{' '}
                          {loan.purpose}
                        </div>
                      </th>
                      <td className="px-4 py-3.5 tabular-nums">{money(loan.collateralValue)}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#0F602D] tabular-nums">
                        {money(loan.amount)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums">
                        {money(loan.outstanding)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">
                        {loan.annualRate}% · {loan.termMonths}m
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={toneForStatus(loan.status)}>{loan.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLoanId(loan.id);
                            setTab('underwriting');
                          }}
                        >
                          {t('বিস্তারিত', 'Inspect')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'settlements' ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">
                {t(
                  'জামানত বীমা দাবি থেকে স্বয়ংক্রিয় ঋণ সমন্বয় (UC-002)',
                  'Collateral Insurance Debt-First Settlements (UC-002)',
                )}
              </h2>
              <p className="text-xs text-[#64748B]">
                {t(
                  'জামানতকৃত প্রাণীর মৃত্যু বা দাবির ক্ষেত্রে প্রথমে ব্যাংকের বকেয়া ঋণ পরিশোধিত হয় এবং অবশিষ্ট অর্থ খামারির ওয়ালেটে জমা হয়।',
                  'When a claim is paid on a pledged animal, outstanding bank debt is settled first before crediting the remainder to the farmer.',
                )}
              </p>
            </div>
          </div>

          {settledClaims.length === 0 ? (
            <EmptyWorkspaceState
              title={t('এখনো কোনো বীমা-ঋণ সমন্বয় হয়নি', 'No collateral claim settlements yet')}
              description={t(
                'বীমা প্রতিষ্ঠান কোনো জামানতকৃত প্রাণীর দাবি পরিশোধ করলে এখানে স্বয়ংক্রিয় হিসাব দেখা যাবে।',
                'Once the insurer executes payout on a pledged animal claim, the debt-first split appears here automatically.',
              )}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settledClaims.map((claim) => {
                const animal = state.animals.find((a) => a.id === claim.animalId);
                return (
                  <div
                    key={claim.id}
                    className="rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0A401E]">
                        {animal ? `${animal.name} (${animal.tag})` : claim.animalId}
                      </span>
                      <Badge tone="success">{t('সমন্বয়কৃত', 'Settled')}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 text-xs tabular-nums">
                      <div>
                        <span className="text-[#64748B] block">
                          {t('মোট বীমা পেআউট', 'Total Claim Payout')}
                        </span>
                        <strong className="text-sm text-[#1F2937]">
                          {money(claim.payout ?? claim.amount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('ব্যাংক ঋণ কর্তন', 'Bank Debt Settled')}
                        </span>
                        <strong className="text-sm text-[#15803D]">
                          {money(claim.debtSettlement ?? 0)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">
                          {t('খামারির প্রাপ্য', 'Farmer Net Credit')}
                        </span>
                        <strong className="text-sm text-[#0F602D]">
                          {money(claim.farmerPayout ?? 0)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
