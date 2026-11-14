import { useRef, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { type Animal, type DemoCommand, type Payment, type Role } from '@palito/shared';
import { AppText, Badge, Button, Card, Confirm, EmptyState, Icon, Row, Section, type IconName, type Tone } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { navigate } from '@/navigation';
import { palitoImages } from '../../../assets/palito/manifest';

export const financeStyles = StyleSheet.create({
  hero: { backgroundColor: colors.brandDeep, borderRadius: 24, borderCurve: 'continuous', padding: 22, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, flex: { flex: 1 },
  mutedPanel: { backgroundColor: colors.brandPale, borderColor: colors.brandPale }, warningPanel: { backgroundColor: colors.warningPale, borderColor: '#FDE68A' },
  gap: { gap: 12 }, image: { height: 64, width: 76, borderRadius: 12, borderCurve: 'continuous', backgroundColor: colors.background },
  selection: { borderWidth: 2, borderColor: colors.brand }, radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  option: { minHeight: 76, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, borderCurve: 'continuous', backgroundColor: colors.surface, gap: 12 },
  amount: { fontVariant: ['tabular-nums'] }, imageLarge: { width: '100%', height: 160, borderRadius: 16, borderCurve: 'continuous' },
  progress: { backgroundColor: colors.border, height: 7, borderRadius: 4, overflow: 'hidden' },
  progressValue: { backgroundColor: colors.brand, height: 7, borderRadius: 4 },
});

export function FinanceHero({ eyebrow, title, detail, icon = 'shield-checkmark-outline', children }: { eyebrow: string; title: string; detail?: string; icon?: IconName; children?: ReactNode }) {
  return <View style={financeStyles.hero}><View style={financeStyles.row}><Icon name={icon} color={colors.surface} /><AppText variant="label" color={colors.surface}>{eyebrow}</AppText></View><AppText variant="hero" color={colors.surface}>{title}</AppText>{detail ? <AppText color="#D8E9DE">{detail}</AppText> : null}{children}</View>;
}
export function DemoNotice({ text }: { text?: string }) {
  const { t } = useDemo();
  if (!text) return null;
  return <Card style={financeStyles.warningPanel}><View style={financeStyles.row}><Icon name="information-circle-outline" color={colors.warning} /><AppText variant="label">{t('জরুরি নোট', 'Important note')}</AppText></View><AppText variant="small">{text}</AppText></Card>;
}
const statusLabels: Record<string, [string, string]> = {
  submitted: ['জমা হয়েছে', 'Submitted'], active: ['সক্রিয়', 'Active'], rejected: ['প্রত্যাখ্যাত', 'Declined'], expired: ['মেয়াদ শেষ', 'Expired'], settled: ['নিষ্পত্তি', 'Settled'],
  manual_review: ['মানবিক পর্যালোচনা', 'Manual review'], vet_review: ['পশুচিকিৎসকের কাছে', 'Veterinary review'], approved: ['অনুমোদিত', 'Approved'], paid: ['পরিশোধিত', 'Paid'], offered: ['প্রস্তাব প্রস্তুত', 'Offer ready'],
};
export function FinanceStatus({ status }: { status: string }) {
  const { t } = useDemo(); const label = statusLabels[status] ?? [status, status];
  const tone: Tone = ['active', 'approved', 'paid', 'settled'].includes(status) ? 'success' : ['rejected', 'expired'].includes(status) ? 'danger' : ['submitted', 'offered', 'manual_review', 'vet_review'].includes(status) ? 'warning' : 'neutral';
  return <Badge tone={tone}>{t(label[0], label[1])}</Badge>;
}
export function Detail({ label, value }: { label: string; value: string | number }) { return <Row title={label} trailing={<AppText variant="label" style={{ maxWidth: '58%', textAlign: 'right' }}>{value}</AppText>} />; }
export function MissingRecord() { const { t } = useDemo(); return <EmptyState icon="document-outline" title={t('তথ্য পাওয়া যায়নি', 'Record unavailable')} description={t('এই অ্যাকাউন্টে তথ্যটি নেই। তালিকায় ফিরে অন্যটি বেছে নিন।', 'This account cannot access that record. Return to the list and select another.')} />; }
export function AnimalIdentity({ animal, onPress }: { animal: Animal; onPress?: () => void }) {
  const { t } = useDemo();
  return <Card onPress={onPress} accessibilityLabel={`${animal.name} ${animal.tag}`}><View style={financeStyles.row}>{animal.species === 'cattle' ? <Image source={palitoImages.cow} contentFit="contain" style={financeStyles.image} accessibilityLabel={t('পশুর ছবি', 'Livestock image')} /> : <View style={[financeStyles.image, { alignItems: 'center', justifyContent: 'center' }]}><Icon name="paw-outline" size={30} /></View>}<View style={financeStyles.flex}><AppText variant="heading">{animal.name}</AppText><AppText variant="small" color={colors.muted}>{animal.tag} · {animal.breed}</AppText></View>{onPress ? <Icon name="chevron-forward" /> : null}</View></Card>;
}
export function AnimalOption({ animal, selected, onSelect, unavailable, children }: { animal: Animal; selected: boolean; onSelect: () => void; unavailable?: string; children?: ReactNode }) {
  const { t, money } = useDemo();
  return <Pressable accessibilityRole="radio" accessibilityLabel={`${animal.name}, ${animal.tag}${unavailable ? `. ${unavailable}` : ''}`} accessibilityState={{ checked: selected, disabled: Boolean(unavailable) }} disabled={Boolean(unavailable)} onPress={onSelect} testID={`select-${animal.id}`} style={[financeStyles.option, selected && financeStyles.selection]}>
    <View style={financeStyles.row}><View style={[financeStyles.radio, selected && { backgroundColor: colors.brand, borderColor: colors.brand }]}>{selected ? <Icon name="checkmark" color={colors.surface} size={18} /> : null}</View><View style={financeStyles.flex}><AppText variant="label">{animal.name} · {animal.tag}</AppText><AppText variant="small" color={colors.muted}>{t('আনুমানিক মূল্য', 'Estimated value')}: {money(animal.value)}</AppText></View></View>
    {unavailable ? <AppText variant="small" color={colors.danger}>{unavailable}</AppText> : children}
  </Pressable>;
}

let requestSequence = 0;
type Confirmation = { command: DemoCommand; title: string; description: string; danger?: boolean; onSuccess?: (id?: string) => void };
/** Retains the exact request ID and payload while a failed financial confirmation is retried. */
export function useFinanceConfirmation() {
  const { run, busy, t } = useDemo(); const [pending, setPending] = useState<Confirmation | null>(null); const [error, setError] = useState(''); const running = useRef(false);
  const confirm = (request: Confirmation) => { setError(''); setPending({ ...request, command: { ...request.command, requestId: request.command.requestId ?? `mobile-finance-${Date.now()}-${++requestSequence}` } }); };
  const submit = async () => {
    if (!pending || running.current) return; running.current = true;
    try {
      const result = await run(pending.command);
      if (result.ok) { setPending(null); setError(''); pending.onSuccess?.(result.id); }
      else setError(result.message[t('bn', 'en') as 'bn' | 'en']);
    } finally { running.current = false; }
  };
  const dialog = pending ? <Confirm visible title={pending.title} description={`${pending.description}${error ? `\n\n${error}` : ''}`} confirmLabel={error ? t('আবার চেষ্টা করুন', 'Retry') : t('নিশ্চিত করুন', 'Confirm')} cancelLabel={t('ফিরে যান', 'Go back')} onConfirm={() => void submit()} onCancel={() => { if (!running.current) setPending(null); }} loading={busy} danger={pending.danger} /> : null;
  return { confirm, dialog };
}

const paymentLabels: Record<Payment['kind'], [string, string]> = {
  loan_disbursement: ['ঋণ বিতরণ', 'Loan disbursement'], repayment: ['ঋণ পরিশোধ', 'Loan repayment'], insurance_payout: ['বীমা পেআউট', 'Insurance payout'], debt_settlement: ['জামানতের ঋণ সমন্বয়', 'Collateral settlement'], order: ['অর্ডার / ফেরত', 'Order / refund'], premium: ['বীমা প্রিমিয়াম', 'Insurance premium'],
};
export function PaymentHistory({ items, title }: { items: Payment[]; title?: string }) {
  const { t, money, date } = useDemo(); const [limit, setLimit] = useState(12); const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Section title={title ?? t('লেনদেনের ইতিহাস', 'Transaction history')}>{sorted.length === 0 ? <EmptyState icon="receipt-outline" title={t('এখনও লেনদেন নেই', 'No transactions yet')} description={t('ঋণ পরিশোধ, বিতরণ বা বীমা পেআউট হলে এখানে দেখা যাবে।', 'Repayments, disbursements, and payouts will appear here.')} /> : sorted.slice(0, limit).map(item => <Card key={item.id} testID={`payment-${item.id}`}><View style={financeStyles.row}><Icon name={item.direction === 'credit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'} /><View style={financeStyles.flex}><AppText variant="label">{t(...paymentLabels[item.kind])}</AppText><AppText variant="small" color={colors.muted}>{date(item.createdAt)}</AppText></View><AppText variant="label" color={item.direction === 'credit' ? colors.brandDark : colors.text}>{item.direction === 'credit' ? '+' : '−'}{money(item.amount)}</AppText></View><AppText variant="caption" color={colors.muted}>{t('রসিদ', 'Receipt')}: {item.id}</AppText></Card>)}{sorted.length > limit ? <Button title={t('আরও দেখুন', 'Show more')} variant="secondary" onPress={() => setLimit(value => value + 12)} /> : null}</Section>;
}

export function LinkedPassport({ animal, role }: { animal: Animal; role: Role }) {
  const { state, t, money, date } = useDemo(); const owner = state.users.find(user => user.id === animal.ownerId); const records = state.records.filter(record => record.animalId === animal.id);
  return <><AnimalIdentity animal={animal} /><Card><Detail label={t('মালিক', 'Owner')} value={owner?.name ?? '—'} /><Detail label={t('জেলা', 'District')} value={owner?.district ?? '—'} /><Detail label={t('ওজন', 'Weight')} value={`${animal.weightKg} ${t('কেজি', 'kg')}`} /><Detail label={t('আনুমানিক মূল্য', 'Estimated value')} value={money(animal.value)} /><Detail label={t('স্বাস্থ্য স্কোর', 'Health score')} value={`${animal.healthScore}/100`} /></Card><Section title={t('স্বাস্থ্য ইতিহাস', 'Health history')}>{records.map(record => <Card key={record.id}><AppText variant="label">{t(record.title.bn, record.title.en)}</AppText><AppText>{record.note}</AppText><AppText variant="small" color={colors.muted}>{date(record.createdAt)}</AppText></Card>)}</Section><Button title={t('আবেদনে ফিরে যান', 'Back to applications')} variant="secondary" onPress={() => navigate(role, 'applications')} /></>;
}
