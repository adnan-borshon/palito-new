import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, Button } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, reload, multiFactor, getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, signOut, getAuth, type MultiFactorResolver } from '@react-native-firebase/auth';
async function api(path:string,init:RequestInit={}) {
 const origin=process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;
 if(!origin || !origin.startsWith('https://') || new URL(origin).origin!==origin) throw new Error('Configure HTTPS API');
 const user=getAuth().currentUser;
 const response=await fetch(`${origin}/api/v1${path}`,{...init,headers:{...init.headers,...(user?{Authorization:`Bearer ${await user.getIdToken(true)}`}:{})}});
 if(!response.ok)throw new Error('Request failed');return response.json();
}
export default function StaffScreen(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [phone,setPhone]=useState(''); const [code,setCode]=useState('');
  const [name,setName]=useState('');const [invite,setInvite]=useState('');const [registration,setRegistration]=useState('');
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const resolver=useRef<MultiFactorResolver|null>(null);const verification=useRef('');
  async function act(work:()=>Promise<void>){setBusy(true);setMessage('');try{await work();}catch{setMessage('Request could not be completed. Check your details and sign in again if needed.');}finally{setBusy(false);setPassword('');}}

  async function login(){
    const auth=getAuth();resolver.current=null;
    try{await signInWithEmailAndPassword(auth,email,password);setMessage('Verify your email and enroll SMS MFA before accepting an invitation.');}
    catch(error){if((error as {code?:string}).code!=='auth/multi-factor-auth-required')throw error;resolver.current=getMultiFactorResolver(auth,error as Parameters<typeof getMultiFactorResolver>[1]);
      const hint=resolver.current.hints.find(h=>h.factorId==='phone');if(!hint)throw new Error('Unsupported factor');
      verification.current=await new PhoneAuthProvider(auth).verifyPhoneNumber({multiFactorHint:hint,session:resolver.current.session});setMessage('Enter your MFA SMS code.');}
    setPassword('');
  }
  async function enroll(){const auth=getAuth();const user=auth.currentUser;if(!user)throw new Error('Sign in');await reload(user);if(!user.emailVerified)throw new Error('Verify email');verification.current=await new PhoneAuthProvider(auth).verifyPhoneNumber({phoneNumber:phone,session:await multiFactor(user).getSession()});setMessage('Enter enrollment SMS code.');}
  async function confirm(){const auth=getAuth();const assertion=PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(verification.current,code));
    if(resolver.current){await resolver.current.resolveSignIn(assertion);resolver.current=null;setMessage('MFA verified. Accept your invitation or open your staff session.');}
    else{if(!auth.currentUser)throw new Error('Sign in');await multiFactor(auth.currentUser).enroll(assertion,'Palito staff');await signOut(auth);setMessage('MFA enrolled. Sign in again with password and SMS.');}
    setCode('');verification.current='';}
  async function accept(){const user=getAuth().currentUser;if(!user)throw new Error('Sign in');await api('/staff/invitations/accept',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:await user.getIdToken(true),invitationToken:invite,displayName:name,...(registration?{registrationNumber:registration}:{})})});setInvite('');setMessage('Invitation accepted. Open your staff session.');}
  async function session(){const value=await api('/me');setMessage(`Signed in: ${value.displayName}. Active staff contexts: ${value.memberships.length}`);}
  const input=(label:string,value:string,set:(value:string)=>void,secret=false)=><TextInput accessibilityLabel={label} placeholder={label} value={value} onChangeText={set} secureTextEntry={secret} autoCapitalize="none" />;
  if(process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED!=='true')return <Text>Native Firebase is not configured.</Text>;
  return <ScrollView contentContainerStyle={{padding:24,gap:16}} keyboardShouldPersistTaps="handled"><Text accessibilityRole="header">Staff sign-in / MFA</Text>
   {input('Email',email,setEmail)}{input('Password',password,setPassword,true)}<Button title="Sign in" disabled={busy} onPress={()=>void act(login)} />
   <Button title="Create invited identity" disabled={busy} onPress={()=>void act(async()=>{const user=await createUserWithEmailAndPassword(getAuth(),email,password);await sendEmailVerification(user.user);setPassword('');setMessage('Verify your email, then enroll MFA.');})}/>
   <Button title="Reset password" disabled={busy} onPress={()=>void act(async()=>{await sendPasswordResetEmail(getAuth(),email);setMessage('If eligible, a reset email will arrive.');})}/>
   <Button title="Lost factor: request review" disabled={busy} onPress={()=>void act(async()=>{await api('/recovery-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});setMessage('Request received for administrator identity verification.');})}/>
   {input('MFA phone (+880)',phone,setPhone)}<Button title="Enroll SMS MFA (consent to SMS)" disabled={busy} onPress={()=>void act(enroll)} />
   {input('SMS code',code,setCode)}<Button title="Verify MFA code" disabled={busy} onPress={()=>void act(confirm)} />
   {input('Name',name,setName)}{input('Invitation token',invite,setInvite,true)}{input('Vet registration',registration,setRegistration)}
   <Button title="Accept invitation" disabled={busy} onPress={()=>void act(accept)}/><Button title="Open staff profile" disabled={busy} onPress={()=>void act(session)}/>
   <Button title="Sign out" disabled={busy} onPress={()=>void act(async()=>{await signOut(getAuth());setPassword('');setCode('');setInvite('');resolver.current=null;verification.current='';setMessage('Signed out.');})}/>
   <Text accessibilityRole="alert">{busy?'Please wait…':message}</Text>
  </ScrollView>;
}
