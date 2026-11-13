import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';

export function AppFeedback() {
  const { error, feedback, clearError, clearFeedback, t } = useDemo();
  if (!error && !feedback) return null;
  return <View accessibilityLiveRegion="polite" style={[styles.container, error ? styles.error : styles.success]}>
    <Icon name={error ? 'alert-circle-outline' : 'checkmark-circle-outline'} color={error ? colors.danger : colors.brand} />
    <AppText variant="small" style={styles.text}>{error ?? feedback}</AppText>
    <Pressable accessibilityRole="button" accessibilityLabel={t('বার্তা বন্ধ করুন', 'Dismiss message')} onPress={() => { clearError(); clearFeedback(); }} style={styles.close}><Icon name="close" color={colors.muted} size={20} /></Pressable>
  </View>;
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }, error: { backgroundColor: colors.dangerPale }, success: { backgroundColor: colors.brandPale }, text: { flex: 1 }, close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' } });
