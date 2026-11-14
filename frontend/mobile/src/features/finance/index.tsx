import { useState } from 'react';
import { View } from 'react-native';
import { AppText, Badge, Button, Card, Choice, EmptyState, Field, Row, Screen, Section, Stat } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { navigate } from '@/navigation';
import type { FeatureProps } from '../types';
import { DemoNotice, FinanceHero, PaymentHistory, financeStyles as s } from './components';
import { ClaimApplication, ClaimDetail, ClaimTile, InsuranceApplication, InsuranceOverview, PolicyDetail, PolicyTile } from './insurance';
import { FarmerWallet, LoanApplication, LoanDetail, LoanOverview, LoanTile, PassportScreen } from './loans';

export const FARMER_FINANCE_SCREENS = [
  'wallet', 'insurance', 'insurance-apply', 'policy', 'policies',
  'claims', 'claim', 'claim-apply', 'loans', 'loan', 'loan-apply',
] as const;

export function FarmerFinanceFeature({ screen, id }: FeatureProps) {
  switch (screen) {
    case 'wallet': return <FarmerWallet />;
    case 'insurance': return id ? <PolicyDetail key={id} id={id} /> : <InsuranceOverview />;
    case 'insurance-apply': return <InsuranceApplication key={id ?? 'new'} animalId={id} />;
    case 'policies':
    case 'policy': return id ? <PolicyDetail key={id} id={id} /> : <InsuranceOverview />;
    case 'claim-apply': return <ClaimApplication key={id ?? 'new'} policyId={id} />;
    case 'claims':
    case 'claim': return id ? <ClaimDetail key={id} id={id} /> : <InsuranceOverview />;
    case 'loans': return id ? <LoanDetail key={id} id={id} /> : <LoanOverview />;
    case 'loan': return <LoanDetail key={id} id={id} />;
    case 'loan-apply': return <LoanApplication key={id ?? 'new'} animalId={id} />;
    default: return <FarmerWallet />;
  }
}

export function BankFeature({ screen, id }: FeatureProps) {
  if (screen === 'passport') return <PassportScreen id={id} role="bank" />;
  if (screen === 'loan' || ((screen === 'applications' || screen === 'loans') && id)) {
    return <LoanDetail key={id} id={id} />;
  }
  if (screen === 'applications') return <BankApplicationsScreen />;
  if (screen === 'loans') return <BankLoansScreen />;
  return <BankHomeScreen />;
}

function BankHomeScreen() {
  const { state, user, t, money } = useDemo();
  const loans = state.loans.filter(item => item.bankId === user?.id);
  const pending = loans.filter(item => item.status === 'submitted');
  const approved = loans.filter(item => item.status === 'approved');
  const active = loans.filter(item => item.status === 'active');
  const graceCandidates = active.filter(item => {
    const animal = state.animals.find(a => a.id === item.animalId);
    return Boolean(animal?.productionDrop && !item.graceUntil);
  });
  const outstandingTotal = active.reduce((sum, item) => sum + item.outstanding, 0);
  const settledPayments = state.payments.filter(item => item.userId === user?.id && item.kind === 'debt_settlement');
  const settledTotal = settledPayments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Screen testID="bank-home" title={t('ব্যাংক পোর্টাল', 'Bank workspace')}>
      <FinanceHero
        icon="business-outline"
        eyebrow={t('পদ্মা ব্যাংক পোর্টফোলিও', 'Padma Bank portfolio')}
        title={money(outstandingTotal)}
        detail={`${t('সক্রিয় বকেয়া', 'Active outstanding')} · ${t('বীমা সমন্বয়', 'Collateral settled')}: ${money(settledTotal)}`}
      />
      <View style={s.row}>
        <Stat label={t('নতুন আবেদন', 'Pending')} value={pending.length} icon="document-text-outline" />
        <Stat label={t('বিতরণের অপেক্ষায়', 'To disburse')} value={approved.length} icon="checkmark-done-outline" />
        <Stat label={t('সক্রিয় ঋণ', 'Active')} value={active.length} icon="cash-outline" />
      </View>

      {graceCandidates.length > 0 ? (
        <Card style={s.warningPanel}>
          <Badge tone="warning">{t('ঝুঁকি ও গ্রেস পিরিয়ড সংকেত', 'Production drop alert')}</Badge>
          <AppText variant="label">
            {t('সক্রিয় জামানত পশুর দুধ উৎপাদন হ্রাস পেয়েছে', 'Milk production drop reported on active collateral')}
          </AppText>
          <Button
            title={t('গ্রেস পিরিয়ড পর্যালোচনা করুন', 'Review grace period case')}
            variant="secondary"
            onPress={() => navigate('bank', 'loan', graceCandidates[0].id)}
            testID="bank-open-grace"
          />
        </Card>
      ) : null}

      <Section title={t('দ্রুত কাজ', 'Priority queues')}>
        <Card>
          <Row
            title={t('ঋণ আবেদন পর্যালোচনা', 'Loan applications queue')}
            subtitle={`${pending.length} ${t('টি সিদ্ধান্তের অপেক্ষায়', 'awaiting decision')}`}
            icon="document-text-outline"
            onPress={() => navigate('bank', 'applications')}
            testID="bank-goto-applications"
          />
          <Row
            title={t('সক্রিয় ঋণ ও পরিশোধ', 'Active loans & repayments')}
            subtitle={`${active.length} ${t('টি সক্রিয় হিসাব', 'active accounts')}`}
            icon="cash-outline"
            onPress={() => navigate('bank', 'loans')}
            testID="bank-goto-loans"
          />
        </Card>
      </Section>

      <Section title={t('সাম্প্রতিক আবেদন', 'Recent applications')}>
        {pending.length ? (
          pending.map(loan => <LoanTile key={loan.id} loan={loan} />)
        ) : (
          <EmptyState
            title={t('কোনো অমীমাংসিত আবেদন নেই', 'No pending applications')}
            description={t('খামারি নতুন আবেদন জমা দিলে এখানে দেখা যাবে।', 'New farmer loan applications will appear here.')}
          />
        )}
      </Section>

      <PaymentHistory
        items={state.payments.filter(item => item.userId === user?.id || loans.some(l => l.id === item.referenceId))}
        title={t('বিতরণ, পরিশোধ ও জামানত সমন্বয়', 'Disbursements, repayments & settlements')}
      />
      <DemoNotice />
    </Screen>
  );
}

function BankApplicationsScreen() {
  const { state, user, t } = useDemo();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('submitted');
  const all = state.loans.filter(item => item.bankId === user?.id);
  const filtered = all.filter(loan => {
    const animal = state.animals.find(a => a.id === loan.animalId);
    const farmer = state.users.find(u => u.id === loan.farmerId);
    const matchesStatus = filter === 'all' ? true : loan.status === filter;
    const text = `${loan.id} ${loan.purpose} ${animal?.name ?? ''} ${animal?.tag ?? ''} ${farmer?.name ?? ''} ${farmer?.nameBn ?? ''}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  return (
    <Screen title={t('ঋণের আবেদনসমূহ', 'Loan applications')} testID="bank-applications">
      <Field
        label={t('আবেদন খুঁজুন', 'Search applications')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('খামারি, পশুর ট্যাগ বা আইডি', 'Farmer, animal tag or ID')}
        testID="bank-app-search"
      />
      <Choice
        label={t('অবস্থা', 'Status')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'submitted', label: t('জমা হয়েছে', 'Submitted') },
          { value: 'approved', label: t('অনুমোদিত', 'Approved') },
          { value: 'rejected', label: t('প্রত্যাখ্যাত', 'Declined') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {filtered.length ? (
        filtered.map(loan => <LoanTile key={loan.id} loan={loan} />)
      ) : (
        <EmptyState
          title={t('কোনো আবেদন পাওয়া যায়নি', 'No matching applications')}
          description={t('ফিল্টার পরিবর্তন করে অন্য অবস্থার আবেদন দেখুন।', 'Change the filter to inspect other applications.')}
        />
      )}
    </Screen>
  );
}

function BankLoansScreen() {
  const { state, user, t } = useDemo();
  const [filter, setFilter] = useState('active');
  const all = state.loans.filter(item => item.bankId === user?.id && ['active', 'paid', 'settled', 'approved'].includes(item.status));
  const filtered = all.filter(loan => {
    if (filter === 'all') return true;
    if (filter === 'grace') {
      const animal = state.animals.find(a => a.id === loan.animalId);
      return Boolean(animal?.productionDrop || loan.graceUntil);
    }
    return loan.status === filter;
  });

  return (
    <Screen title={t('ঋণ পোর্টফোলিও', 'Loan portfolio')} testID="bank-loans">
      <Choice
        label={t('তালিকা', 'Filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'active', label: t('সক্রিয়', 'Active') },
          { value: 'grace', label: t('উৎপাদন হ্রাস / গ্রেস', 'Production drop / Grace') },
          { value: 'settled', label: t('বীমা সমন্বিত', 'Settled by insurance') },
          { value: 'paid', label: t('পরিশোধিত', 'Paid') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {filtered.length ? (
        filtered.map(loan => <LoanTile key={loan.id} loan={loan} />)
      ) : (
        <EmptyState
          title={t('এই তালিকায় কোনো ঋণ নেই', 'No loans in this view')}
          description={t('অন্য ফিল্টার নির্বাচন করুন।', 'Select another filter to view records.')}
        />
      )}
    </Screen>
  );
}

export function InsurerFeature({ screen, id }: FeatureProps) {
  if (screen === 'passport') return <PassportScreen id={id} role="insurer" />;
  if (screen === 'policy' || ((screen === 'applications' || screen === 'policies') && id)) {
    return <PolicyDetail key={id} id={id} />;
  }
  if (screen === 'claim' || (screen === 'claims' && id)) {
    return <ClaimDetail key={id} id={id} />;
  }
  if (screen === 'applications') return <InsurerApplicationsScreen />;
  if (screen === 'claims') return <InsurerClaimsScreen />;
  if (screen === 'policies') return <InsurerPoliciesScreen />;
  return <InsurerHomeScreen />;
}

function InsurerHomeScreen() {
  const { state, user, t, money } = useDemo();
  const policies = state.policies.filter(item => item.insurerId === user?.id);
  const claims = state.claims.filter(item => item.insurerId === user?.id);
  const pendingPolicies = policies.filter(item => item.status === 'submitted');
  const activePolicies = policies.filter(item => item.status === 'active');
  const openClaims = claims.filter(item => ['submitted', 'manual_review', 'vet_review', 'approved'].includes(item.status));
  const totalCoverage = activePolicies.reduce((sum, item) => sum + item.coverage, 0);

  return (
    <Screen title={t('বীমা পোর্টাল', 'Insurer workspace')} testID="insurer-home">
      <FinanceHero
        icon="shield-checkmark-outline"
        eyebrow={t('সুরক্ষা বীমা পোর্টফোলিও', 'Suraksha Insurance portfolio')}
        title={money(totalCoverage)}
        detail={`${t('সক্রিয় কভারেজ', 'Active coverage')} · ${activePolicies.length} ${t('টি পলিসি', 'policies')}`}
      />
      <View style={s.row}>
        <Stat label={t('পলিসি আবেদন', 'New apps')} value={pendingPolicies.length} icon="document-text-outline" />
        <Stat label={t('চলমান দাবি', 'Open claims')} value={openClaims.length} icon="alert-circle-outline" />
        <Stat label={t('সক্রিয় পলিসি', 'Active')} value={activePolicies.length} icon="shield-checkmark-outline" />
      </View>

      <Section title={t('প্রধান কাজ', 'Work queues')}>
        <Card>
          <Row
            title={t('পলিসি আবেদন পর্যালোচনা', 'Policy applications')}
            subtitle={`${pendingPolicies.length} ${t('টি অনুমোদনের অপেক্ষায়', 'awaiting review')}`}
            icon="document-text-outline"
            onPress={() => navigate('insurer', 'applications')}
            testID="insurer-goto-applications"
          />
          <Row
            title={t('বীমা দাবি ও পেআউট', 'Claims & payouts')}
            subtitle={`${openClaims.length} ${t('টি দাবি প্রক্রিয়াধীন', 'claims in progress')}`}
            icon="shield-checkmark-outline"
            onPress={() => navigate('insurer', 'claims')}
            testID="insurer-goto-claims"
          />
          <Row
            title={t('সকল পলিসি', 'All policies')}
            subtitle={`${policies.length} ${t('টি রেকর্ড', 'total policies')}`}
            icon="documents-outline"
            onPress={() => navigate('insurer', 'policies')}
            testID="insurer-goto-policies"
          />
        </Card>
      </Section>

      <Section title={t('সাম্প্রতিক দাবি', 'Recent claims')}>
        {claims.length ? (
          claims.slice(0, 3).map(claim => <ClaimTile key={claim.id} claim={claim} />)
        ) : (
          <EmptyState
            title={t('এখনও কোনো দাবি জমা হয়নি', 'No claims submitted yet')}
            description={t('খামারি দাবি জমা দিলে প্রমাণসহ এখানে দেখা যাবে।', 'Submitted farmer claims and sample evidence will appear here.')}
          />
        )}
      </Section>
      <DemoNotice />
    </Screen>
  );
}

function InsurerApplicationsScreen() {
  const { state, user, t } = useDemo();
  const [filter, setFilter] = useState('submitted');
  const policies = state.policies.filter(
    item => item.insurerId === user?.id && (filter === 'all' || item.status === filter),
  );

  return (
    <Screen title={t('বীমা আবেদনসমূহ', 'Insurance applications')} testID="insurer-applications">
      <Choice
        label={t('অবস্থা', 'Status')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'submitted', label: t('জমা হয়েছে', 'Submitted') },
          { value: 'active', label: t('অনুমোদিত', 'Active') },
          { value: 'rejected', label: t('প্রত্যাখ্যাত', 'Declined') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {policies.length ? (
        policies.map(policy => <PolicyTile key={policy.id} policy={policy} />)
      ) : (
        <EmptyState title={t('কোনো পলিসি আবেদন নেই', 'No policy applications in this view')} />
      )}
    </Screen>
  );
}

function InsurerClaimsScreen() {
  const { state, user, t } = useDemo();
  const [filter, setFilter] = useState('open');
  const claims = state.claims.filter(item => {
    if (item.insurerId !== user?.id) return false;
    if (filter === 'all') return true;
    if (filter === 'open') return ['submitted', 'manual_review', 'vet_review'].includes(item.status);
    return item.status === filter;
  });

  return (
    <Screen title={t('বীমার দাবিসমূহ', 'Insurance claims')} testID="insurer-claims">
      <Choice
        label={t('তালিকা', 'Filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: t('পর্যালোচনাধীন', 'In review') },
          { value: 'approved', label: t('পেআউটের অপেক্ষায়', 'Approved') },
          { value: 'paid', label: t('পরিশোধিত', 'Paid') },
          { value: 'rejected', label: t('প্রত্যাখ্যাত', 'Declined') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {claims.length ? (
        claims.map(claim => <ClaimTile key={claim.id} claim={claim} />)
      ) : (
        <EmptyState title={t('কোনো দাবি পাওয়া যায়নি', 'No claims in this filter')} />
      )}
    </Screen>
  );
}

function InsurerPoliciesScreen() {
  const { state, user, t } = useDemo();
  const [filter, setFilter] = useState('active');
  const policies = state.policies.filter(
    item => item.insurerId === user?.id && (filter === 'all' || item.status === filter),
  );

  return (
    <Screen title={t('বীমা পলিসিসমূহ', 'Insurance policies')} testID="insurer-policies">
      <Choice
        label={t('অবস্থা', 'Status')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'active', label: t('সক্রিয়', 'Active') },
          { value: 'settled', label: t('নিষ্পত্তি', 'Settled') },
          { value: 'expired', label: t('মেয়াদ শেষ', 'Expired') },
          { value: 'all', label: t('সব', 'All') },
        ]}
      />
      {policies.length ? (
        policies.map(policy => <PolicyTile key={policy.id} policy={policy} />)
      ) : (
        <EmptyState title={t('কোনো পলিসি নেই', 'No policies in this view')} />
      )}
    </Screen>
  );
}
