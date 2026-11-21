import { Text, View } from 'react-native';
import { Link } from 'expo-router';
export default function IdentityScreen() { return <View style={{ padding: 24 }}><Text>Use the Palito website to sign in from a browser. Native sign-in needs a configured development build.</Text><Link href="/demo">নমুনা · Try the demo</Link></View>; }
