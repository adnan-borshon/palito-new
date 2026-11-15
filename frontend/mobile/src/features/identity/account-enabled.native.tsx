import {useState,useRef} from 'react';
import {Button,Text,TextInput,ScrollView} from 'react-native';
import {getAuth,verifyPhoneNumber,PhoneAuthProvider,updatePhoneNumber,signOut} from '@react-native-firebase/auth';
export default function AccountSecurity(){
 const [phone,setPhone]=useState('');const [code,setCode]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const verification=useRef('');
 async function post(path:string,body:unknown){const origin=process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;const user=getAuth().currentUser;if(!origin||!origin.startsWith('https://')||new URL(origin).origin!==origin||!user)throw new Error('Sign in');const response=await fetch(`${origin}/api/v1${path}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken(true)}`},body:JSON.stringify(body)});if(!response.ok)throw new Error('Request failed');return response.json();}
 async function act(work:()=>Promise<void>){setBusy(true);setMessage('');try{await work();}catch{setMessage('Action failed. Sign in again recently. Staff must use password and MFA.');}finally{setBusy(false);}}
 if(process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED!=='true')return <Text>Native Firebase is not configured.</Text>;
 return <ScrollView contentContainerStyle={{padding:24,gap:16}}><Text accessibilityRole="header">Account security</Text><Text>Sign in recently before changing your verified phone. A different Firebase UID cannot take over this account.</Text>
 <TextInput accessibilityLabel="New phone" placeholder="+880" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
 <Button title="Verify new phone (consent to SMS)" disabled={busy} onPress={()=>void act(async()=>{if(!/^\+8801[3-9]\d{8}$/.test(phone))throw new Error('Invalid phone');const snapshot=await verifyPhoneNumber(getAuth(),phone);verification.current=snapshot.verificationId;setMessage('Enter the SMS code.');})}/>
 <TextInput accessibilityLabel="SMS code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6}/>
 <Button title="Confirm phone change" disabled={busy} onPress={()=>void act(async()=>{const auth=getAuth();try{if(!auth.currentUser)throw new Error('Sign in');await updatePhoneNumber(auth.currentUser,PhoneAuthProvider.credential(verification.current,code));await post('/me/verified-contact',{idToken:await auth.currentUser.getIdToken(true)});setCode('');setPhone('');setMessage('Contact updated. Sign in again.');}finally{await signOut(auth);}})}/>
 <Button title="Sign out all devices" disabled={busy} onPress={()=>void act(async()=>{const auth=getAuth();try{if(!auth.currentUser)throw new Error('Sign in');await post('/sessions/revoke-all',{idToken:await auth.currentUser.getIdToken(true)});setMessage('All sessions revoked.');}finally{await signOut(auth);}})}/>
 <Button title="Request assisted recovery" disabled={busy} onPress={()=>void act(async()=>{await post('/me/recovery-requests',{kind:'PHONE_CHANGE'});setMessage('Request queued for administrator identity verification.');})}/><Text accessibilityRole="alert">{busy?'Please wait…':message}</Text></ScrollView>;
}
