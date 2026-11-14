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
  TabsBar,
  TextareaField,
  toneForStatus,
} from '@/components/ui.tsx';

export function AdminWebFeature({ screen }: { screen: string }) {
  const { state, locale, t, money, dateTime, run, busy } = useWebApp();

  const initialTab =
    screen === 'users'
      ? 'users'
      : screen === 'content'
        ? 'cms'
        : screen === 'reports'
          ? 'reports'
          : 'overview';
  const [tab, setTab] = useState<'overview' | 'users' | 'cms' | 'reports'>(initialTab);

  // Users filter state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');

  // CMS state
  const [editingId, setEditingId] = useState<string | undefined>(
    state.content[0]?.id,
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

      <TabsBar
        ariaLabel={t('অ্যাডমিন কনসোল ট্যাব', 'Admin console tabs')}
        active={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'overview',
            label: t('সিস্টেম ওভারভিউ ও অপারেশনস নিয়ন্ত্রণ', 'System Overview & Clock Controls'),
          },
          {
            id: 'users',
            label: t('ব্যবহারকারী ও রোল অ্যাক্সেস ডিরেক্টরি', 'Users & Role Access Directory'),
            count: state.users.length,
          },
          {
            id: 'cms',
            label: t('শিক্ষামূলক কন্টেন্ট সিএমএস (CMS)', 'Bilingual Educational CMS'),
            count: state.content.length,
          },
          {
            id: 'reports',
            label: t('অডিট ট্রেইল ও অপারেশনস রিপোর্ট', 'Audit Logs & Reports'),
            count: state.audit.length,
          },
        ]}
      />

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('সিস্টেম সময়, এসএলএ ও পরিবেশ নিয়ন্ত্রণ', 'System Clock, SLA Escalation & Environment')}
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
                {t('+৪ ঘণ্টা (UC-001 সতর্কতা এসকেলেট)', '+4 Hours (Trigger UC-001 Escalation)')}
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
                {t('+৭ দিন (দাবি ও পলিসি ফলোআপ)', '+7 Days (Claim SLA Check)')}
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
                {filteredUsers.map((account) => (
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
                      <select
                        aria-label={`Role for ${account.name}`}
                        value={account.role}
                        disabled={busy}
                        onChange={(e) =>
                          void run({
                            type: 'admin.userRole',
                            userId: account.id,
                            role: e.target.value as Role,
                          })
                        }
                        className="rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#1F2937]"
                      >
                        {(['farmer', 'vet', 'bank', 'insurer', 'admin'] as Role[]).map((r) => (
                          <option key={r} value={r}>
                            {roleNames[r][locale]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={toneForStatus(account.status)}>{account.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={account.status === 'active' ? 'outline' : 'primary'}
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run({
                            type: 'admin.userStatus',
                            userId: account.id,
                            status: account.status === 'active' ? 'suspended' : 'active',
                          })
                        }
                      >
                        {account.status === 'active'
                          ? t('স্থগিত করুন', 'Suspend')
                          : t('সক্রিয় করুন', 'Activate')}
                      </Button>
                    </td>
                  </tr>
                ))}
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
      ) : null}
    </div>
  );
}
