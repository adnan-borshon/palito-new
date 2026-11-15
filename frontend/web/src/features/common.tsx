'use client';

import Image from 'next/image';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS, type DemoScenario, type Role } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { COMMON_WEB_SCREENS, roleNames, webHref } from '@/navigation.ts';
import {
  Badge,
  Button,
  Card,
  EmptyWorkspaceState,
  Field,
  TabsBar,
  TextareaField,
  WebIcon,
} from '@/components/ui.tsx';

export { COMMON_WEB_SCREENS };

export function CommonWebFeature({
  screen,
  id,
}: {
  screen: string;
  id?: string;
}) {
  if (screen === 'notifications') return <NotificationsWorkspace id={id} />;
  if (screen === 'support') return <SupportWorkspace />;
  if (screen === 'demo') return <DemoControlsWorkspace />;
  return <ProfileWorkspace />;
}

function NotificationsWorkspace({ id }: { id?: string }) {
  const { state, user, role, locale, t, dateTime, run, busy, clearError, clearFeedback } = useWebApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const owned = state.notifications.filter((n) => n.userId === user?.id);
  const unread = owned.filter((n) => !n.read).length;
  const selected = id ? owned.find((n) => n.id === id) : undefined;
  const items = selected
    ? [selected]
    : owned
        .filter((n) => filter === 'all' || !n.read)
        .slice()
        .reverse();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">
            {t('বিজ্ঞপ্তি ও সতর্কতা কেন্দ্র', 'Notifications & Activity Alerts')}
          </h1>
          <p className="text-sm text-[#64748B]">
            {t(
              `মোট ${owned.length}টি বিজ্ঞপ্তি · ${unread}টি অপঠিত`,
              `${owned.length} total notifications · ${unread} unread`,
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected && role ? (
            <Link
              href={webHref(role, 'notifications')}
              className="rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
            >
              {t('সব বিজ্ঞপ্তি দেখুন', 'Show All Notifications')}
            </Link>
          ) : null}
          {unread > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              icon="check"
              disabled={busy}
              onClick={() => void run({ type: 'notification.read' })}
            >
              {t('সব পঠিত হিসেবে চিহ্নিত করুন', 'Mark All as Read')}
            </Button>
          ) : null}
        </div>
      </div>

      {!selected ? (
        <TabsBar
          ariaLabel={t('বিজ্ঞপ্তি ফিল্টার', 'Notification filter')}
          active={filter}
          onChange={setFilter}
          tabs={[
            { id: 'all', label: t('সব বার্তা', 'All'), count: owned.length },
            { id: 'unread', label: t('অপঠিত', 'Unread'), count: unread },
          ]}
        />
      ) : null}

      {items.length === 0 ? (
        <EmptyWorkspaceState
          title={t('কোনো বিজ্ঞপ্তি নেই', 'No notifications here')}
          description={t(
            'নতুন ঋণ সিদ্ধান্ত, পরামর্শ বা সতর্কতা এলে এখানে দেখা যাবে।',
            'Updates on loans, consultations, claims, and health alerts will appear here.',
          )}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const targetScreen =
              item.screen === 'review-overdue' ? 'claim' : (item.screen ?? 'home');
            return (
              <Card
                key={item.id}
                tinted={!item.read}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-[10px] shrink-0 ${
                      item.read
                        ? 'bg-[#F8FAFC] text-[#64748B]'
                        : 'bg-[#15803D] text-white'
                    }`}
                  >
                    <WebIcon name="bell" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {item.title[locale]}
                      </span>
                      {!item.read ? (
                        <Badge tone="brand">{t('নতুন', 'New')}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-[#475569] mt-0.5">{item.body[locale]}</p>
                    <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                      {dateTime(item.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run({ type: 'notification.read', notificationId: item.id })
                      }
                    >
                      {t('পঠিত', 'Mark Read')}
                    </Button>
                  ) : null}
                  {role ? (
                    <Link
                      href={webHref(role, targetScreen, item.entityId)}
                      onClick={() => {
                        clearError();
                        clearFeedback();
                        if (!item.read) {
                          void run(
                            { type: 'notification.read', notificationId: item.id },
                            { silent: true },
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-[8px] bg-[#EBF4EE] px-3 py-1.5 text-xs font-semibold text-[#0F602D] hover:bg-[#D8E9DE]"
                    >
                      <span>{t('সংশ্লিষ্ট পাতায় যান', 'Open Record')}</span>
                      <WebIcon name="chevron-right" className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileWorkspace() {
  const { state, user, role, locale, t, run, busy, openMobileHandoff } = useWebApp();
  const existingFarm = state.farms.find((f) => f.ownerId === user?.id);

  const [name, setName] = useState(user ? (locale === 'bn' ? user.nameBn : user.name) : '');
  const [district, setDistrict] = useState(user?.district ?? 'Sirajganj');
  const [specialty, setSpecialty] = useState(user?.specialty ?? 'Cattle & Dairy Medicine');
  const [schedule, setSchedule] = useState(user?.schedule ?? '09:00 - 18:00');
  const [available, setAvailable] = useState(user?.available ?? true);

  const [farmName, setFarmName] = useState(existingFarm?.name ?? 'গ্রীন ভ্যালি ডেইরি খামার');
  const [farmDistrict, setFarmDistrict] = useState(existingFarm?.district ?? 'Sirajganj');
  const [farmAddress, setFarmAddress] = useState(
    existingFarm?.address ?? 'শাহজাদপুর, সিরাজগঞ্জ',
  );
  const [farmSize, setFarmSize] = useState(String(existingFarm?.size ?? 12));

  if (!user || !role) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#15803D] text-white flex items-center justify-center text-xl font-bold">
              {(locale === 'bn' ? user.nameBn : user.name).slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#1F2937]">
                  {locale === 'bn' ? user.nameBn : user.name}
                </h1>
                <Badge tone="brand">{roleNames[role][locale]}</Badge>
              </div>
              <div className="text-sm text-[#64748B] tabular-nums mt-0.5">
                {user.phone} · {user.district}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">{t('অ্যাকাউন্ট স্ট্যাটাস', 'Account Status')}</span>
              <Badge tone="success">{user.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">{t('বিজ্ঞপ্তি সেটিংস', 'Notifications')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void run({
                    type: 'settings.notifications',
                    enabled: !state.settings.notifications,
                  })
                }
              >
                {state.settings.notifications
                  ? t('চালু আছে', 'Enabled')
                  : t('বন্ধ আছে', 'Muted')}
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">{t('মোবাইল অ্যাপ সিঙ্ক', 'Mobile App Access')}</span>
              <Button
                variant="secondary"
                size="sm"
                icon="smartphone"
                onClick={() => openMobileHandoff({ role, screen: 'profile' })}
              >
                {t('QR / ডিপ লিংক', 'QR / Deep Link')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#1F2937]">
            {t('প্রোফাইল তথ্য হালনাগাদ করুন', 'Update Profile Information')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t('নাম', 'Full Name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label={t('জেলা', 'District')}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          {role === 'vet' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={t('বিশেষজ্ঞতা', 'Clinical Specialty')}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
              <Field
                label={t('পরামর্শের সময়সূচি', 'Consultation Hours')}
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
              <label className="inline-flex items-center gap-2 text-sm font-medium text-[#1F2937] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 accent-[#15803D]"
                />
                <span>
                  {t(
                    'জরুরি ও ভিডিও পরামর্শের জন্য উপলব্ধ',
                    'Available for emergency & telemedicine consultations',
                  )}
                </span>
              </label>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              variant="primary"
              icon="check"
              disabled={busy}
              onClick={() =>
                void run({
                  type: 'profile.update',
                  name,
                  district,
                  ...(role === 'vet' ? { specialty, schedule, available } : {}),
                })
              }
            >
              {t('প্রোফাইল সংরক্ষণ করুন', 'Save Profile')}
            </Button>
          </div>
        </Card>

        {role === 'farmer' ? (
          <Card className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('খামার নিবন্ধন ও সেটআপ', 'Farm Profile & Registration')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={t('খামারের নাম', 'Farm Name')}
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
              />
              <Field
                label={t('খামারের জেলা', 'Farm District')}
                value={farmDistrict}
                onChange={(e) => setFarmDistrict(e.target.value)}
              />
              <Field
                label={t('ঠিকানা / উপজেলা', 'Address / Upazila')}
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
              />
              <Field
                label={t('মোট প্রাণীর ধারণক্ষমতা', 'Herd Capacity (Head Count)')}
                type="number"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                icon="check"
                disabled={busy}
                onClick={() =>
                  void run({
                    type: 'farm.save',
                    name: farmName,
                    district: farmDistrict,
                    address: farmAddress,
                    size: Math.max(1, Number(farmSize) || 1),
                  })
                }
              >
                {t('খামার তথ্য সংরক্ষণ করুন', 'Save Farm Details')}
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function SupportWorkspace() {
  const { role, t, openMobileHandoff } = useWebApp();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card tinted className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image
                unoptimized
                width={48}
                height={48}
              src="/images/support.png"
              alt="Palito Support"
              className="w-12 h-12 rounded-[12px] object-cover bg-white p-1"
            />
            <div>
              <h1 className="text-lg font-bold text-[#0A401E]">
                {t('পালিতো সহায়তা কেন্দ্র', 'Palito Support Desk')}
              </h1>
              <p className="text-xs text-[#0F602D]">
                {t('ঢাকা ও আঞ্চলিক কৃষি সহায়তা ডেস্ক', 'Dhaka & Regional Livestock Operations Desk')}
              </p>
            </div>
          </div>
          <div className="text-sm text-[#1F2937] space-y-1.5 pt-2">
            <div>
              <strong>{t('হেল্পলাইন:', 'Helpline:')}</strong>{' '}
              <span className="tabular-nums">১৬২৬৩ / +880 9612-725486</span>
            </div>
            <div>
              <strong>{t('সেবার সময়:', 'Service Hours:')}</strong>{' '}
              {t('প্রতিদিন সকাল ৮টা – রাত ১০টা (ঢাকা সময়)', 'Daily 8:00 AM – 10:00 PM (Asia/Dhaka)')}
            </div>
            <div>
              <strong>{t('ব্যাংক ও বীমা ডেস্ক:', 'Bank & Insurance Desk:')}</strong>{' '}
              support@palito.com.bd
            </div>
            <div>
              <strong>{t('কার্যালয়:', 'Office:')}</strong>{' '}
              {t('বনানী, ঢাকা-১২১৩, বাংলাদেশ', 'Banani, Dhaka-1213, Bangladesh')}
            </div>
          </div>
          <div className="pt-2 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon="smartphone"
              onClick={() =>
                openMobileHandoff({ role: role ?? 'farmer', screen: 'support' })
              }
            >
              {t('মোবাইল অ্যাপে সহায়তা খুলুন', 'Open Support in Mobile App')}
            </Button>
            {role ? (
              <Link
                href={webHref(role, 'demo')}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
              >
                {t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & Environment Switcher')}
              </Link>
            ) : null}
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-[#1F2937]">
            {t('কীভাবে শুরু করব?', 'How do I get started?')}
          </h2>
          <p className="text-xs text-[#475569]">
            {t(
              'খামারি হিসেবে খামার ও পশু নিবন্ধন করুন। পশুর ডিজিটাল স্বাস্থ্য পাসপোর্ট থেকে ভ্যাকসিন, আইওটি সেন্সর, টেলিমেডিসিন ও আর্থিক সেবার তথ্য এক জায়গায় পাবেন।',
              'Register your farm and livestock to activate digital health passports linking vaccinations, IoT sensors, telemedicine, and financial services.',
            )}
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-[#1F2937]">
            {t(
              'জরুরি পশুচিকিৎসা ও বীমা দাবি কীভাবে কাজ করে?',
              'How do emergency care and insurance claims work?',
            )}
          </h2>
          <p className="text-xs text-[#475569]">
            {t(
              'জরুরি লক্ষণ বা সেন্সর সতর্কতা দেখা দিলে সরাসরি ভেট ভিডিও পরামর্শ বা খামার পরিদর্শনের অনুরোধ পাঠাতে পারেন। বীমা দাবির ক্ষেত্রে ছবি, জিপিএস ও ৪৮ ঘণ্টার আইওটি তথ্য যাচাই করা হয়।',
              'When urgent symptoms or sensor alerts arise, request a video consult or farm visit immediately. Insurance claims verify photos, GPS location, and 48-hour IoT telemetry.',
            )}
          </p>
        </Card>
      </div>

      <div className="lg:col-span-7">
        <Card className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#1F2937]">
            {t('সহায়তা অনুরোধ পাঠান', 'Submit a Support Ticket')}
          </h2>
          <TextareaField
            label={t('আপনার সমস্যা বা প্রশ্ন লিখুন', 'Describe your issue or inquiry')}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSent(false);
            }}
            placeholder={t(
              'যেমন: কলার ডেটা সিঙ্ক, ঋণ অনুমোদন বা বীমা দাবি সংক্রান্ত সহায়তা...',
              'e.g., IoT collar telemetry sync, loan disbursement, or claim review inquiry...',
            )}
          />
          {sent ? (
            <div className="rounded-[10px] bg-[#EBF4EE] border border-[#D8E9DE] px-3.5 py-2.5 text-sm font-medium text-[#0F602D]">
              {t(
                'আপনার বার্তাটি পালিতো সহায়তা টিমের কাছে নথিভুক্ত হয়েছে।',
                'Your inquiry has been logged with the Palito operations support desk.',
              )}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon="check"
              disabled={!message.trim()}
              onClick={() => {
                setSent(true);
                setMessage('');
              }}
            >
              {t('বার্তা পাঠান', 'Send Message')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DemoControlsWorkspace() {
  const router = useRouter();
  const { state, user, locale, t, dateTime, run, busy } = useWebApp();
  const activeAccounts = state.users.filter((a) => a.status === 'active');
  const seenRoles = new Set<Role>();

  async function switchAccount(userId: string, targetRole: Role) {
    const res = await run({ type: 'auth.switch', userId });
    if (res.ok) {
      router.push(webHref(targetRole, 'home'));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card tinted className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-[#0A401E]">
          {t('অ্যাকাউন্ট ও পরিবেশ ব্যবস্থাপনা', 'Account & Environment Switcher')}
        </h1>
        <p className="text-sm text-[#0F602D]">
          {t(
            'একই ব্রাউজারে বিভিন্ন ভূমিকার অ্যাকাউন্টে প্রবেশ করে সংশ্লিষ্ট প্যানেল ও অনুমোদন প্রবাহ পরীক্ষা করুন।',
            'Switch between role accounts on this device to inspect each stakeholder workspace and approval workflow.',
          )}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-6 flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#1F2937]">
            {t('অ্যাকাউন্ট বদলান', 'Switch Account')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(activeAccounts.length ? activeAccounts : DEMO_ACCOUNTS).map((account) => {
              const isCurrent = account.id === user?.id;
              const firstForRole = !seenRoles.has(account.role);
              seenRoles.add(account.role);
              return (
                <button
                  key={account.id}
                  type="button"
                  disabled={busy}
                  data-testid={firstForRole ? `switch-${account.role}` : `switch-${account.id}`}
                  onClick={() => void switchAccount(account.id, account.role)}
                  className={`flex items-start justify-between gap-2 rounded-[12px] border p-3.5 text-left cursor-pointer ${
                    isCurrent
                      ? 'border-[#15803D] bg-[#EBF4EE]/70'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#1F2937]">
                      {roleNames[account.role][locale]}
                    </div>
                    <div className="text-xs text-[#0F602D] font-semibold">
                      {locale === 'bn' ? account.nameBn : account.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] tabular-nums mt-0.5">
                      {account.phone} · {account.district}
                    </div>
                  </div>
                  {isCurrent ? <Badge tone="brand">{t('সক্রিয়', 'Active')}</Badge> : null}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-6 flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('সংযোগ ও সিস্টেম সময় নিয়ন্ত্রণ', 'Connectivity & System Time Progression')}
            </h2>
            <p className="text-xs text-[#64748B]">
              {t('বর্তমান সিস্টেম সময়:', 'Current system clock:')}{' '}
              <strong className="text-[#1F2937] tabular-nums">{dateTime(state.now)}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                icon="clock"
                disabled={busy}
                data-testid="advance-four-hours"
                onClick={() => void run({ type: 'demo.advanceTime', hours: 4 })}
              >
                {t('৪ ঘণ্টা এগোন', 'Advance 4 Hours')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="clock"
                disabled={busy}
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 })}
              >
                {t('১ দিন এগোন', 'Advance 1 Day')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="clock"
                disabled={busy}
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 * 7 })}
              >
                {t('৭ দিন এগোন', 'Advance 7 Days')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                variant={state.settings.offline ? 'danger' : 'outline'}
                size="sm"
                icon="radio"
                disabled={busy}
                onClick={() =>
                  void run({ type: 'demo.offline', offline: !state.settings.offline })
                }
              >
                {state.settings.offline
                  ? t('অফলাইন মোড সক্রিয় (অনলাইনে ফিরুন)', 'Offline Active (Go Online)')
                  : t('অফলাইন মোড চালু করুন', 'Enable Offline Mode')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="alert"
                disabled={busy}
                data-testid="fail-next"
                onClick={() => void run({ type: 'demo.failNext' })}
              >
                {t(
                  'পরের অনুরোধে ত্রুটি পরীক্ষা করুন',
                  'Test Network Retry on Next Action',
                )}
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1F2937]">
              {t('ডেটা প্রিসেট ও রিসেট', 'Data Presets & Reset')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {(['normal', 'health', 'insurance', 'lending', 'empty'] as DemoScenario[]).map(
                (scen) => (
                  <Button
                    key={scen}
                    variant={state.settings.scenario === scen ? 'primary' : 'outline'}
                    size="sm"
                    icon="refresh"
                    disabled={busy}
                    data-testid={scen === state.settings.scenario ? 'reset-demo' : `preset-${scen}`}
                    onClick={() => void run({ type: 'demo.reset', scenario: scen })}
                  >
                    {t(`রিসেট: ${scen}`, `Reset Preset: ${scen}`)}
                  </Button>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
