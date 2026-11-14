import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CommandResult, DemoCommand } from '@palito/shared';
import { AppText, Badge, Button, Card, Confirm, EmptyState, Screen, type Tone } from '@/components/ui';
import { navigate } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';

const labels: Record<string, string> = {
  requested: 'অনুরোধ পাঠানো', accepted: 'নিশ্চিত', rejected: 'প্রত্যাখ্যাত', cancelled: 'বাতিল', in_progress: 'চলছে', completed: 'সম্পন্ন',
  routine: 'নিয়মিত', urgent: 'অগ্রাধিকার', emergency: 'জরুরি', healthy: 'সুস্থ', attention: 'যত্ন প্রয়োজন', critical: 'সংকটাপন্ন', deceased: 'মৃত', sold: 'স্থানান্তরিত',
  submitted: 'জমা হয়েছে', active: 'সক্রিয়', expired: 'মেয়াদ শেষ', settled: 'নিষ্পত্তি', manual_review: 'পর্যালোচনাধীন', vet_review: 'চিকিৎসকের পর্যালোচনা', approved: 'অনুমোদিত', paid: 'পরিশোধিত', offered: 'প্রস্তাব',
  placed: 'অর্ডার হয়েছে', confirmed: 'নিশ্চিত', shipped: 'পথে আছে', delivered: 'পৌঁছেছে', draft: 'খসড়া', published: 'প্রকাশিত', suspended: 'স্থগিত',
  open: 'খোলা', acknowledged: 'গৃহীত', escalated: 'এসকেলেট হয়েছে', resolved: 'সমাধান হয়েছে', video: 'ভিডিও', visit: 'খামারে',
  cattle: 'গরু', goat: 'ছাগল', buffalo: 'মহিষ', registration: 'নিবন্ধন', checkup: 'পরীক্ষা', vaccination: 'টিকা', treatment: 'চিকিৎসা', death: 'মৃত্যু',
};
export function Status({ value }: { value: string }) {
  const { t } = useDemo();
  const tone: Tone = ['rejected', 'cancelled', 'critical', 'deceased', 'suspended'].includes(value) ? 'danger' : ['accepted', 'completed', 'active', 'paid', 'delivered', 'published', 'healthy', 'resolved'].includes(value) ? 'success' : ['urgent', 'emergency', 'escalated', 'attention', 'manual_review', 'vet_review'].includes(value) ? 'warning' : 'info';
  return <Badge tone={tone}>{t(labels[value] ?? value, value.replaceAll('_', ' '))}</Badge>;
}
export function Meta({ label, value }: { label: string; value: string | number }) {
  return <View style={s.meta}><AppText variant="small" color={colors.muted} style={s.label}>{label}</AppText><AppText variant="label" style={s.value}>{value}</AppText></View>;
}
export function DemoNotice({ bn, en }: { bn?: string; en?: string }) {
  const { t } = useDemo();
  if (!bn && !en) return null;
  return <Card style={s.notice}><AppText variant="small" color={colors.brandDark}>{t(bn ?? '', en ?? '')}</AppText></Card>;
}
export function Missing({ title }: { title?: string }) {
  const { t, role } = useDemo();
  return <Screen title={t('তথ্য পাওয়া যায়নি', 'Not available')} back><EmptyState title={title ?? t('এই রেকর্ডটি আপনার জন্য উপলব্ধ নয়', 'This record is not available to your account')} description={t('রেকর্ডটি মুছে যেতে পারে বা আপনার অনুমতি নেই।', 'It may have been removed, or your account may not have access.')} action={<Button title={t('হোমে ফিরুন', 'Return home')} onPress={() => role && navigate(role, 'home')} />} /></Screen>;
}
export function useConfirmAction() {
  const { run, busy, t } = useDemo();
  const [request, setRequest] = useState<{ command: DemoCommand; title: string; description: string; danger: boolean; done?: (result: Extract<CommandResult, { ok: true }>) => void } | null>(null);
  function open(command: DemoCommand, title: string, description: string, done?: (result: Extract<CommandResult, { ok: true }>) => void, danger = false) {
    setRequest({ command: { ...command, requestId: command.requestId ?? `${command.type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }, title, description, done, danger });
  }
  async function submit() { if (!request) return; const result = await run(request.command); if (result.ok) { setRequest(null); request.done?.(result); } }
  return { open, dialog: <Confirm visible={Boolean(request)} title={request?.title ?? ''} description={request?.description ?? ''} confirmLabel={t('নিশ্চিত করুন', 'Confirm')} cancelLabel={t('ফিরে যান', 'Go back')} onConfirm={() => void submit()} onCancel={() => setRequest(null)} danger={request?.danger} loading={busy} /> };
}
export const layout = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }, stack: { gap: 12 }, split: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' }, flex: { flex: 1 }, avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandPale }, image: { width: '100%', height: 180, borderRadius: 16 }, darkCard: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep } });
const s = StyleSheet.create({ meta: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }, label: { flex: 1 }, value: { flex: 1, textAlign: 'right' }, notice: { backgroundColor: colors.brandPale, borderColor: '#D8E9DE' } });
