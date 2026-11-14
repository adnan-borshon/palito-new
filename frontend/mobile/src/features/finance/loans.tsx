import { useState } from 'react';
import { View } from 'react-native';
import { demoBalance, demoLoanQuote, isPositiveMoney, maximumLoanAmount, type Loan } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, EmptyState, Field, Icon, Row, Screen, Section } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { navigate } from '@/navigation';
import { colors } from '@/theme';
import {
  AnimalIdentity, AnimalOption, DemoNotice, Detail, FinanceHero, FinanceStatus,
  LinkedPassport, MissingRecord, PaymentHistory, financeStyles as s, useFinanceConfirmation,
} from './components';
import { ClaimTile, PolicyTile } from './insurance';

const STAGES: Loan['status'][] = ['offered', 'submitted', 'approved', 'active'];

export function LoanTile({ loan }: { loan: Loan }) {
  const { state, t, money, date, role } = useDemo();
  const animal = state.animals.find(item => item.id === loan.animalId);
  return (
    <Card
      onPress={() => navigate(role!, 'loan', loan.id)}
      testID={`loan-${loan.id}`}
      accessibilityLabel={`${animal?.name ?? ''}, ${t('ঋণ', 'Loan')}`}
    >
      <View style={s.row}>
        <AppText variant="heading" style={s.flex}>{animal?.name ?? loan.animalId}</AppText>
        <FinanceStatus status={loan.status} />
      </View>
      <Detail label={t('মূল টাকা', 'Principal')} value={money(loan.amount)} />
      <Detail label={t('বকেয়া', 'Outstanding')} value={money(loan.outstanding)} />
      {animal?.productionDrop && loan.status === 'active' ? (
        <Badge tone="warning">{t('দুধ উৎপাদন হ্রাস চিহ্নিত', 'Production drop noted')}</Badge>
      ) : null}
      <AppText variant="small" color={colors.muted}>
        {loan.graceUntil
          ? `${t('বর্ধিত সময়', 'Grace until')}: ${date(loan.graceUntil)}`
          : loan.dueAt
            ? `${t('পরিশোধের তারিখ', 'Due')}: ${date(loan.dueAt)}`
            : `${t('আবেদন', 'Created')}: ${date(loan.createdAt)}`}
      </AppText>
    </Card>
  );
}

export function LoanOverview() {
  const { state, user, t, money } = useDemo();
  const loans = state.loans.filter(item => item.farmerId === user?.id);
  const activeDebt = loans
    .filter(item => item.status === 'active')
    .reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <Screen title={t('পশু জামানত ঋণ', 'Livestock loans')} back testID="farmer-loans">
      <FinanceHero
        icon="cash-outline"
        eyebrow={t('স্বাস্থ্যভিত্তিক ডেমো ঋণ', 'Health-backed demo credit')}
        title={money(activeDebt)}
        detail={t('চলমান ডেমো বকেয়া ঋণ', 'Current simulated outstanding debt')}
      />
      <Button
        title={t('নতুন ঋণের যোগ্যতা ও আবেদন', 'Check eligibility & apply')}
        icon="add"
        onPress={() => navigate('farmer', 'loan-apply')}
        testID="open-loan-apply"
      />
      <Section title={t('আপনার ঋণ তালিকা', 'Your loans')}>
        {loans.length ? (
          loans.map(loan => <LoanTile key={loan.id} loan={loan} />)
        ) : (
          <EmptyState
            icon="cash-outline"
            title={t('এখনও কোনো ঋণ নেই', 'No loans yet')}
            description={t('দায়মুক্ত পশুর স্বাস্থ্য পাসপোর্ট দিয়ে ডেমো ঋণের প্রস্তাব দেখুন।', 'Select an unencumbered animal passport to preview a demo loan offer.')}
          />
        )}
      </Section>
      <DemoNotice />
    </Screen>
  );
}

export function LoanApplication({ animalId }: { animalId?: string }) {
  const { state, user, t, money, busy } = useDemo();
  const animals = state.animals.filter(
    item => item.ownerId === user?.id && !['sold', 'deceased'].includes(item.status),
  );
  const held = (id: string) =>
    state.loans.some(
      loan => loan.animalId === id && ['offered', 'submitted', 'approved', 'active'].includes(loan.status),
    );
  const [selected, setSelected] = useState(
    animalId && !held(animalId) ? animalId : animals.find(item => !held(item.id))?.id ?? '',
  );
  const animal = animals.find(item => item.id === selected);
  const quote = animal ? demoLoanQuote(animal) : undefined;
  const [amount, setAmount] = useState(quote ? String(quote.maximumAmount) : '');
  const [term, setTerm] = useState('12');
  const [purpose, setPurpose] = useState('খাদ্য ও খামার পরিচর্যা / Feed and farm care');
  const [repaymentSource, setRepaymentSource] = useState('দুধ বিক্রি ও খামার আয় / Milk sales and farm income');
  const [attempted, setAttempted] = useState(false);
  const { confirm, dialog } = useFinanceConfirmation();

  const numericAmount = Number(amount);
  const numericTerm = Number(term);
  const exceedsCap = Boolean(quote && isPositiveMoney(numericAmount) && numericAmount > quote.maximumAmount);
  const validAmount = Boolean(quote && isPositiveMoney(numericAmount) && numericAmount <= quote.maximumAmount);
  const validTerm = Number.isInteger(numericTerm) && numericTerm >= 1 && numericTerm <= 36;
  const validPurpose = purpose.trim().length >= 3;
  const validSource = repaymentSource.trim().length >= 3;

  const selectAnimal = (id: string) => {
    setSelected(id);
    const target = animals.find(item => item.id === id);
    if (target) {
      const nextQuote = demoLoanQuote(target);
      setAmount(String(nextQuote.maximumAmount));
    }
  };

  const createOffer = () => {
    setAttempted(true);
    if (!animal || !quote || !validAmount || !validTerm || !validPurpose || !validSource) return;
    confirm({
      title: t('ডেমো ঋণ প্রস্তাব তৈরি করুন', 'Create demo loan offer'),
      description: `${animal.name} · ${money(numericAmount)}\n${t('যাচাইকৃত জামানত মূল্য', 'Verified collateral valuation')}: ${money(quote.collateralValue)}\n${t('সর্বোচ্চ ৭০% সীমা', 'Maximum 70% cap')}: ${money(quote.maximumAmount)}\n${t('বার্ষিক ডেমো হার', 'Annual demo rate')}: ${quote.annualRate}%`,
      command: {
        type: 'loan.offer',
        animalId: animal.id,
        amount: numericAmount,
        termMonths: numericTerm,
        purpose: purpose.trim(),
        repaymentSource: repaymentSource.trim(),
      },
      onSuccess: id => navigate('farmer', 'loan', id),
    });
  };

  return (
    <Screen title={t('ঋণের আবেদন', 'Loan application')} back testID="loan-apply">
      <FinanceHero
        icon="trending-up-outline"
        eyebrow={t('UC-003 · পশু জামানত মূল্যায়ন', 'UC-003 · Collateral valuation')}
        title={quote ? money(quote.maximumAmount) : t('পশু বেছে নিন', 'Choose an animal')}
        detail={t('যাচাইকৃত মূল্যের সর্বোচ্চ ৭০% পর্যন্ত ডেমো প্রস্তাব', 'Demo offer capped at 70% of verified collateral value')}
      />
      <DemoNotice
        text={t(
          'পশুর স্বাস্থ্য স্কোর ৭৫-এর নিচে হলে নমুনা জামানত মূল্য ৮০% ধরা হয় এবং ডেমো সুদের হার ১৫% (স্বাভাবিক ১০%) দেখানো হয়।',
          'When an animal’s health score is below 75, the illustrative collateral valuation is adjusted to 80% and the sample rate is 15% (10% standard).',
        )}
      />
      <Section title={t('জামানতের জন্য পশু নির্বাচন', 'Select collateral animal')}>
        {animals.length ? (
          animals.map(item => {
            const itemQuote = demoLoanQuote(item);
            return (
              <AnimalOption
                key={item.id}
                animal={item}
                selected={selected === item.id}
                onSelect={() => selectAnimal(item.id)}
                unavailable={held(item.id) ? t('ইতিমধ্যে জামানত বা আবেদনে যুক্ত', 'Already pledged or in an active application') : undefined}
              >
                <View style={s.wrap}>
                  <Badge tone={item.healthScore >= 75 ? 'success' : 'warning'}>
                    {`${t('স্বাস্থ্য স্কোর', 'Health')}: ${item.healthScore}/100`}
                  </Badge>
                  <Badge tone="info">
                    {`${t('৭০% সীমা', '70% cap')}: ${money(itemQuote.maximumAmount)}`}
                  </Badge>
                </View>
              </AnimalOption>
            );
          })
        ) : (
          <EmptyState
            title={t('কোনো উপযুক্ত পশু নেই', 'No eligible animals')}
            action={<Button title={t('পশু যোগ করুন', 'Add animal')} onPress={() => navigate('farmer', 'animals')} />}
          />
        )}
      </Section>

      {animal && quote ? (
        <>
          <Card style={s.mutedPanel}>
            <AppText variant="heading">{t('ডেমো মূল্যায়ন ও শর্ত', 'Valuation and sample terms')}</AppText>
            <Detail label={t('পশুর প্রারম্ভিক মূল্য', 'Base animal value')} value={money(animal.value)} />
            <Detail label={t('স্বাস্থ্য সমন্বিত জামানত মূল্য', 'Health-adjusted valuation')} value={money(quote.collateralValue)} />
            <Detail label={t('সর্বোচ্চ ঋণ সীমা (৭০%)', 'Maximum loan cap (70%)')} value={money(quote.maximumAmount)} />
            <Detail label={t('নমুনা বার্ষিক হার', 'Illustrative annual rate')} value={`${quote.annualRate}%`} />
            {animal.healthScore < 75 ? (
              <AppText variant="small" color={colors.warning}>
                {t(
                  'কম স্বাস্থ্য স্কোরের কারণে ঝুঁকি সমন্বয়কৃত প্রস্তাব দেখানো হচ্ছে।',
                  'Lower health score resulted in a risk-adjusted sample valuation and rate.',
                )}
              </AppText>
            ) : null}
          </Card>

          <Field
            label={t('আবেদিত ঋণের পরিমাণ (টাকা)', 'Requested loan amount (BDT)')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            testID="loan-amount-input"
            hint={`${t('সর্বোচ্চ অনুমোদিত (৭০%)', 'Maximum allowed (70%)')}: ${money(quote.maximumAmount)}`}
            error={
              attempted && exceedsCap
                ? t('ঋণের পরিমাণ যাচাইকৃত জামানত মূল্যের ৭০%-এর বেশি হতে পারবে না।', 'Loan principal cannot exceed 70% of verified collateral value.')
                : attempted && !validAmount
                  ? t('সীমার মধ্যে পূর্ণ টাকার পরিমাণ দিন।', 'Enter a positive whole BDT amount within the 70% cap.')
                  : undefined
            }
          />

          <Choice
            label={t('মেয়াদ (মাস)', 'Term (months)')}
            value={term}
            onChange={setTerm}
            options={[
              { value: '6', label: t('৬ মাস', '6 months') },
              { value: '12', label: t('১২ মাস', '12 months') },
              { value: '18', label: t('১৮ মাস', '18 months') },
              { value: '24', label: t('২৪ মাস', '24 months') },
            ]}
            testID="loan-term"
          />

          <Field
            label={t('ঋণের উদ্দেশ্য', 'Loan purpose')}
            value={purpose}
            onChangeText={setPurpose}
            testID="loan-purpose"
            error={attempted && !validPurpose ? t('ঋণের উদ্দেশ্য লিখুন।', 'Enter the loan purpose.') : undefined}
          />

          <Field
            label={t('পরিশোধের উৎস', 'Repayment source')}
            value={repaymentSource}
            onChangeText={setRepaymentSource}
            testID="loan-repayment-source"
            error={attempted && !validSource ? t('পরিশোধের উৎস লিখুন।', 'Enter the repayment source.') : undefined}
          />

          <Button
            title={t('প্রস্তাব তৈরি ও শর্ত দেখুন', 'Generate offer & review terms')}
            onPress={createOffer}
            disabled={busy}
            testID="create-loan-offer"
          />
        </>
      ) : null}
      {dialog}
    </Screen>
  );
}

export function LoanDetail({ id }: { id?: string }) {
  const { state, user, role, t, money, date, busy } = useDemo();
  const loan = state.loans.find(
    item => item.id === id && (role === 'bank' ? item.bankId === user?.id : item.farmerId === user?.id),
  );
  const animal = state.animals.find(item => item.id === loan?.animalId);
  const borrower = state.users.find(item => item.id === loan?.farmerId);
  const [note, setNote] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [graceDays, setGraceDays] = useState('30');
  const [graceNote, setGraceNote] = useState('দুধ উৎপাদন কমায় অতিরিক্ত সময় অনুমোদন / Grace period due to milk production drop');
  const [consent, setConsent] = useState('yes');
  const [attempted, setAttempted] = useState(false);
  const { confirm, dialog } = useFinanceConfirmation();

  if (!loan || !animal) {
    return (
      <Screen title={t('ঋণের তথ্য', 'Loan details')} back>
        <MissingRecord />
      </Screen>
    );
  }

  const cap = maximumLoanAmount(loan.collateralValue);
  const stageIndex = STAGES.indexOf(loan.status);
  const progressPercent = loan.status === 'paid' || loan.status === 'settled' ? 100 : stageIndex >= 0 ? ((stageIndex + 1) / STAGES.length) * 100 : 25;
  const walletBalance = user ? demoBalance(state, user.id) : 0;
  const relatedPayments = state.payments.filter(item => item.referenceId === loan.id);

  const acceptOffer = () => {
    setAttempted(true);
    if (consent !== 'yes') return;
    confirm({
      title: t('শর্ত গ্রহণ ও ব্যাংকে জমা', 'Accept terms & submit to bank'),
      description: `${animal.name} · ${money(loan.amount)} (${loan.annualRate}%)\n${t('পশুর পাসপোর্ট ব্যাংকের পর্যালোচনার জন্য যুক্ত হবে।', 'The animal health passport will be shared with the bank for review.')}`,
      command: { type: 'loan.accept', loanId: loan.id },
    });
  };

  const bankDecide = (approve: boolean) => {
    setAttempted(true);
    if (!approve && note.trim().length < 3) return;
    confirm({
      title: approve ? t('ঋণ অনুমোদন নিশ্চিত করুন', 'Confirm loan approval') : t('ঋণ প্রত্যাখ্যান নিশ্চিত করুন', 'Confirm loan decline'),
      description: approve
        ? `${money(loan.amount)} · ${t('৭০% সীমা যাচাইকৃত। অনুমোদনের পর ডেমো বিতরণ করা যাবে।', '70% cap verified. You can simulate disbursement after approval.')}`
        : t('প্রত্যাখ্যানের কারণ খামারির কাছে পাঠানো হবে।', 'The decline reason will be shared with the farmer.'),
      danger: !approve,
      command: { type: 'loan.decide', loanId: loan.id, approve, note: note.trim() || undefined },
    });
  };

  const disburse = () => {
    confirm({
      title: t('ডেমো অর্থ বিতরণ করুন', 'Simulate loan disbursement'),
      description: `${money(loan.amount)}\n${t('২৪ ঘণ্টার লক্ষ্যমাত্রা ডেমো হিসেবে তাৎক্ষণিক ওয়ালেটে জমা হবে এবং পাসপোর্টে জামানত চিহ্নিত হবে।', 'Simulated 24h target: funds credit the farmer’s demo wallet and mark the passport as secured collateral.')}`,
      command: { type: 'loan.disburse', loanId: loan.id },
    });
  };

  const repay = (customAmount?: number) => {
    setAttempted(true);
    const value = customAmount ?? Number(repayAmount);
    if (!isPositiveMoney(value) || value > loan.outstanding) return;
    confirm({
      title: t('ডেমো কিস্তি পরিশোধ নিশ্চিত করুন', 'Confirm demo repayment'),
      description: `${money(value)}\n${t('আপনার ডেমো ওয়ালেট থেকে কাটা হবে এবং বকেয়া কমবে।', 'This amount will be debited from your demo wallet and reduce the outstanding balance.')}`,
      command: { type: 'loan.repay', loanId: loan.id, amount: value },
      onSuccess: () => setRepayAmount(''),
    });
  };

  const grantGrace = () => {
    setAttempted(true);
    const days = Number(graceDays);
    if (!Number.isInteger(days) || days < 1 || days > 90 || graceNote.trim().length < 3) return;
    confirm({
      title: t('পরিশোধের সময় বৃদ্ধি নিশ্চিত করুন', 'Confirm repayment grace period'),
      description: `${days} ${t('দিন অতিরিক্ত সময় দেওয়া হবে।', 'days will be added to the repayment due date.')}`,
      command: { type: 'loan.grace', loanId: loan.id, days, note: graceNote.trim() },
    });
  };

  return (
    <Screen title={t('ঋণের বিস্তারিত', 'Loan details')} back testID="loan-detail">
      <FinanceHero
        icon="cash-outline"
        eyebrow={`${loan.id} · ${loan.annualRate}% ${t('বার্ষিক ডেমো হার', 'annual demo rate')}`}
        title={money(loan.amount)}
        detail={`${t('বকেয়া', 'Outstanding')}: ${money(loan.outstanding)}`}
      >
        <View style={s.progress}>
          <View style={[s.progressValue, { width: `${progressPercent}%` }]} />
        </View>
        <AppText variant="caption" color="#D8E9DE">
          {t('অগ্রগতি: প্রস্তাব → জমা → অনুমোদিত → বিতরণ', 'Stage: Offered → Submitted → Approved → Disbursed')}
        </AppText>
      </FinanceHero>

      <FinanceStatus status={loan.status} />

      <AnimalIdentity
        animal={animal}
        onPress={() => navigate(role!, role === 'farmer' ? 'animal' : 'passport', animal.id)}
      />

      <Card>
        <Detail label={t('খামারি / ঋণগ্রহীতা', 'Borrower')} value={borrower ? `${borrower.nameBn} (${borrower.district})` : loan.farmerId} />
        <Detail label={t('যাচাইকৃত জামানত মূল্য', 'Verified collateral value')} value={money(loan.collateralValue)} />
        <Detail label={t('সর্বোচ্চ ৭০% সীমা', 'Maximum 70% LTV cap')} value={money(cap)} />
        <Detail label={t('মেয়াদ', 'Term')} value={`${loan.termMonths} ${t('মাস', 'months')}`} />
        <Detail label={t('উদ্দেশ্য', 'Purpose')} value={loan.purpose} />
        <Detail label={t('পরিশোধের উৎস', 'Repayment source')} value={loan.repaymentSource} />
        <Detail label={t('পরিশোধের তারিখ', 'Due date')} value={loan.dueAt ? date(loan.dueAt) : '—'} />
        {loan.graceUntil ? <Detail label={t('বর্ধিত সময় (গ্রেস পিরিয়ড)', 'Grace period until')} value={date(loan.graceUntil)} /> : null}
      </Card>

      {animal.productionDrop ? (
        <Card style={s.warningPanel}>
          <View style={s.row}>
            <Icon name="warning-outline" color={colors.warning} />
            <AppText variant="label">{t('দুধ উৎপাদন হ্রাসের সংকেত', 'Milk production drop detected')}</AppText>
          </View>
          <AppText variant="small">
            {loan.graceUntil
              ? `${t('ব্যাংক পরিশোধের সময় বাড়িয়েছে:', 'The bank granted a repayment grace period until:')} ${date(loan.graceUntil)}`
              : t('পশুর অসুস্থতা বা উৎপাদন কমার কারণে ব্যাংক গ্রেস পিরিয়ড পর্যালোচনা করতে পারে।', 'The bank can review and grant a repayment grace period due to lower milk production.')}
          </AppText>
        </Card>
      ) : null}

      {loan.decisionNote ? (
        <Card>
          <AppText variant="label">{t('ব্যাংকের নোট', 'Bank note')}</AppText>
          <AppText>{loan.decisionNote}</AppText>
        </Card>
      ) : null}

      {role === 'farmer' && loan.status === 'offered' ? (
        <Card>
          <AppText variant="heading">{t('ঋণের শর্ত গ্রহণ করুন', 'Accept loan terms')}</AppText>
          <AppText variant="small" color={colors.muted}>
            {t('শর্ত গ্রহণ করলে আপনার পশুর স্বাস্থ্য পাসপোর্টসহ আবেদনটি ব্যাংকে জমা হবে।', 'Accepting submits your application and linked animal health passport to the bank.')}
          </AppText>
          <Choice
            label={t('আমি ডেমো সুদের হার ও জামানতের শর্তে সম্মত', 'I agree to the demo interest rate and collateral terms')}
            value={consent}
            onChange={setConsent}
            options={[
              { value: 'yes', label: t('সম্মত', 'I agree') },
              { value: 'no', label: t('না', 'Not now') },
            ]}
          />
          <Button
            title={t('শর্ত মেনে ব্যাংকে জমা দিন', 'Accept terms & submit application')}
            onPress={acceptOffer}
            disabled={busy || consent !== 'yes'}
            testID="accept-loan-offer"
          />
        </Card>
      ) : null}

      {role === 'farmer' && loan.status === 'active' ? (
        <Card>
          <AppText variant="heading">{t('কিস্তি ও ঋণ পরিশোধ', 'Loan repayment')}</AppText>
          <Detail label={t('আপনার ডেমো ওয়ালেট ব্যালেন্স', 'Your demo wallet balance')} value={money(walletBalance)} />
          <Detail label={t('বাকি ঋণ', 'Remaining balance')} value={money(loan.outstanding)} />
          <Field
            label={t('পরিশোধের পরিমাণ (টাকা)', 'Repayment amount (BDT)')}
            value={repayAmount}
            onChangeText={setRepayAmount}
            keyboardType="number-pad"
            testID="repay-amount-input"
            hint={`${t('সর্বোচ্চ', 'Max')}: ${money(loan.outstanding)}`}
            error={
              attempted && (!isPositiveMoney(Number(repayAmount)) || Number(repayAmount) > loan.outstanding)
                ? t('বকেয়ার মধ্যে পূর্ণ টাকার পরিমাণ দিন।', 'Enter a whole BDT amount up to the outstanding balance.')
                : undefined
            }
          />
          <Button
            title={t('নির্দিষ্ট পরিমাণ পরিশোধ করুন', 'Make repayment')}
            onPress={() => repay()}
            disabled={busy}
            testID="submit-repay"
          />
          <Button
            title={`${t('সম্পূর্ণ বকেয়া পরিশোধ', 'Pay full balance')} (${money(loan.outstanding)})`}
            variant="secondary"
            onPress={() => repay(loan.outstanding)}
            disabled={busy || walletBalance < loan.outstanding}
            testID="repay-full"
          />
        </Card>
      ) : null}

      {role === 'bank' && loan.status === 'submitted' ? (
        <Card>
          <AppText variant="heading">{t('ব্যাংক পর্যালোচনা ও সিদ্ধান্ত', 'Bank review and decision')}</AppText>
          <Button
            title={t('পশুর স্বাস্থ্য পাসপোর্ট দেখুন', 'Inspect animal health passport')}
            variant="secondary"
            icon="medkit-outline"
            onPress={() => navigate('bank', 'passport', animal.id)}
          />
          <Field
            label={t('সিদ্ধান্তের নোট', 'Decision note')}
            value={note}
            onChangeText={setNote}
            multiline
            testID="bank-decision-note"
            error={attempted && note.trim().length < 3 ? t('প্রত্যাখ্যান করতে কারণ লিখুন।', 'Enter a reason before declining.') : undefined}
          />
          <Button
            title={t('ঋণ অনুমোদন করুন', 'Approve loan application')}
            onPress={() => bankDecide(true)}
            disabled={busy}
            testID="approve-loan"
          />
          <Button
            title={t('আবেদন প্রত্যাখ্যান করুন', 'Decline application')}
            variant="danger"
            onPress={() => bankDecide(false)}
            disabled={busy}
            testID="reject-loan"
          />
        </Card>
      ) : null}

      {role === 'bank' && loan.status === 'approved' ? (
        <Card>
          <AppText variant="heading">{t('ডেমো ঋণ বিতরণ', 'Simulated loan disbursement')}</AppText>
          <AppText variant="small" color={colors.muted}>
            {t('অনুমোদিত অর্থ খামারির ডেমো ওয়ালেটে পাঠানো হবে এবং পশুটি সক্রিয় জামানত হিসেবে চিহ্নিত হবে।', 'Approved funds will be credited to the farmer’s demo wallet and the animal will be marked as active collateral.')}
          </AppText>
          <Button
            title={t('ডেমো অর্থ বিতরণ করুন', 'Simulate disbursement')}
            onPress={disburse}
            disabled={busy}
            testID="disburse-loan"
          />
        </Card>
      ) : null}

      {role === 'bank' && loan.status === 'active' && animal.productionDrop && !loan.graceUntil ? (
        <Card>
          <AppText variant="heading">{t('গ্রেস পিরিয়ড অনুমোদন (UC-003)', 'Grant repayment grace period (UC-003)')}</AppText>
          <Choice
            label={t('অতিরিক্ত সময় (দিন)', 'Extension (days)')}
            value={graceDays}
            onChange={setGraceDays}
            options={[
              { value: '15', label: t('১৫ দিন', '15 days') },
              { value: '30', label: t('৩০ দিন', '30 days') },
              { value: '60', label: t('৬০ দিন', '60 days') },
            ]}
          />
          <Field
            label={t('অনুমোদনের নোট', 'Approval note')}
            value={graceNote}
            onChangeText={setGraceNote}
            testID="grace-note"
          />
          <Button
            title={t('গ্রেস পিরিয়ড মঞ্জুর করুন', 'Grant grace period')}
            onPress={grantGrace}
            disabled={busy}
            testID="grant-grace"
          />
        </Card>
      ) : null}

      <PaymentHistory items={relatedPayments} title={t('এই ঋণের লেনদেন', 'Transactions for this loan')} />
      <DemoNotice />
      {dialog}
    </Screen>
  );
}

export function FarmerWallet() {
  const { state, user, t, money } = useDemo();
  if (!user) return <MissingRecord />;
  const balance = demoBalance(state, user.id);
  const policies = state.policies.filter(item => item.farmerId === user.id);
  const claims = state.claims.filter(item => item.farmerId === user.id);
  const loans = state.loans.filter(item => item.farmerId === user.id);
  const payments = state.payments.filter(item => item.userId === user.id);
  const activeCoverage = policies
    .filter(item => item.status === 'active')
    .reduce((sum, item) => sum + item.coverage, 0);
  const activeDebt = loans
    .filter(item => item.status === 'active')
    .reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <Screen title={t('আর্থিক হাব ও ওয়ালেট', 'Financial hub & wallet')} testID="farmer-wallet">
      <FinanceHero
        icon="wallet-outline"
        eyebrow={t('ডেমো ওয়ালেট ব্যালেন্স', 'Simulated wallet balance')}
        title={money(balance)}
        detail={`${t('সক্রিয় বীমা', 'Active coverage')}: ${money(activeCoverage)} · ${t('বকেয়া ঋণ', 'Loan debt')}: ${money(activeDebt)}`}
      />

      <Section title={t('আর্থিক সেবা', 'Financial services')}>
        <Card>
          <Row
            title={t('পশুবীমা ও পলিসি', 'Livestock insurance & policies')}
            subtitle={t('কভারেজ দেখুন ও নতুন বীমার আবেদন করুন', 'Review coverage and apply for new policies')}
            icon="shield-checkmark-outline"
            onPress={() => navigate('farmer', 'insurance')}
            testID="wallet-insurance"
          />
          <Row
            title={t('বীমার দাবি জমা দিন', 'Submit an insurance claim')}
            subtitle={t('নমুনা ছবি ও GPS প্রমাণসহ দাবি করুন', 'File an illness or death claim with sample evidence')}
            icon="document-attach-outline"
            onPress={() => navigate('farmer', 'claim-apply')}
            testID="wallet-claim-apply"
          />
          <Row
            title={t('পশু জামানত ঋণ', 'Livestock collateral loans')}
            subtitle={t('৭০% পর্যন্ত জামানত ঋণের প্রস্তাব ও কিস্তি পরিশোধ', 'Explore 70% LTV offers and make repayments')}
            icon="cash-outline"
            onPress={() => navigate('farmer', 'loans')}
            testID="wallet-loans"
          />
          <Row
            title={t('নতুন ঋণের আবেদন', 'Apply for a farm loan')}
            subtitle={t('স্বাস্থ্য পাসপোর্ট যাচাই করে তাৎক্ষণিক প্রস্তাব', 'Instant demo offer from your animal’s health passport')}
            icon="trending-up-outline"
            onPress={() => navigate('farmer', 'loan-apply')}
            testID="wallet-loan-apply"
          />
        </Card>
      </Section>

      <Section title={t('চলমান ঋণ', 'Current loans')}>
        {loans.length ? (
          loans.slice(0, 3).map(loan => <LoanTile key={loan.id} loan={loan} />)
        ) : (
          <EmptyState title={t('কোনো ঋণ নেই', 'No loans')} />
        )}
      </Section>

      <Section title={t('বীমা ও দাবি', 'Insurance & claims')}>
        {policies.slice(0, 2).map(policy => <PolicyTile key={policy.id} policy={policy} />)}
        {claims.slice(0, 2).map(claim => <ClaimTile key={claim.id} claim={claim} />)}
      </Section>

      <PaymentHistory items={payments} />
      <DemoNotice />
    </Screen>
  );
}

export function PassportScreen({ id, role }: { id?: string; role: 'bank' | 'insurer' }) {
  const { state, t } = useDemo();
  const animal = state.animals.find(item => item.id === id);
  return (
    <Screen title={t('পশুর স্বাস্থ্য পাসপোর্ট', 'Animal health passport')} back testID={`${role}-passport`}>
      {animal ? <LinkedPassport animal={animal} role={role} /> : <MissingRecord />}
    </Screen>
  );
}
