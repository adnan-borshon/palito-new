'use client';

import { useState } from 'react';
import type { DemoScenario, Education, Role } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { roleNames } from '@/navigation.ts';
import {
  Badge,
  Button,
  Card,
  Field,
  KpiCard,
  SelectField,
  SplitWorkbench,
  TextareaField,
  toneForStatus,
} from '@/components/ui.tsx';

export function AdminWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  const { state, locale, t, money, dateTime, run, busy, user } = useWebApp();

  const tab: 'overview' | 'users' | 'cms' | 'reports' =
    screen === 'users' || screen === 'user'
      ? 'users'
      : screen === 'content' || screen === 'article'
        ? 'cms'
        : screen === 'reports' || screen === 'audit'
          ? 'reports'
          : 'overview';

  // Users filter state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');

  // CMS state
  const [editingId, setEditingId] = useState<string | undefined>(
    (screen === 'content' || screen === 'article') && id ? id : state.content[0]?.id,
  );
  const selectedArticle = state.content.find((c) => c.id === editingId);
  const [titleBn, setTitleBn] = useState(
    selectedArticle?.title.bn ?? 'গবাদিপশুর তাপজনিত স্ট্রেস প্রতিরোধ নির্দেশিকা',
  );
  const [titleEn, setTitleEn] = useState(
    selectedArticle?.title.en ?? 'Heat Stress Prevention Guide for Dairy Cattle',
  );
  const [bodyBn, setBodyBn] = useState(
    selectedArticle?.body.bn ??
      'গ্রীষ্মকালে ছায়াযুক্ত শেড, পর্যাপ্ত বিশুদ্ধ পানি এবং কলার তাপমাত্রা ৩৯.০°সে এর নিচে রাখা নিশ্চিত করুন।',
  );
  const [bodyEn, setBodyEn] = useState(
    selectedArticle?.body.en ??
      'Maintain shaded ventilation, clean drinking water, and monitor collar temperature below 39.0°C during summer months.',
  );
  const [category, setCategory] = useState<Education['category']>(
    selectedArticle?.category ?? 'health',
  );
  const [artStatus, setArtStatus] = useState<Education['status']>(
    selectedArticle?.status ?? 'published',
  );

  // Audit filter
  const [auditSearch, setAuditSearch] = useState('');

  const filteredUsers = state.users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.nameBn.includes(q) ||
      u.phone.includes(q) ||
      u.district.toLowerCase().includes(q)
    );
  });

  const filteredAudit = state.audit.filter((ev) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      ev.action.toLowerCase().includes(q) ||
      ev.actorId.toLowerCase().includes(q) ||
      (ev.entityId ?? '').toLowerCase().includes(q)
    );
  });

  const totalLoanVolume = state.loans.reduce((sum, l) => sum + l.amount, 0);
  const totalPolicyCoverage = state.policies.reduce((sum, p) => sum + p.coverage, 0);

  function loadArticleIntoEditor(article?: Education) {
    if (!article) {
      setEditingId(undefined);
      setTitleBn('');
      setTitleEn('');
      setBodyBn('');
      setBodyEn('');
      setCategory('health');
      setArtStatus('published');
      return;
    }
    setEditingId(article.id);
    setTitleBn(article.title.bn);
    setTitleEn(article.title.en);
    setBodyBn(article.body.bn);
    setBodyEn(article.body.en);
    setCategory(article.category);
    setArtStatus(article.status);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Platform Governance KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('নিবন্ধিত ব্যবহারকারী (৫ রোল)', 'Total Platform Users')}
          value={state.users.length}
          hint={t(
            `${state.users.filter((u) => u.status === 'active').length} জন সক্রিয়`,
            `${state.users.filter((u) => u.status === 'active').length} active accounts`,
          )}
          tone="brand"
          icon="users"
        />
        <KpiCard
          label={t('নিবন্ধিত প্রাণী ও কলার', 'Registered Livestock & Collars')}
          value={`${state.animals.length} / ${state.devices.length}`}
          hint={t('ডিজিটাল পাসপোর্ট ও আইওটি যুক্ত', 'Health passports & IoT collars')}
          tone="success"
          icon="paw"
        />
        <KpiCard
          label={t('মোট কৃষি ঋণ ও বীমা কভারেজ', 'Loan & Insurance Volume')}
          value={money(totalLoanVolume + totalPolicyCoverage)}
          hint={t('সমন্বিত আর্থিক সুরক্ষা', 'Combined credit & policy book')}
          tone="info"
          icon="landmark"
        />
        <KpiCard
          label={t('অডিট লগ ও কার্যক্রম', 'Recorded Audit Events')}
          value={state.audit.length}
          hint={t(`সিস্টেম রিভিশন #${state.revision}`, `State revision #${state.revision}`)}
          tone="brand"
          icon="bar-chart-3"
        />
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('সিস্টেম সময় ও পরিবেশ নিয়ন্ত্রণ', 'System Clock & Environment Controls')}
            </h2>
            <p className="text-xs text-[#64748B]">
              {t(
                'বর্তমান সিস্টেম সময়:',
                'Current platform timestamp (Asia/Dhaka):',
              )}{' '}
              <strong className="text-[#1F2937] tabular-nums">{dateTime(state.now)}</strong>
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon="clock"
                disabled={busy}
                onClick={() => void run({ type: 'demo.advanceTime', hours: 4 })}
              >
                {t('+৪ ঘণ্টা (অমীমাংসিত সতর্কতা এসকেলেট)', '+4 Hours (Escalate Unresolved Alerts)')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="clock"
                disabled={busy}
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 })}
              >
                {t('+২৪ ঘণ্টা', '+24 Hours')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="clock"
                disabled={busy}
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 * 7 })}
              >
                {t('+৭ দিন (দাবি ও পলিসি ফলোআপ)', '+7 Days (Claim & Policy Follow-up)')}
              </Button>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-[#475569]">
                {t('অপারেশনাল ডেটা প্রিসেট ও নেটওয়ার্ক মোড', 'Operational Data Presets & Network State')}
              </span>
              <div className="flex flex-wrap gap-2">
                {(['normal', 'health', 'insurance', 'lending', 'empty'] as DemoScenario[]).map(
                  (scen) => (
                    <Button
                      key={scen}
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void run({ type: 'demo.reset', scenario: scen })}
                    >
                      {t(`প্রিসেট: ${scen}`, `Load Preset: ${scen}`)}
                    </Button>
                  ),
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant={state.settings.offline ? 'danger' : 'outline'}
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void run({
                      type: 'demo.offline',
                      offline: !state.settings.offline,
                    })
                  }
                >
                  {state.settings.offline
                    ? t('অফলাইন সক্রিয় — অনলাইন করুন', 'Offline Active — Go Online')
                    : t('অফলাইন মোড সিমুলেট করুন', 'Simulate Offline Mode')}
                </Button>
                <Button
                  variant={state.settings.failNext ? 'danger' : 'outline'}
                  size="sm"
                  disabled={busy}
                  onClick={() => void run({ type: 'demo.failNext' })}
                >
                  {state.settings.failNext
                    ? t('পরবর্তী অ্যাকশন ব্যর্থ হবে (সক্রিয়)', 'Fail Next Action Armed')
                    : t('পরবর্তী অ্যাকশন রিট্রাই টেস্ট', 'Test Retry on Next Action')}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('মডিউলভিত্তিক অপারেশনাল সারাংশ', 'Cross-Module Operational Summary')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs tabular-nums">
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('খামার ও প্রাণী', 'Farms & Animals')}</span>
                <strong className="text-base text-[#1F2937]">
                  {state.farms.length} / {state.animals.length}
                </strong>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('সক্রিয় সতর্কতা', 'Health Alerts')}</span>
                <strong className="text-base text-[#BE123C]">
                  {state.alerts.filter((a) => a.status !== 'resolved').length}
                </strong>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('ভেট সাক্ষাৎ', 'Vet Consultations')}</span>
                <strong className="text-base text-[#15803D]">
                  {state.appointments.length}
                </strong>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('বীমা পলিসি ও দাবি', 'Policies & Claims')}</span>
                <strong className="text-base text-[#1F2937]">
                  {state.policies.length} / {state.claims.length}
                </strong>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('ঋণ ফাইল', 'Loan Files')}</span>
                <strong className="text-base text-[#0F602D]">{state.loans.length}</strong>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] p-3">
                <span className="text-[#64748B] block">{t('মার্কেটপ্লেস অর্ডার', 'Marketplace Orders')}</span>
                <strong className="text-base text-[#1F2937]">{state.orders.length}</strong>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'users' ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex flex-wrap items-end justify-between gap-4">
            <div className="w-full sm:w-72">
              <Field
                label={t('নাম, ফোন বা জেলা দিয়ে খুঁজুন', 'Search by name, phone, or district')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="+88017..."
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'farmer', 'vet', 'bank', 'insurer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#15803D] text-white'
                      : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
                  }`}
                >
                  {r === 'all' ? t('সব রোল', 'All Roles') : roleNames[r][locale]}
                </button>
              ))}
            </div>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label={t('ব্যবহারকারী তালিকা টেবিল', 'Users and role management table')}
            className="palito-table-region"
          >
            <table className="text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="px-5 py-3">{t('ব্যবহারকারী', 'User')}</th>
                  <th className="px-4 py-3">{t('মোবাইল ও জেলা', 'Phone & District')}</th>
                  <th className="px-4 py-3">{t('রোল নির্ধারণ', 'Assigned Role')}</th>
                  <th className="px-4 py-3">{t('অবস্থা', 'Status')}</th>
                  <th className="px-5 py-3 text-right">{t('অ্যাক্সেস নিয়ন্ত্রণ', 'Access Control')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredUsers.map((account) => {
                  const isSelf = account.id === user?.id;
                  const hasLinkedRecords =
                    state.farms.some((f) => f.ownerId === account.id) ||
                    state.animals.some((a) => a.ownerId === account.id) ||
                    state.appointments.some(
                      (a) => a.farmerId === account.id || a.vetId === account.id,
                    ) ||
                    state.prescriptions.some(
                      (p) => p.farmerId === account.id || p.vetId === account.id,
                    ) ||
                    state.policies.some(
                      (p) => p.farmerId === account.id || p.insurerId === account.id,
                    ) ||
                    state.claims.some(
                      (c) =>
                        c.farmerId === account.id ||
                        c.insurerId === account.id ||
                        c.vetId === account.id,
                    ) ||
                    state.loans.some(
                      (l) => l.farmerId === account.id || l.bankId === account.id,
                    ) ||
                    state.orders.some((o) => o.farmerId === account.id) ||
                    state.payments.some((p) => p.userId === account.id);
                  return (
                    <tr key={account.id} className="hover:bg-[#F8FAFC]">
                      <th className="px-5 py-3.5 font-semibold text-[#1F2937]">
                        <div>{locale === 'bn' ? account.nameBn : account.name}</div>
                        <div className="text-xs font-normal text-[#64748B]">ID: {account.id}</div>
                      </th>
                      <td className="px-4 py-3.5 tabular-nums">
                        <div>{account.phone}</div>
                        <div className="text-xs text-[#64748B]">{account.district}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <select
                            aria-label={`Role for ${account.name}`}
                            value={account.role}
                            disabled={busy || isSelf || hasLinkedRecords}
                            onChange={(e) =>
                              void run({
                                type: 'admin.userRole',
                                userId: account.id,
                                role: e.target.value as Role,
                              })
                            }
                            className="rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#1F2937] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                          >
                            {(['farmer', 'vet', 'bank', 'insurer', 'admin'] as Role[]).map((r) => (
                              <option key={r} value={r}>
                                {roleNames[r][locale]}
                              </option>
                            ))}
                          </select>
                          {isSelf ? (
                            <span className="text-[11px] text-[#64748B]">
                              {t('বর্তমান অ্যাডমিন', 'Current admin')}
                            </span>
                          ) : hasLinkedRecords ? (
                            <span className="text-[11px] text-[#64748B]">
                              {t('রোল লকড (সংযুক্ত রেকর্ড রয়েছে)', 'Role locked (linked records)')}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={toneForStatus(account.status)}>{account.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant={account.status === 'active' ? 'outline' : 'primary'}
                          size="sm"
                          disabled={busy || isSelf}
                          onClick={() =>
                            void run({
                              type: 'admin.userStatus',
                              userId: account.id,
                              status: account.status === 'active' ? 'suspended' : 'active',
                            })
                          }
                        >
                          {isSelf
                            ? t('নিজ অ্যাকাউন্ট', 'Self')
                            : account.status === 'active'
                              ? t('স্থগিত করুন', 'Suspend')
                              : t('সক্রিয় করুন', 'Activate')}
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

      {tab === 'cms' ? (
        <SplitWorkbench
          masterTitle={t('প্রকাশিত ও খসড়া নিবন্ধ তালিকা', 'Educational Articles')}
          masterCount={state.content.length}
          masterToolbar={
            <Button
              variant="secondary"
              size="sm"
              icon="plus"
              onClick={() => loadArticleIntoEditor(undefined)}
            >
              {t('নতুন নিবন্ধ তৈরি করুন', 'Create New Article')}
            </Button>
          }
          masterList={state.content.map((art) => {
            const selected = editingId === art.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => loadArticleIntoEditor(art)}
                className={`w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-[#15803D] bg-[#EBF4EE]/60'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-[#1F2937]">
                    {art.title[locale]}
                  </span>
                  <Badge tone={toneForStatus(art.status)}>{art.status}</Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{art.body[locale]}</p>
                <div className="text-[11px] text-[#64748B] mt-1.5 tabular-nums">
                  {art.category.toUpperCase()} · {dateTime(art.updatedAt)}
                </div>
              </button>
            );
          })}
          detailPane={
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {editingId
                    ? t('নিবন্ধ সম্পাদনা করুন (বাংলা ও English)', 'Edit Bilingual Article')
                    : t('নতুন শিক্ষামূলক নিবন্ধ প্রকাশ করুন', 'Compose New Bilingual Article')}
                </h3>
                {editingId ? <Badge tone="brand">ID: {editingId}</Badge> : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label={t('বিভাগ (Category)', 'Category')}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Education['category'])}
                  options={[
                    { value: 'health', label: t('প্রাণী স্বাস্থ্য (Health)', 'Health') },
                    { value: 'nutrition', label: t('পুষ্টি ও খাদ্য (Nutrition)', 'Nutrition') },
                    { value: 'finance', label: t('ঋণ ও বীমা (Finance)', 'Finance') },
                  ]}
                />
                <SelectField
                  label={t('প্রকাশের অবস্থা', 'Publication Status')}
                  value={artStatus}
                  onChange={(e) => setArtStatus(e.target.value as Education['status'])}
                  options={[
                    { value: 'published', label: t('প্রকাশিত (Published)', 'Published') },
                    { value: 'draft', label: t('খসড়া (Draft)', 'Draft') },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={t('শিরোনাম (বাংলা)', 'Title (Bangla)')}
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                />
                <Field
                  label={t('শিরোনাম (English)', 'Title (English)')}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label={t('বিস্তারিত বিষয়বস্তু (বাংলা)', 'Article Body (Bangla)')}
                  rows={5}
                  value={bodyBn}
                  onChange={(e) => setBodyBn(e.target.value)}
                />
                <TextareaField
                  label={t('বিস্তারিত বিষয়বস্তু (English)', 'Article Body (English)')}
                  rows={5}
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  icon="check"
                  disabled={busy}
                  onClick={() =>
                    void run({
                      type: 'content.save',
                      id: editingId,
                      title: { bn: titleBn, en: titleEn },
                      body: { bn: bodyBn, en: bodyEn },
                      category,
                      status: artStatus,
                    })
                  }
                >
                  {t('নিবন্ধ সংরক্ষণ ও প্রকাশ করুন', 'Save & Publish Content')}
                </Button>
              </div>
            </Card>
          }
        />
      ) : null}

      {tab === 'reports' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('গবাদিপশু ও ভেটেরিনারি রিপোর্ট সারাংশ', 'Livestock & Veterinary Summary')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('নিবন্ধিত খামার', 'Farms')}</span>
                  <strong className="text-base text-[#1F2937]">{state.farms.length}</strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('নিবন্ধিত প্রাণী', 'Animals')}</span>
                  <strong className="text-base text-[#0F602D]">{state.animals.length}</strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('সক্রিয় কলার', 'Connected Collars')}</span>
                  <strong className="text-base text-[#15803D]">
                    {state.devices.filter((d) => d.connected).length}/{state.devices.length}
                  </strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('প্রেসক্রিপশন', 'Prescriptions')}</span>
                  <strong className="text-base text-[#1F2937]">{state.prescriptions.length}</strong>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">
                {t('বীমা, ব্যাংক ঋণ ও ই-কমার্স সারাংশ', 'Insurance, Lending & Commerce Summary')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('সক্রিয় পলিসি', 'Active Policies')}</span>
                  <strong className="text-base text-[#15803D]">
                    {state.policies.filter((p) => p.status === 'active').length}
                  </strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('পরিশোধিত দাবি', 'Paid Claims')}</span>
                  <strong className="text-base text-[#0F602D]">
                    {state.claims.filter((c) => c.status === 'paid').length}
                  </strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('সক্রিয়/সমন্বিত ঋণ', 'Active/Settled Loans')}</span>
                  <strong className="text-base text-[#1F2937]">
                    {state.loans.filter((l) => ['active', 'settled', 'paid'].includes(l.status)).length}
                  </strong>
                </div>
                <div className="rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className="text-[#64748B] block">{t('মোট অর্ডার মূল্য', 'Order GMV')}</span>
                  <strong className="text-base text-[#0F602D]">
                    {money(state.orders.reduce((s, o) => s + o.total, 0))}
                  </strong>
                </div>
              </div>
            </Card>
          </div>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">
                  {t('মার্কেটপ্লেস অর্ডার ডেলিভারি ও ফুলফিলমেন্ট (order.advance)', 'Marketplace Order Fulfillment & Delivery Progression')}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {t(
                    'অ্যাডমিন প্যানেল থেকে খামারিদের অর্ডারের ডেলিভারি ধাপ অগ্রসর করুন (Placed → Confirmed → Shipped → Delivered)।',
                    'Advance farmer marketplace orders through fulfillment stages (Placed → Confirmed → Shipped → Delivered).',
                  )}
                </p>
              </div>
              <Badge tone="brand">{state.orders.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.orders.map((ord) => {
                const farmer = state.users.find((u) => u.id === ord.farmerId);
                const canAdvance = ['placed', 'confirmed', 'shipped'].includes(ord.status);
                return (
                  <div
                    key={ord.id}
                    className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1F2937]">
                        Order {ord.id} · {money(ord.total)}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {farmer ? (locale === 'bn' ? farmer.nameBn : farmer.name) : ord.farmerId} ·{' '}
                        {ord.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={toneForStatus(ord.status)}>{ord.status}</Badge>
                      {canAdvance ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => void run({ type: 'order.advance', orderId: ord.id })}
                        >
                          {t('পরবর্তী ধাপ', 'Advance Stage')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">
                {t('অডিট লগ ও কার্যক্রম রিপোর্ট', 'Platform Audit Trail & Activity Report')}
              </h2>
              <p className="text-xs text-[#64748B]">
                {t(
                  'সকল রোলের প্রতিটি কমান্ড ও পরিবর্তন এখানে কালানুক্রমিকভাবে সংরক্ষিত।',
                  'Chronological ledger of all actions executed across Farmer, Vet, Bank, Insurer, and Admin roles.',
                )}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Field
                label={t('অ্যাকশন বা ইউজার আইডি খুঁজুন', 'Filter by action or actor ID')}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="loan.decide, claim.pay..."
              />
            </div>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label={t('অডিট ট্রেইল টেবিল', 'Audit log table')}
            className="palito-table-region"
          >
            <table className="text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="px-5 py-3">{t('সময় (Asia/Dhaka)', 'Timestamp')}</th>
                  <th className="px-4 py-3">{t('সম্পাদনকারী (Actor)', 'Actor')}</th>
                  <th className="px-4 py-3">{t('কমান্ড / অ্যাকশন', 'Action')}</th>
                  <th className="px-4 py-3">{t('এনটিটি আইডি', 'Entity ID')}</th>
                  <th className="px-5 py-3">{t('বিবরণ', 'Detail')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredAudit
                  .slice()
                  .reverse()
                  .map((ev) => {
                    const actorUser = state.users.find((u) => u.id === ev.actorId);
                    return (
                      <tr key={ev.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3 text-xs tabular-nums text-[#64748B]">
                          {dateTime(ev.at)}
                        </td>
                        <th className="px-4 py-3 font-semibold text-[#1F2937]">
                          {actorUser
                            ? `${locale === 'bn' ? actorUser.nameBn : actorUser.name} (${actorUser.role})`
                            : ev.actorId}
                        </th>
                        <td className="px-4 py-3">
                          <Badge tone="brand">{ev.action}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#475569]">
                          {ev.entityId ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-xs text-[#475569]">{ev.detail}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
