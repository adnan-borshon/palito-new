'use client';
import {useRef,useState} from 'react';
import {signInWithPhoneNumber,PhoneAuthProvider,RecaptchaVerifier,updatePhoneNumber,signOut,type ConfirmationResult} from 'firebase/auth';
import {firebaseAuth,api,csrf} from '@/lib/firebase';
export default function AccountSecurity(){
 const [oldPhone,setOld]=useState('');const [phone,setPhone]=useState('');const [code,setCode]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const oldChallenge=useRef<ConfirmationResult|null>(null);const newChallenge=useRef('');const captcha=useRef<RecaptchaVerifier|null>(null);
 function verifier(){captcha.current?.clear();return captcha.current=new RecaptchaVerifier(firebaseAuth(),'account-recaptcha',{size:'normal'});}
 async function act(work:()=>Promise<void>){setBusy(true);setMessage('');try{await work();}catch{setMessage('Action failed. Sign in again with the account owning this session. Staff must use password and MFA.');}finally{setBusy(false);}}
 async function post(path:string,body:unknown){return api(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':await csrf()},body:JSON.stringify(body)});}
 return <main className="max-w-lg mx-auto p-8 space-y-5"><h1>Account security</h1><p>Reauthenticate with your existing number before changing it. Staff use the staff MFA sign-in page for sensitive actions.</p>
 <label>Existing phone<input type="tel" value={oldPhone} onChange={e=>setOld(e.target.value)}/></label><div id="account-recaptcha"/>
 <button disabled={busy} onClick={()=>void act(async()=>{oldChallenge.current=await signInWithPhoneNumber(firebaseAuth(),oldPhone,verifier());setMessage('Verification SMS requested.');})}>Verify existing phone (consent to SMS)</button>
 <label>SMS code<input inputMode="numeric" value={code} maxLength={6} onChange={e=>setCode(e.target.value)}/></label>
 <button disabled={busy} onClick={()=>void act(async()=>{if(!oldChallenge.current)throw new Error('No challenge');await oldChallenge.current.confirm(code);setCode('');setMessage('Existing identity verified.');})}>Confirm existing identity</button>
 <label>New phone<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
 <button disabled={busy} onClick={()=>void act(async()=>{if(!/^\+8801[3-9]\d{8}$/.test(phone))throw new Error('Invalid phone');newChallenge.current=await new PhoneAuthProvider(firebaseAuth()).verifyPhoneNumber(phone,verifier());setMessage('Enter the new phone SMS code.');})}>Verify new phone (consent to SMS)</button>
 <button disabled={busy} onClick={()=>void act(async()=>{const auth=firebaseAuth();try{if(!auth.currentUser)throw new Error('Sign in');await updatePhoneNumber(auth.currentUser,PhoneAuthProvider.credential(newChallenge.current,code));await post('/me/verified-contact',{idToken:await auth.currentUser.getIdToken(true)});setCode('');setPhone('');setMessage('Contact updated. Sign in again.');}finally{await signOut(auth);}})}>Confirm phone change and revoke sessions</button>
 <button disabled={busy} onClick={()=>void act(async()=>{const auth=firebaseAuth();try{if(!auth.currentUser)throw new Error('Sign in');await post('/sessions/revoke-all',{idToken:await auth.currentUser.getIdToken(true)});setMessage('All sessions revoked. Sign in again.');}finally{await signOut(auth);}})}>Sign out all devices</button>
 <button disabled={busy} onClick={()=>void act(async()=>{await post('/me/recovery-requests',{kind:'PHONE_CHANGE'});setMessage('Support review requested. No identity has been changed.');})}>Request assisted phone recovery</button><p role="status">{busy?'Please wait…':message}</p></main>;
}
