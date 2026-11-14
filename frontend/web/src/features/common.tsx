'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWebApp } from '@/providers/web-provider.tsx';
import { roleNames, webHref } from '@/navigation.ts';
import {
  Badge,
  Button,
  Card,
  EmptyWorkspaceState,
  Field,
  TextareaField,
  WebIcon,
} from '@/components/ui.tsx';

export const COMMON_WEB_SCREENS = ['notifications', 'profile', 'support'] as const;

export function CommonWebFeature({ screen }: { screen: string }) {
  if (screen === 'notifications') return <NotificationsWorkspace />;
  if (screen === 'support') return <SupportWorkspace />;
  return <ProfileWorkspace />;
}

function NotificationsWorkspace() {
  const { state, user, role, locale, t, dateTime, run, busy } = useWebApp();
  const items = state.notifications.filter((n) => n.userId === user?.id);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">
            {t('বিজ্ঞপ্তি ও সতর্কতা কেন্দ্র', 'Notifications & Activity Alerts')}
          </h1>
          <p className="text-sm text-[#64748B]">
            {t(
              `মোট ${items.length}টি বিজ্ঞপ্তি · ${unread}টি অপঠিত`,
              `${items.length} total notifications · ${unread} unread`,
            )}
          </p>
        </div>
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

      {items.length === 0 ? (
        <EmptyWorkspaceState
          title={t('কোনো বিজ্ঞপ্তি নেই', 'No notifications yet')}
          description={t(
            'নতুন ঋণ সিদ্ধান্ত, পরামর্শ বা সতর্কতা এলে এখানে দেখা যাবে।',
            'Updates on loans, consultations, claims, and health alerts will appear here.',
          )}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
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
                    href={webHref(role, 'home')}
                    className="inline-flex items-center gap-1 rounded-[8px] bg-[#EBF4EE] px-3 py-1.5 text-xs font-semibold text-[#0F602D] hover:bg-[#D8E9DE]"
                  >
                    <span>{t('ডেস্কে যান', 'Open Desk')}</span>
                    <WebIcon name="chevron-right" className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
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
            <img
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
              <strong>{t('জরুরি ভেটেরিনারি হেল্পলাইন:', 'Emergency Vet Helpline:')}</strong>{' '}
              <span className="tabular-nums">+880 9612-725486</span> (24/7)
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
          <div className="pt-2">
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
          </div>
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
