import {lazy,Suspense} from 'react';
import {Text} from 'react-native';
const Enabled=lazy(()=>import('./staff-enabled.native'));
export default function ConfiguredIdentity(){
 if(process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED!=='true')return <Text>Native sign-in is not configured for this build.</Text>;
 return <Suspense fallback={<Text>Loading secure sign-in…</Text>}><Enabled/></Suspense>;
}
