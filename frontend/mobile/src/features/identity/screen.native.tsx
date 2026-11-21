import {lazy,Suspense} from 'react';
import {Text, View} from 'react-native';
import {Link} from 'expo-router';
const Enabled=lazy(()=>import('./screen-enabled.native'));
export default function ConfiguredIdentity(){
 if(process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED!=='true')return <View style={{ padding: 24, gap: 16 }}><Text>Native sign-in requires a configured development build.</Text><Link href="/demo">নমুনা · Try the demo</Link></View>;
 return <Suspense fallback={<Text>Loading secure sign-in…</Text>}><Enabled/></Suspense>;
}
