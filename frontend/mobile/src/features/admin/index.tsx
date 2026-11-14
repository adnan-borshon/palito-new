import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Education, Role } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, EmptyState, Field, Row, Screen, Section, Stat } from '@/components/ui';
import { navigate, roleNames } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { DemoNotice, layout, Meta, Missing, Status, useConfirmAction } from '../common/helpers';
import type { FeatureProps } from '../types';

const goAdmin = (screen: string, id?: string) => navigate('admin', screen, id);

export default function AdminFeature({ screen, id }: FeatureProps) {
  switch (screen) {
    case 'home': return <AdminHomeScreen />;
    case 'users':
    case 'user': return <AdminUsersScreen id={id} />;
    case 'content':
    case 'article': return <AdminContentScreen id={id} />;
    case 'reports':
    case 'audit': return <AdminReportsScreen initialTab={screen === 'audit' ? 'audit' : 'summary'} />;
    default: return <AdminHomeScreen />;
  }
}

function AdminHomeScreen() {
  const { state, t, date } = useDemo();
  const connectedDevices = state.devices.filter(d => d.connected).length;
  const activePolicies = state.policies.filter(p => p.status === 'active').length;
  const activeLoans = state.loans.filter(l => l.status === 'active').length;
  const publishedArticles = state.content.filter(c => c.status === 'published').length;
  const recentAudit = state.audit.slice(-5).reverse();

  return (
    <Screen title={t('প্রশাসক পোর্টাল', 'Administrator workspace')} testID="admin-home">
      <Card style={styles.hero}>
        <AppText variant="label" color="#D8E9DE">{t('পালিত সিস্টেম ওভারভিউ · ডেমো', 'Palito platform overview · demo')}</AppText>
        <AppText variant="hero" color={colors.surface}>{`${state.users.length} ${t('অ্যাকাউন্ট', 'Accounts')}`}</AppText>
        <AppText variant="small" color="#D8E9DE">
          {`${state.animals.length} ${t('পশু', 'animals')} · ${connectedDevices}/${state.devices.length} ${t('ডিভাইস সংযুক্ত', 'devices connected')}`}
        </AppText>
      </Card>

      <View style={layout.row}>
        <Stat label={t('সক্রিয় পলিসি', 'Policies')} value={activePolicies} icon="shield-checkmark-outline" />
        <Stat label={t('সক্রিয় ঋণ', 'Loans')} value={activeLoans} icon="cash-outline" />
        <Stat label={t('প্রকাশিত লেখা', 'Published')} value={publishedArticles} icon="book-outline" />
      </View>

      <Section title={t('সিমুলেটেড সিস্টেম স্বাস্থ্য', 'Simulated system health (PAL-ADM-03)')}>
        <Card>
          <View style={layout.split}>
            <AppText variant="label">{t('স্থানীয় স্টোরেজ ও রিপোজিটরি', 'Local storage & repository')}</AppText>
            <Badge tone="success">{t('সচল (ডেমো)', 'Healthy (demo)')}</Badge>
          </View>
          <View style={layout.split}>
            <AppText variant="label">{t('নেটওয়ার্ক সিমুলেশন মোড', 'Network simulation mode')}</AppText>
            <Badge tone={state.settings.offline ? 'warning' : 'success'}>
              {state.settings.offline ? t('অফলাইন সিমুলেশন', 'Offline mode') : t('অনলাইন ডেমো', 'Online demo')}
            </Badge>
          </View>
          <View style={layout.split}>
            <AppText variant="label">{t('আইওটি কলার টেলিমেট্রি ডেমো', 'IoT collar telemetry simulation')}</AppText>
            <Badge tone={connectedDevices === state.devices.length ? 'success' : 'warning'}>
              {`${connectedDevices}/${state.devices.length} ${t('সংযুক্ত', 'connected')}`}
            </Badge>
          </View>
          <AppText variant="small" color={colors.muted}>
            {t('এখানে কোনো প্রোডাকশন সার্ভার বা লাইভ টেলিমেট্রি নেই; সবই স্থানীয় ডেমো সূচক।', 'No production server or live telemetry is connected; all metrics above reflect local demo state.')}
          </AppText>
        </Card>
      </Section>

      <Section title={t('প্রশাসনিক মডিউল', 'Administration modules')}>
        <Card>
          <Row
            title={t('ব্যবহারকারী ও অ্যাক্সেস ব্যবস্থাপনা', 'Users & access management')}
            subtitle={t('অ্যাকাউন্ট সক্রিয়/স্থগিত ও ভূমিকা দেখুন', 'Inspect roles and activate or suspend accounts')}
            icon="people-outline"
            onPress={() => goAdmin('users')}
            testID="admin-goto-users"
          />
          <Row
            title={t('শিক্ষামূলক কনটেন্ট ব্যবস্থাপনা', 'Educational content management')}
            subtitle={t('খামারিদের জন্য নির্দেশিকা লিখুন ও প্রকাশ করুন', 'Author and publish bilingual guides for farmers')}
            icon="book-outline"
            onPress={() => goAdmin('content')}
            testID="admin-goto-content"
          />
          <Row
            title={t('রিপোর্ট ও অডিট লগ', 'Reports & activity audit log')}
            subtitle={t('স্বাস্থ্য, অর্থ ও কার্যক্রমের সারাংশ', 'Filter health, finance and audit activity')}
            icon="bar-chart-outline"
            onPress={() => goAdmin('reports')}
            testID="admin-goto-reports"
          />
        </Card>
      </Section>

      <Section title={t('সাম্প্রতিক অডিট লগ', 'Recent activity log')}>
        {recentAudit.length ? (
          recentAudit.map(event => (
            <Card key={event.id}>
              <View style={layout.split}>
                <AppText variant="label">{event.action}</AppText>
                <AppText variant="caption" color={colors.muted}>{date(event.at)}</AppText>
              </View>
              <AppText variant="small" color={colors.muted}>{`${event.actorId} · ${event.entityId ?? '—'}`}</AppText>
            </Card>
          ))
        ) : (
          <EmptyState title={t('এখনও কোনো অডিট ইভেন্ট নেই', 'No audit events recorded yet')} />
        )}
      </Section>
      <DemoNotice />
    </Screen>
  );
}

function AdminUsersScreen({ id }: { id?: string }) {
  const { state, user: currentAdmin, t, locale, busy } = useDemo();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const confirm = useConfirmAction();

  const users = state.users.filter(account => {
    const matchesRole = roleFilter === 'all' || account.role === roleFilter;
    const text = `${account.name} ${account.nameBn} ${account.phone} ${account.district}`.toLowerCase();
    return matchesRole && text.includes(query.trim().toLowerCase());
  });

  const selected = id ? state.users.find(u => u.id === id) : undefined;
  if (id && !selected) return <Missing />;

  return (
    <Screen title={t('ব্যবহারকারী ও অ্যাক্সেস', 'Users & access')} back={Boolean(id)} testID="admin-users">
      {!id ? (
        <>
          <Field
            label={t('ব্যবহারকারী খুঁজুন', 'Search users')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('নাম, ফোন বা জেলা', 'Name, phone or district')}
            testID="admin-user-search"
          />
          <Choice
            label={t('ভূমিকা ফিল্টার', 'Filter by role')}
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: t('সব', 'All') },
              { value: 'farmer', label: roleNames.farmer[locale] },
              { value: 'vet', label: roleNames.vet[locale] },
              { value: 'bank', label: roleNames.bank[locale] },
              { value: 'insurer', label: roleNames.insurer[locale] },
              { value: 'admin', label: roleNames.admin[locale] },
            ]}
          />
        </>
      ) : null}

      {(selected ? [selected] : users).map(account => {
        const isSelf = account.id === currentAdmin?.id;
        const nextStatus = account.status === 'active' ? 'suspended' : 'active';
        return (
          <Card key={account.id} testID={`admin-user-${account.id}`}>
            <View style={layout.split}>
              <View style={layout.flex}>
                <AppText variant="heading">{locale === 'bn' ? account.nameBn : account.name}</AppText>
                <AppText variant="small" color={colors.muted}>{`${roleNames[account.role][locale]} · ${account.district}`}</AppText>
              </View>
              <Status value={account.status} />
            </View>
            <Meta label={t('ফোন', 'Phone')} value={account.phone} />
            <Meta label={t('আইডি', 'Account ID')} value={account.id} />
            {!isSelf ? (
              <Button
                title={account.status === 'active' ? t('অ্যাকাউন্ট স্থগিত করুন', 'Suspend account') : t('অ্যাকাউন্ট সক্রিয় করুন', 'Reactivate account')}
                variant={account.status === 'active' ? 'danger' : 'primary'}
                disabled={busy}
                onPress={() =>
                  confirm.open(
                    { type: 'admin.userStatus', userId: account.id, status: nextStatus },
                    nextStatus === 'suspended' ? t('অ্যাকাউন্ট স্থগিত করবেন?', 'Suspend this account?') : t('অ্যাকাউন্ট সক্রিয় করবেন?', 'Reactivate this account?'),
                    nextStatus === 'suspended'
                      ? t('স্থগিত অ্যাকাউন্ট দিয়ে লগইন বা কাজ করা যাবে না।', 'Suspended accounts cannot sign in or execute commands.')
                      : t('অ্যাকাউন্টটি আবার ডেমোতে ব্যবহার করা যাবে।', 'This account will regain access to the demo.'),
                    undefined,
                    nextStatus === 'suspended',
                  )
                }
                testID={`toggle-user-${account.id}`}
              />
            ) : (
              <Badge tone="info">{t('বর্তমান প্রশাসক অ্যাকাউন্ট', 'Current administrator session')}</Badge>
            )}
          </Card>
        );
      })}
      {!selected && users.length === 0 ? <EmptyState title={t('কোনো ব্যবহারকারী পাওয়া যায়নি', 'No matching users')} /> : null}
      <DemoNotice />
      {confirm.dialog}
    </Screen>
  );
}

function AdminContentScreen({ id }: { id?: string }) {
  const { state, t, locale, date, run, busy } = useDemo();
  const existing = id ? state.content.find(c => c.id === id) : undefined;
  const [editingId, setEditingId] = useState<string | undefined>(existing?.id);
  const [titleBn, setTitleBn] = useState(existing?.title.bn ?? '');
  const [titleEn, setTitleEn] = useState(existing?.title.en ?? '');
  const [bodyBn, setBodyBn] = useState(existing?.body.bn ?? '');
  const [bodyEn, setBodyEn] = useState(existing?.body.en ?? '');
  const [category, setCategory] = useState<Education['category']>(existing?.category ?? 'health');
  const [status, setStatus] = useState<Education['status']>(existing?.status ?? 'published');
  const [filter, setFilter] = useState('all');
  const [attempted, setAttempted] = useState(false);

  const selectForEdit = (item: Education) => {
    setEditingId(item.id);
    setTitleBn(item.title.bn);
    setTitleEn(item.title.en);
    setBodyBn(item.body.bn);
    setBodyEn(item.body.en);
    setCategory(item.category);
    setStatus(item.status);
    setAttempted(false);
  };

  const resetForm = () => {
    setEditingId(undefined);
    setTitleBn('');
    setTitleEn('');
    setBodyBn('');
    setBodyEn('');
    setCategory('health');
    setStatus('published');
    setAttempted(false);
  };

  const saveArticle = async () => {
    setAttempted(true);
    if (titleBn.trim().length < 3 || titleEn.trim().length < 3 || bodyBn.trim().length < 8 || bodyEn.trim().length < 8) return;
    const result = await run({
      type: 'content.save',
      id: editingId,
      title: { bn: titleBn.trim(), en: titleEn.trim() },
      body: { bn: bodyBn.trim(), en: bodyEn.trim() },
      category,
      status,
    });
    if (result.ok) resetForm();
  };

  const items = state.content.filter(item => filter === 'all' || item.status === filter);

  return (
    <Screen title={t('শিক্ষামূলক কনটেন্ট', 'Educational content')} testID="admin-content">
      <Card>
        <AppText variant="heading">
          {editingId ? t('নির্দেশিকা সম্পাদনা করুন', 'Edit educational guide') : t('নতুন নির্দেশিকা তৈরি করুন', 'Create educational guide')}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {t('শুধু প্রকাশিত (Published) লেখা খামারির হোম ও শিক্ষা পাতায় দেখা যাবে।', 'Only published guides appear on the farmer’s home and care guides screens.')}
        </AppText>
        <Field
          label={t('শিরোনাম (বাংলা)', 'Title (Bangla)')}
          value={titleBn}
          onChangeText={setTitleBn}
          testID="content-title-bn"
          error={attempted && titleBn.trim().length < 3 ? t('অন্তত ৩ অক্ষরের বাংলা শিরোনাম দিন।', 'Enter at least 3 characters.') : undefined}
        />
        <Field
          label={t('শিরোনাম (English)', 'Title (English)')}
          value={titleEn}
          onChangeText={setTitleEn}
          testID="content-title-en"
          error={attempted && titleEn.trim().length < 3 ? t('অন্তত ৩ অক্ষরের ইংরেজি শিরোনাম দিন।', 'Enter at least 3 characters.') : undefined}
        />
        <Choice
          label={t('বিভাগ', 'Category')}
          value={category}
          onChange={setCategory}
          options={[
            { value: 'health', label: t('স্বাস্থ্য', 'Health') },
            { value: 'nutrition', label: t('পুষ্টি', 'Nutrition') },
            { value: 'finance', label: t('অর্থ ও বীমা', 'Finance') },
          ]}
        />
        <Choice
          label={t('প্রকাশের অবস্থা', 'Publication status')}
          value={status}
          onChange={setStatus}
          options={[
            { value: 'published', label: t('প্রকাশিত', 'Published') },
            { value: 'draft', label: t('খসড়া', 'Draft') },
          ]}
          testID="content-status"
        />
        <Field
          label={t('বিষয়বস্তু (বাংলা)', 'Body (Bangla)')}
          value={bodyBn}
          onChangeText={setBodyBn}
          multiline
          testID="content-body-bn"
          error={attempted && bodyBn.trim().length < 8 ? t('অন্তত ৮ অক্ষরের বিবরণ লিখুন।', 'Enter at least 8 characters.') : undefined}
        />
        <Field
          label={t('বিষয়বস্তু (English)', 'Body (English)')}
          value={bodyEn}
          onChangeText={setBodyEn}
          multiline
          testID="content-body-en"
          error={attempted && bodyEn.trim().length < 8 ? t('অন্তত ৮ অক্ষরের ইংরেজি বিবরণ লিখুন।', 'Enter at least 8 characters.') : undefined}
        />
        <Button
          title={editingId ? t('পরিবর্তন সংরক্ষণ করুন', 'Update guide') : t('নির্দেশিকা সংরক্ষণ করুন', 'Save guide')}
          loading={busy}
          onPress={() => void saveArticle()}
          testID="save-content"
        />
        {editingId ? (
          <Button title={t('নতুন লেখা শুরু করুন', 'Cancel edit')} variant="ghost" onPress={resetForm} />
        ) : null}
      </Card>

      <Section title={t('বিদ্যমান নির্দেশিকাসমূহ', 'Existing guides')}>
        <Choice
          label={t('ফিল্টার', 'Show')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('সব', 'All') },
            { value: 'published', label: t('প্রকাশিত', 'Published') },
            { value: 'draft', label: t('খসড়া', 'Draft') },
          ]}
        />
        {items.length ? (
          items.map(item => (
            <Card key={item.id} onPress={() => selectForEdit(item)} testID={`admin-article-${item.id}`}>
              <View style={layout.split}>
                <AppText variant="heading">{item.title[locale]}</AppText>
                <Status value={item.status} />
              </View>
              <AppText numberOfLines={2}>{item.body[locale]}</AppText>
              <AppText variant="small" color={colors.muted}>{`${item.category} · ${date(item.updatedAt)}`}</AppText>
            </Card>
          ))
        ) : (
          <EmptyState title={t('কোনো নির্দেশিকা নেই', 'No guides in this filter')} />
        )}
      </Section>
    </Screen>
  );
}

function AdminReportsScreen({ initialTab = 'summary' }: { initialTab?: string }) {
  const { state, t, money, date, run, busy } = useDemo();
  const [tab, setTab] = useState(initialTab);
  const [auditQuery, setAuditQuery] = useState('');

  const totalInsured = state.policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + p.coverage, 0);
  const totalLoanDisbursed = state.loans
    .filter(l => ['active', 'paid', 'settled'].includes(l.status))
    .reduce((sum, l) => sum + l.amount, 0);
  const totalOutstanding = state.loans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.outstanding, 0);
  const totalSettledByInsurance = state.claims
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.debtSettlement ?? 0), 0);

  const filteredAudit = state.audit
    .filter(item => `${item.action} ${item.actorId} ${item.entityId ?? ''}`.toLowerCase().includes(auditQuery.trim().toLowerCase()))
    .slice()
    .reverse();

  return (
    <Screen title={t('রিপোর্ট ও কার্যক্রম লগ', 'Reports & activity log')} testID="admin-reports">
      <Choice
        label={t('রিপোর্ট বিভাগ', 'Report category')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'summary', label: t('সারসংক্ষেপ', 'Summary') },
          { value: 'health', label: t('স্বাস্থ্য ও ভেট', 'Health & vet') },
          { value: 'finance', label: t('বীমা ও ঋণ', 'Finance') },
          { value: 'audit', label: t('অডিট লগ', 'Audit log') },
        ]}
        testID="report-filter"
      />

      {tab === 'summary' || tab === 'health' ? (
        <Section title={t('প্রাণিসম্পদ ও চিকিৎসা পরিসংখ্যান', 'Livestock & veterinary summary')}>
          <Card>
            <Meta label={t('মোট নিবন্ধিত পশু', 'Registered animals')} value={state.animals.length} />
            <Meta label={t('সুস্থ পশু', 'Healthy animals')} value={state.animals.filter(a => a.status === 'healthy').length} />
            <Meta label={t('যত্ন প্রয়োজন / সংকটাপন্ন', 'Attention / critical')} value={state.animals.filter(a => ['attention', 'critical'].includes(a.status)).length} />
            <Meta label={t('মৃত (দাবি নিষ্পত্তি)', 'Deceased (claim settled)')} value={state.animals.filter(a => a.status === 'deceased').length} />
            <Meta label={t('খোলা বা এসকেলেট সতর্কতা', 'Open / escalated alerts')} value={state.alerts.filter(a => ['open', 'escalated'].includes(a.status)).length} />
            <Meta label={t('মোট ভেট সাক্ষাৎ', 'Total appointments')} value={state.appointments.length} />
            <Meta label={t('প্রকাশিত প্রেসক্রিপশন', 'Prescriptions issued')} value={state.prescriptions.length} />
          </Card>
        </Section>
      ) : null}

      {tab === 'summary' || tab === 'finance' ? (
        <Section title={t('বীমা, ঋণ ও অর্ডার পরিসংখ্যান', 'Insurance, lending & commerce summary')}>
          <Card>
            <Meta label={t('সক্রিয় বীমা কভারেজ', 'Active insurance coverage')} value={money(totalInsured)} />
            <Meta label={t('মোট বীমা দাবি', 'Total claims filed')} value={state.claims.length} />
            <Meta label={t('পরিশোধিত দাবি', 'Claims paid')} value={state.claims.filter(c => c.status === 'paid').length} />
            <Meta label={t('বিতরণকৃত ডেমো ঋণ', 'Total loans disbursed')} value={money(totalLoanDisbursed)} />
            <Meta label={t('বর্তমান বকেয়া ঋণ', 'Current loan outstanding')} value={money(totalOutstanding)} />
            <Meta label={t('বীমা থেকে জামানত ঋণ সমন্বয়', 'Debt settled via insurance')} value={money(totalSettledByInsurance)} />
            <Meta label={t('মোট অর্ডার', 'Marketplace orders')} value={state.orders.length} />
          </Card>
          {state.orders.filter(o => ['placed', 'confirmed', 'shipped'].includes(o.status)).map(order => (
            <Card key={order.id}>
              <View style={layout.split}>
                <AppText variant="label">{order.id}</AppText>
                <Status value={order.status} />
              </View>
              <Button
                title={t('পরবর্তী ডেলিভারি ধাপে নিন', 'Advance delivery status')}
                variant="secondary"
                loading={busy}
                onPress={() => void run({ type: 'order.advance', orderId: order.id })}
              />
            </Card>
          ))}
        </Section>
      ) : null}

      {tab === 'audit' ? (
        <Section title={t('সিস্টেম অডিট লগ', 'System activity log')}>
          <Field
            label={t('ইভেন্ট খুঁজুন', 'Filter audit events')}
            value={auditQuery}
            onChangeText={setAuditQuery}
            placeholder={t('কমান্ড বা ব্যবহারকারী আইডি', 'Command or actor ID')}
            testID="audit-search"
          />
          {filteredAudit.length ? (
            filteredAudit.map(event => (
              <Card key={event.id} testID={`audit-${event.id}`}>
                <View style={layout.split}>
                  <AppText variant="label">{event.action}</AppText>
                  <AppText variant="caption" color={colors.muted}>{date(event.at)}</AppText>
                </View>
                <AppText variant="small">{`${t('ব্যবহারকারী', 'Actor')}: ${event.actorId} · ${t('রেকর্ড', 'Entity')}: ${event.entityId ?? '—'}`}</AppText>
                <AppText variant="caption" color={colors.muted}>{event.detail}</AppText>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="list-outline"
              title={t('কোনো অডিট লগ পাওয়া যায়নি', 'No matching audit events')}
              description={t('অ্যাপে কাজ করলে এখানে লগ তৈরি হয়।', 'Actions performed in the demo are recorded here.')}
            />
          )}
        </Section>
      ) : null}

      <DemoNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep, gap: 8 },
});
