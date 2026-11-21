import { Link, Redirect, Stack, router, useLocalSearchParams, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppFeedback } from '@/components/app-feedback';
import { AppText, Icon, LoadingState, ScreenInsetContext } from '@/components/ui';
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
  return <ScreenInsetContext.Provider value={false}><View style={[styles.shell, { paddingTop: insets.top }]}>
    {state.settings.offline ? <View style={styles.offline}><Icon name="cloud-offline-outline" color={colors.warning} size={17} /><AppText variant="small" color={colors.warning}>{t('অফলাইন মোড · সংরক্ষিত তথ্য দেখানো হচ্ছে', 'Offline mode · showing cached records')}</AppText></View> : null}
    <AppFeedback />
    {(user.role === 'farmer' || user.role === 'vet') && path.split('/')[2] === 'home' && (
      <View style={styles.carePreview}>
        <AppText variant="small">{t('নমুনা দেখুন', 'Demo preview')}</AppText>
        <Link href="/care" style={styles.liveCare}>{t('যাচাইকৃত ড্যাশবোর্ড', 'Open live care')}</Link>
      </View>
    )}
    <Stack screenOptions={{ headerShown: false }} />
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {roleTabs[user.role].map(tab => {
        const selected = path.split('/')[2] === tab.screen;
        const isFarmerCenter = user.role === 'farmer' && tab.screen === 'ai';
        return <Pressable key={tab.screen} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={tab.label[locale]} testID={`tab-${tab.screen}`} onPress={() => router.navigate(routeFor(user.role, tab.screen))} style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}>
          {isFarmerCenter ? (
            <View style={[styles.centerFab, selected && styles.centerFabActive]}>
              <Icon name={tab.icon} color="#FFFFFF" size={24} />
            </View>
          ) : (
            <>
              <View style={[styles.tabIcon, selected && styles.selectedIcon]}><Icon name={tab.icon} color={selected ? colors.brand : colors.muted} size={22} /></View>
              <AppText variant="caption" color={selected ? colors.brand : colors.muted} style={styles.tabLabel}>{tab.label[locale]}</AppText>
            </>
          )}
        </Pressable>;
      })}
    </View>
  </View></ScreenInsetContext.Provider>;
}
const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
  carePreview: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.brandPale, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  liveCare: { paddingVertical: 8, color: colors.brandDark, textDecorationLine: 'underline' },
  tabs: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 58, paddingHorizontal: 2, gap: 2 },
  tabLabel: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  tabIcon: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  selectedIcon: { backgroundColor: colors.brandPale },
  centerFab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5 },
  centerFabActive: { backgroundColor: colors.brandDark, borderWidth: 2, borderColor: '#D8E9DE' },
  offline: { paddingHorizontal: 16, paddingBottom: 4, backgroundColor: colors.warningPale, flexDirection: 'row', gap: 8, alignItems: 'center' },
});
