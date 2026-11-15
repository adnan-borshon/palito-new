import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
export async function browserJourney(vet?:import('./care-browser.scenario.js').BrowserVet){
 const root=fileURLToPath(new URL('../../../../',import.meta.url));
 const child=spawn(process.execPath,[`${root}node_modules/next/dist/bin/next`,'dev','--hostname','127.0.0.1','--port','3000'],{cwd:`${root}frontend/web`,env:{...process.env,NODE_ENV:'development',NEXT_TELEMETRY_DISABLED:'1',PALITO_API_ORIGIN:'http://127.0.0.1:4000',NEXT_PUBLIC_FIREBASE_PROJECT_ID:'demo-palito',NEXT_PUBLIC_FIREBASE_API_KEY:'synthetic-emulator-key',NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:'demo-palito.firebaseapp.com',NEXT_PUBLIC_AUTH_EMULATOR:'true'},stdio:'ignore'});
 let browser;
 try{
  const deadline=Date.now()+60000;
  while(true){try{if((await fetch('http://localhost:3000/identity')).ok)break;}catch{/* wait for actual server */}if(Date.now()>deadline)throw new Error('Browser test web server unavailable');await new Promise(r=>setTimeout(r,250));}
  browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL||undefined,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
  const context=await browser.newContext();const page=await context.newPage();
  await page.goto('http://localhost:3000/identity');
  await page.getByLabel('নাম · Name',{exact:true}).fill('Browser farmer');
  await page.getByLabel('ফোন · Phone (+880)',{exact:true}).fill('+8801700000021');
  await page.getByRole('checkbox').check();
  const sent=page.waitForResponse(r=>r.url().includes('accounts:sendVerificationCode')&&r.status()===200);
  await page.getByRole('button',{name:'কোড পাঠান · Send code',exact:true}).click();await sent;
  const codes=await (await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-palito/verificationCodes`)).json();
  const code=codes.verificationCodes.find((v:{phoneNumber:string})=>v.phoneNumber==='+8801700000021').code;
  await page.getByLabel('কোড · Code',{exact:true}).fill(code);
  await page.getByRole('button',{name:'যাচাই করুন · Verify',exact:true}).click();
  await page.getByText('স্বাগতম · Welcome, Browser farmer',{exact:true}).waitFor();
  const cookie=(await context.cookies()).find(c=>c.name==='__Host-palito-session');assert.ok(cookie?.httpOnly&&cookie.secure&&cookie.sameSite==='Strict');
  assert.ok(!(await page.evaluate(()=>document.cookie)).includes('__Host-palito-session'));
  const stored=await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}));assert.ok(![...stored.local,...stored.session].some(k=>k.includes('firebase:authUser')));
  await page.reload();await page.getByText('স্বাগতম · Welcome, Browser farmer',{exact:true}).waitFor();
  const denied=await page.evaluate(async()=>{const response=await fetch('/api/v1/sessions/current',{method:'DELETE'});return response.status;});assert.equal(denied,403);
  // A separate browser identity cannot inherit another browser's cookies or profile.
  const isolated=await browser.newContext();const other=await isolated.newPage();await other.goto('http://localhost:3000/identity');assert.equal(await other.getByText('স্বাগতম · Welcome, Browser farmer',{exact:true}).count(),0);await isolated.close();
  if(vet){const {careBrowserJourney}=await import('./care-browser.scenario.js');await careBrowserJourney(page,browser,vet);await page.goto('http://localhost:3000/identity');await page.getByText('স্বাগতম · Welcome, Browser farmer',{exact:true}).waitFor();}
  await page.getByRole('button',{name:'সাইন আউট · Sign out',exact:true}).click();await page.getByLabel('নাম · Name',{exact:true}).waitFor();
  await page.reload();await page.getByLabel('নাম · Name',{exact:true}).waitFor();
  assert.ok(!(await context.cookies()).some(c=>c.name==='__Host-palito-session'));
  await page.goto('http://localhost:3000/identity/staff');
  await page.getByLabel('Email',{exact:true}).fill('synthetic-admin@example.test');
  await page.getByLabel('Password',{exact:true}).fill('Synthetic-emulator-password-only-123!');
  const challenge=page.waitForResponse(r=>r.url().includes('mfaSignIn:start')&&r.status()===200);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const info=await (await challenge).json();
  const mfaCodes=await (await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-palito/verificationCodes`)).json();
  const mfaCode=mfaCodes.verificationCodes.find((v:{sessionInfo:string})=>v.sessionInfo===info.phoneResponseInfo.sessionInfo).code;
  await page.getByLabel('SMS code',{exact:true}).fill(mfaCode);
  await page.getByRole('button',{name:'Verify MFA code',exact:true}).click();
  await page.getByText('MFA verified. Accept your invitation or open your staff session.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Open staff session',exact:true}).click();
  await page.getByText('স্বাগতম · Welcome, Platform administrator',{exact:true}).waitFor();
  await page.getByRole('link',{name:'Identity administration',exact:true}).click();
  await page.getByRole('button',{name:'Load organizations and review queue',exact:true}).click();
  await page.getByRole('option',{name:'Palito administration',exact:true}).waitFor({state:'attached'});
  await page.getByLabel('Organization name',{exact:true}).fill('Browser clinic');
  await page.getByRole('button',{name:'Approve organization',exact:true}).click();
  await page.getByRole('option',{name:'Browser clinic',exact:true}).waitFor({state:'attached'});
  // Reauthenticate through the actual staff UI, then exercise cookie + fresh-proof logout-all.
  await page.goto('http://localhost:3000/identity/staff');
  await page.getByLabel('Email',{exact:true}).fill('synthetic-admin@example.test');
  await page.getByLabel('Password',{exact:true}).fill('Synthetic-emulator-password-only-123!');
  const secondChallenge=page.waitForResponse(r=>r.url().includes('mfaSignIn:start')&&r.status()===200);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const secondInfo=await (await secondChallenge).json();
  const secondCodes=await (await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-palito/verificationCodes`)).json();
  const secondCode=secondCodes.verificationCodes.find((v:{sessionInfo:string})=>v.sessionInfo===secondInfo.phoneResponseInfo.sessionInfo).code;
  await page.getByLabel('SMS code',{exact:true}).fill(secondCode);
  await page.getByRole('button',{name:'Verify MFA code',exact:true}).click();
  await page.getByText('MFA verified. Accept your invitation or open your staff session.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Sign out all devices after MFA',exact:true}).click();
  await page.getByText('All sessions revoked.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(async()=>{const response=await fetch('/api/v1/me');return response.status;}),401);
  await context.close();
 }finally{
  await browser?.close();
  if(child.exitCode===null){const stopped=once(child,'exit');child.kill('SIGTERM');await Promise.race([stopped,new Promise(r=>setTimeout(r,5000))]);if(child.exitCode===null)child.kill('SIGKILL');}
 }
}
