import { Link } from 'expo-router';
import { View } from 'react-native';
import DemoLogin from '@/features/auth/login';
export default function Login() {
  return <View style={{ flex: 1 }}><Link href="/identity" style={{ padding: 12, textAlign: 'center' }}>যাচাইকৃত ফোনে সাইন ইন · Verified phone sign-in</Link><DemoLogin /></View>;
}
