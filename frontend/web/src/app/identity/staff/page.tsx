'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, reload, multiFactor, getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, signOut, type MultiFactorResolver } from 'firebase/auth';
import { firebaseAuth, api, csrf } from '@/lib/firebase';
export default function StaffIdentity() {
  const router=useRouter();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [phone,setPhone]=useState(''); const [code,setCode]=useState('');
  const [name,setName]=useState('');const [invite,setInvite]=useState('');const [registration,setRegistration]=useState('');
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const resolver=useRef<MultiFactorResolver|null>(null);const verification=useRef('');const captcha=useRef<RecaptchaVerifier|null>(null);
  async function act(work:()=>Promise<void>){setBusy(true);setMessage('');try{await work();}catch{setMessage('Request could not be completed. Check your details and sign in again if needed.');}finally{setBusy(false);setPassword('');}}
  function verifier(){captcha.current?.clear();return captcha.current=new RecaptchaVerifier(firebaseAuth(),'staff-recaptcha',{size:'normal'});}
  async function login(){
    const auth=firebaseAuth();resolver.current=null;
    try{await signInWithEmailAndPassword(auth,email,password);setMessage('Verify your email and enroll SMS MFA before accepting an invitation.');}
    catch(error){if((error as {code?:string}).code!=='auth/multi-factor-auth-required')throw error;resolver.current=getMultiFactorResolver(auth,error as Parameters<typeof getMultiFactorResolver>[1]);
      const hint=resolver.current.hints.find(h=>h.factorId==='phone');if(!hint)throw new Error('Unsupported factor');
      verification.current=await new PhoneAuthProvider(auth).verifyPhoneNumber({multiFactorHint:hint,session:resolver.current.session},verifier());setMessage('Enter your MFA SMS code.');}
    setPassword('');
  }
  async function enroll(){const auth=firebaseAuth();const user=auth.currentUser;if(!user)throw new Error('Sign in');await reload(user);if(!user.emailVerified)throw new Error('Verify email');verification.current=await new PhoneAuthProvider(auth).verifyPhoneNumber({phoneNumber:phone,session:await multiFactor(user).getSession()},verifier());setMessage('Enter enrollment SMS code.');}
  async function confirm(){const auth=firebaseAuth();const assertion=PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(verification.current,code));
    if(resolver.current){await resolver.current.resolveSignIn(assertion);resolver.current=null;setMessage('MFA verified. Accept your invitation or open your staff session.');}
    else{if(!auth.currentUser)throw new Error('Sign in');await multiFactor(auth.currentUser).enroll(assertion,'Palito staff');await signOut(auth);setMessage('MFA enrolled. Sign in again with password and SMS.');}
    setCode('');verification.current='';}
  async function accept(){const user=firebaseAuth().currentUser;if(!user)throw new Error('Sign in');await api('/staff/invitations/accept',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:await user.getIdToken(true),invitationToken:invite,displayName:name,...(registration?{registrationNumber:registration}:{})})});setInvite('');setMessage('Invitation accepted. Open your staff session.');}
  async function session(){const auth=firebaseAuth();try{if(!auth.currentUser)throw new Error('Sign in');await api('/sessions',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':await csrf()},body:JSON.stringify({idToken:await auth.currentUser.getIdToken(true)})});router.push('/identity');}finally{await signOut(auth);}}
  const input=(label:string,value:string,set:(v:string)=>void,type='text')=><label className="block">{label}<input className="block w-full border p-2" type={type} value={value} onChange={e=>set(e.target.value)} autoComplete={type==='password'?'current-password':'off'} /></label>;
  return <main className="mx-auto max-w-lg p-8 space-y-4"><h1 className="text-2xl">Staff sign-in · কর্মীদের সাইন ইন</h1>
    {input('Email',email,setEmail,'email')}{input('Password',password,setPassword,'password')}
    <button disabled={busy} onClick={()=>void act(login)}>Sign in</button>{' '}
    <button disabled={busy} onClick={()=>void act(async()=>{const result=await createUserWithEmailAndPassword(firebaseAuth(),email,password);await sendEmailVerification(result.user);setPassword('');setMessage('Check your email to verify your account, then enroll MFA.');})}>Create invited staff identity</button>
    <button disabled={busy} onClick={()=>void act(async()=>{await sendPasswordResetEmail(firebaseAuth(),email);setMessage('If eligible, a password reset email will arrive.');})}>Reset password</button>
    <button disabled={busy} onClick={()=>void act(async()=>{await api('/recovery-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});setMessage('Recovery request received. An administrator must verify your identity; MFA is not removed automatically.');})}>Lost MFA factor</button>
    {input('MFA phone (+880)',phone,setPhone,'tel')}<div id="staff-recaptcha" />
    <button disabled={busy} onClick={()=>void act(enroll)}>Enroll SMS MFA (consent to verification SMS)</button>
    {input('SMS code',code,setCode)}<button disabled={busy} onClick={()=>void act(confirm)}>Verify MFA code</button>
    {input('Name',name,setName)}{input('Invitation token',invite,setInvite)}{input('Vet registration (vets only)',registration,setRegistration)}
    <button disabled={busy} onClick={()=>void act(accept)}>Accept invitation</button>{' '}<button disabled={busy} onClick={()=>void act(session)}>Open staff session</button>
    <button disabled={busy} onClick={()=>void act(async()=>{const auth=firebaseAuth();try{if(!auth.currentUser)throw new Error('Sign in');await api('/sessions/revoke-all',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':await csrf()},body:JSON.stringify({idToken:await auth.currentUser.getIdToken(true)})});setMessage('All sessions revoked.');}finally{await signOut(auth);}})}>Sign out all devices after MFA</button>
    <button disabled={busy} onClick={()=>void act(async()=>{await signOut(firebaseAuth());resolver.current=null;verification.current='';setPassword('');setCode('');setInvite('');setMessage('Transient credentials cleared.');})}>Clear sign-in</button>
    <p role="status">{busy?'Please wait…':message}</p></main>;
}
