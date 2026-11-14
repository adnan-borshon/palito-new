import { memo } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Animal } from '@palito/shared';
import { AppText, Badge, Card, Icon } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { navigate } from '@/navigation';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';

export const go = (screen: string, id?: string) => navigate('farmer', screen, id);

export function TextLink({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={s.textLink}><AppText variant="small" color={colors.brandDark}>{title}</AppText><Icon name="arrow-forward" size={17} /></Pressable>;
}

export function AnimalStatus({ animal }: { animal: Animal }) {
  const { t } = useDemo();
  const labels = {
    healthy: t('সুস্থ', 'Healthy'), attention: t('যত্ন প্রয়োজন', 'Needs attention'),
    critical: t('জরুরি', 'Critical'), deceased: t('মারা গেছে', 'Deceased'), sold: t('সংরক্ষিত', 'Archived'),
  };
  return <Badge tone={animal.status === 'healthy' ? 'success' : animal.status === 'attention' ? 'warning' : animal.status === 'critical' ? 'danger' : 'neutral'}>{labels[animal.status]}</Badge>;
}

export const AnimalCard = memo(function AnimalCard({ animal, onPress }: { animal: Animal; onPress?: () => void }) {
  const { state, t, locale } = useDemo();
  const policy = state.policies.some(p => p.animalId === animal.id && p.status === 'active');
  const pledged = state.loans.some(l => l.animalId === animal.id && ['offered', 'submitted', 'approved', 'active'].includes(l.status));
  const years = Math.max(0, (Date.parse(state.now) - Date.parse(animal.birthDate)) / (365.25 * 86400000));
  const age = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en', { maximumFractionDigits: 1 }).format(years);
  const score = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en').format(animal.healthScore);
  return <Card testID={'animal-card-' + animal.id} accessibilityLabel={animal.name + ', ' + animal.tag} onPress={onPress ?? (() => go('animal', animal.id))} style={s.animalCard}>
    <View style={s.row}>
      {animal.species === 'cattle' ? <Image source={palitoImages.cow} contentFit="contain" style={s.cow} accessibilityLabel={t('প্রাণীর ছবি', 'Animal photo')} /> : <View style={s.cowIcon}><Icon name="paw-outline" size={28} /></View>}
      <View style={s.flex}>
        <AppText variant="label">{animal.name} <AppText variant="small" color={colors.muted}>({animal.tag})</AppText></AppText>
        <AppText variant="small" color={colors.muted}>{animal.breed} · {age} {t('বছর', 'years')} · {animal.weightKg} {t('কেজি', 'kg')}</AppText>
        <View style={s.wrap}>
          <AnimalStatus animal={animal} />
          <Badge tone={animal.healthScore >= 75 ? 'info' : 'warning'}>{`♥ ${score}%`}</Badge>
          {policy ? <Badge tone="success">{t('বীমাকৃত', 'Insured')}</Badge> : null}
          {pledged ? <Badge tone="warning">{t('জামানতকৃত', 'Pledged')}</Badge> : null}
        </View>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.muted} />
    </View>
  </Card>;
});

export function MissingRecord({ title }: { title: string }) {
  const { t } = useDemo();
  return <Card><AppText variant="heading">{title}</AppText><AppText>{t('এই তথ্যটি পাওয়া যায়নি। তালিকায় ফিরে আবার নির্বাচন করুন।', 'This record is unavailable. Return to the list and select it again.')}</AppText><TextLink title={t('পশুর তালিকা', 'Animal list')} onPress={() => go('animals')} /></Card>;
}

export const s = StyleSheet.create({
  flex: { flex: 1 }, row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stack: { gap: 16 }, page: { padding: 16, gap: 24 }, noPadding: { padding: 0, gap: 0 },
  textLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  animalCard: { borderWidth: 0, borderRadius: 20, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  cow: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cowIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandPale },
  hero: { backgroundColor: colors.brandDeep, padding: 20, gap: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  iconButton: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
});

