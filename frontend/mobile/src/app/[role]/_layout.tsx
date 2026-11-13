import { Redirect, Stack, router, useLocalSearchParams, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppFeedback } from '@/components/app-feedback';
import { AppText, Icon, LoadingState } from '@/components/ui';
import { isRole, roleTabs, routeFor } from '@/navigation';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';

export default function RoleLayout() {
  const { role: routeRole } = useLocalSearchParams<{ role: string }>();
  const { ready, user, locale, state, t } = useDemo();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (!ready) return <LoadingState />;
  if (!user) return <Redirect href="/login" />;
  if (!isRole(routeRole) || routeRole !== user.role) return <Redirect href={routeFor(user.role)} />;
  return <View style={styles.shell}>
    {state.settings.offline ? <View style={[styles.offline, { paddingTop: insets.top + 4 }]}><Icon name="cloud-offline-outline" color={colors.warning} size={17} /><AppText variant="small" color={colors.warning}>{t('অফলাইন ডেমো · তথ্য এই ডিভাইসে আছে', 'Offline demo · data is on this device')}</AppText></View> : null}
    <AppFeedback />
    <Stack screenOptions={{ headerShown: false }} />
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {roleTabs[user.role].map(tab => {
        const selected = path.split('/')[2] === tab.screen;
        return <Pressable key={tab.screen} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={tab.label[locale]} testID={`tab-${tab.screen}`} onPress={() => router.navigate(routeFor(user.role, tab.screen))} style={({ pressed }) => [styles.tab, pressed && { opacity: 0.65 }]}>
          <View style={[styles.tabIcon, selected && styles.selectedIcon]}><Icon name={tab.icon} color={selected ? colors.brand : colors.muted} size={23} /></View>
          <AppText variant="caption" color={selected ? colors.brandDark : colors.muted} style={styles.tabLabel}>{tab.label[locale]}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}
const styles = StyleSheet.create({ shell: { flex: 1, backgroundColor: colors.background }, tabs: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6, paddingHorizontal: 4 }, tab: { flex: 1, alignItems: 'center', minHeight: 58, paddingHorizontal: 2, gap: 1 }, tabLabel: { textAlign: 'center', fontSize: 12, lineHeight: 18 }, tabIcon: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 }, selectedIcon: { backgroundColor: colors.brandPale }, offline: { paddingHorizontal: 16, paddingBottom: 4, backgroundColor: colors.warningPale, flexDirection: 'row', gap: 8, alignItems: 'center' } });
