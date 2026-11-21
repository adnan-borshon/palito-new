import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import DemoLogin from '@/features/auth/login';
export default function Demo() {
  return <View style={{ flex: 1 }}><Link href="/identity" style={{ padding: 12, textAlign: 'center' }}>যাচাইকৃত ফোনে সাইন ইন · Verified phone sign-in</Link><Text accessibilityRole="header" style={{ textAlign: "center" }}>নমুনা কর্মক্ষেত্র · Demo workspace</Text><DemoLogin /></View>;
}
