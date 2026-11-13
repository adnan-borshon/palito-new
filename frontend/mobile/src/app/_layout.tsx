import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palitoFonts } from '@/assets/palito/manifest';
import { DemoProvider } from '@/providers/demo';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...palitoFonts, ...Ionicons.font });
  useEffect(() => { if (fontsLoaded || fontError) SplashScreen.hide(); }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  return <SafeAreaProvider><View style={styles.frame}><View style={styles.canvas}><DemoProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  </DemoProvider></View></View></SafeAreaProvider>;
}
const styles = StyleSheet.create({ frame: { flex: 1, backgroundColor: '#DCE6DF', alignItems: 'center' }, canvas: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 480 : undefined, backgroundColor: colors.background } });
