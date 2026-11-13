import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { type ComponentProps, type ReactNode, useId } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextProps,
  type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '@/theme';
import { useLocale } from '@/providers/locale';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export function Icon({ name, size = 22, color = colors.brand }: { name: IconName; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} accessible={false} />;
}

export function AppText({ variant = 'body', color, style, ...props }: TextProps & {
  variant?: 'body' | 'small' | 'caption' | 'title' | 'heading' | 'label' | 'hero'; color?: string;
}) {
  return <Text {...props} style={[styles.text, textVariants[variant], color ? { color } : undefined, style]} />;
}

export function Screen({ children, title, subtitle, back = false, action, scroll = true, style, testID }: {
  children: ReactNode; title?: string; subtitle?: string; back?: boolean; action?: ReactNode;
  scroll?: boolean; style?: StyleProp<ViewStyle>; testID?: string;
}) {
  const insets = useSafeAreaInsets();
  const locale = useLocale();
  const body = <View style={[styles.content, style]}>{children}</View>;
  return <KeyboardAvoidingView testID={testID} style={[styles.screen, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {title ? <View style={styles.header}>
      {back ? <Pressable accessibilityLabel={locale === 'bn' ? 'ফিরে যান' : 'Back'} accessibilityRole="button" testID="back-button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.iconButton}><Icon name="arrow-back" color={colors.text} /></Pressable> : null}
      <View style={styles.flex}><AppText variant="title" accessibilityRole="header">{title}</AppText>{subtitle ? <AppText variant="small" color={colors.muted}>{subtitle}</AppText> : null}</View>
      {action}
    </View> : null}
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }} showsVerticalScrollIndicator={false}>{body}</ScrollView> : body}
  </KeyboardAvoidingView>;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, icon, testID, style, accessibilityLabel }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; disabled?: boolean;
  loading?: boolean; icon?: IconName; testID?: string; style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}) {
  const foreground = variant === 'primary' || variant === 'danger' ? colors.surface : colors.brandDark;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} accessibilityState={{ disabled: disabled || loading, busy: loading }} testID={testID} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, buttonVariants[variant], (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}>
    {loading ? <ActivityIndicator size="small" color={foreground} /> : icon ? <Icon name={icon} color={foreground} size={20} /> : null}
    <AppText variant="label" color={foreground} style={styles.buttonText}>{title}</AppText>
  </Pressable>;
}

export function Card({ children, style, onPress, testID, accessibilityLabel }: {
  children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string; accessibilityLabel?: string;
}) {
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} testID={testID} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>{children}</Pressable> : <View testID={testID} style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, error, hint, style, ...props }: TextInputProps & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return <View style={styles.field}>
    <AppText nativeID={`${id}-label`} variant="label">{label}</AppText>
    <TextInput accessibilityLabel={label} accessibilityLabelledBy={`${id}-label`} placeholderTextColor={colors.muted} autoCorrect={false} {...props} style={[styles.input, props.multiline && styles.multiline, error ? styles.inputError : undefined, style]} />
    {error ? <AppText accessibilityRole="alert" variant="small" color={colors.danger}>{error}</AppText> : hint ? <AppText variant="small" color={colors.muted}>{hint}</AppText> : null}
  </View>;
}

export function Choice<T extends string>({ label, value, options, onChange, testID }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; testID?: string;
}) {
  return <View style={styles.field} testID={testID}><AppText variant="label">{label}</AppText><View style={styles.wrap}>
    {options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: value === option.value }} testID={testID ? `${testID}-${option.value}` : undefined} onPress={() => onChange(option.value)} style={[styles.choice, value === option.value && styles.choiceSelected]}><AppText variant="label" color={value === option.value ? colors.brandDark : colors.muted}>{option.label}</AppText></Pressable>)}
  </View></View>;
}

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
const tones = {
  success: { backgroundColor: colors.brandPale, color: colors.brandDark },
  warning: { backgroundColor: colors.warningPale, color: colors.warning },
  danger: { backgroundColor: colors.dangerPale, color: colors.danger },
  info: { backgroundColor: colors.infoPale, color: colors.info },
  neutral: { backgroundColor: colors.background, color: colors.muted },
};
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <View style={[styles.badge, { backgroundColor: tones[tone].backgroundColor }]}><AppText variant="caption" color={tones[tone].color}>{children}</AppText></View>;
}
export function Section({ title, children, action, style }: { title: string; children: ReactNode; action?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.section, style]}><View style={styles.row}><AppText variant="heading" accessibilityRole="header" style={styles.flex}>{title}</AppText>{action}</View>{children}</View>;
}
export function Row({ title, subtitle, icon, trailing, onPress, testID, danger = false }: {
  title: string; subtitle?: string; icon?: IconName; trailing?: ReactNode; onPress?: () => void; testID?: string; danger?: boolean;
}) {
  const content = <>{icon ? <View style={[styles.rowIcon, danger && { backgroundColor: colors.dangerPale }]}><Icon name={icon} color={danger ? colors.danger : colors.brand} /></View> : null}<View style={styles.flex}><AppText variant="label" color={danger ? colors.danger : colors.text}>{title}</AppText>{subtitle ? <AppText variant="small" color={colors.muted}>{subtitle}</AppText> : null}</View>{trailing ?? (onPress ? <Icon name="chevron-forward" color={colors.muted} size={18} /> : null)}</>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} testID={testID} onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>{content}</Pressable> : <View style={styles.listRow}>{content}</View>;
}
export function EmptyState({ title, description, icon = 'leaf-outline', action }: { title: string; description?: string; icon?: IconName; action?: ReactNode }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Icon name={icon} size={34} /></View><AppText variant="heading" style={styles.center}>{title}</AppText>{description ? <AppText color={colors.muted} style={styles.center}>{description}</AppText> : null}{action}</View>;
}
export function LoadingState({ label }: { label?: string }) {
  const locale = useLocale();
  const text = label ?? (locale === 'bn' ? 'লোড হচ্ছে…' : 'Loading…');
  return <View accessibilityRole="progressbar" accessibilityLabel={text} style={styles.empty}><ActivityIndicator size="large" color={colors.brand} /><AppText color={colors.muted}>{text}</AppText></View>;
}
export function ErrorState({ title, description, retry, retryLabel }: { title: string; description?: string; retry?: () => void; retryLabel?: string }) {
  const locale = useLocale();
  return <View accessibilityRole="alert" style={styles.error}><Icon name="alert-circle-outline" color={colors.danger} /><AppText variant="label" color={colors.danger}>{title}</AppText>{description ? <AppText>{description}</AppText> : null}{retry ? <Button title={retryLabel ?? (locale === 'bn' ? 'আবার চেষ্টা' : 'Retry')} variant="secondary" onPress={retry} /> : null}</View>;
}
export function Confirm({ visible, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false, loading = false }: {
  visible: boolean; title: string; description: string; confirmLabel: string; cancelLabel: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean; loading?: boolean;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={styles.scrim}><View accessibilityViewIsModal style={styles.dialog}><AppText variant="title">{title}</AppText><AppText color={colors.muted}>{description}</AppText><Button title={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} testID="confirm-action" /><Button title={cancelLabel} variant="ghost" onPress={onCancel} disabled={loading} /></View></View></Modal>;
}
export function Stat({ label, value, icon }: { label: string; value: string | number; icon?: IconName }) {
  return <View style={styles.stat}>{icon ? <Icon name={icon} size={20} /> : null}<AppText variant="title" color={colors.brandDark}>{value}</AppText><AppText variant="small" color={colors.muted} style={styles.center}>{label}</AppText></View>;
}
export function Divider() { return <View style={styles.divider} />; }

const textVariants = StyleSheet.create<Record<string, TextStyle>>({
  body: { fontSize: 17, lineHeight: 25 }, small: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 20, fontFamily: fonts.medium },
  label: { fontSize: 16, lineHeight: 24, fontFamily: fonts.semibold },
  title: { fontSize: 24, lineHeight: 33, fontFamily: fonts.bold },
  heading: { fontSize: 20, lineHeight: 29, fontFamily: fonts.semibold },
  hero: { fontSize: 34, lineHeight: 44, fontFamily: fonts.bold },
});
const buttonVariants = StyleSheet.create({
  primary: { backgroundColor: colors.brand }, secondary: { backgroundColor: colors.brandPale, borderColor: '#B7D8C2', borderWidth: 1 },
  danger: { backgroundColor: colors.danger }, ghost: { backgroundColor: 'transparent' },
});
const styles = StyleSheet.create({
  text: { color: colors.text, fontFamily: fonts.regular, flexShrink: 1 },
  screen: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  content: { padding: 20, gap: 20 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconButton: { minHeight: 48, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 50, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { textAlign: 'center' }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.75 },
  card: { borderRadius: radii.lg, padding: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12 },
  field: { gap: 6 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 12, minHeight: 52, color: colors.text, fontFamily: fonts.regular, fontSize: 17 },
  multiline: { minHeight: 108, textAlignVertical: 'top' }, inputError: { borderColor: colors.danger },
  choice: { minHeight: 46, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center' },
  choiceSelected: { borderColor: colors.brand, backgroundColor: colors.brandPale }, badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill },
  section: { gap: 12 }, listRow: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 64, paddingVertical: 10 },
  rowIcon: { height: 44, width: 44, borderRadius: 12, backgroundColor: colors.brandPale, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 24, gap: 14, alignItems: 'center', justifyContent: 'center' }, emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandPale, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' }, error: { padding: 16, gap: 8, backgroundColor: colors.dangerPale, borderRadius: radii.md },
  scrim: { flex: 1, backgroundColor: '#0A401E99', justifyContent: 'center', alignItems: 'center', padding: 24 }, dialog: { width: '100%', maxWidth: 420, padding: 24, gap: 16, backgroundColor: colors.surface, borderRadius: radii.xl },
  stat: { flex: 1, alignItems: 'center', gap: 4, padding: 12, minWidth: 84, backgroundColor: colors.surface, borderRadius: radii.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
