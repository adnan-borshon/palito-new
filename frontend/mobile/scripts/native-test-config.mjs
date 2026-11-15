// Generate synthetic client configuration for native compilation only. No real
// Firebase project, usable API key, signing identity, SMS or deployment is created.
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
if(process.env.CI!=='true')throw new Error('Synthetic native build configuration is CI-only');
const directory=await mkdtemp(join(tmpdir(),'palito-native-test-'));
const android=join(directory,'google-services.json');const ios=join(directory,'GoogleService-Info.plist');
await writeFile(android,JSON.stringify({project_info:{project_number:'123456789000',project_id:'demo-palito-native-test',storage_bucket:'demo-palito-native-test.appspot.com'},client:[{client_info:{mobilesdk_app_id:'1:123456789000:android:0000000000000000',android_client_info:{package_name:'dev.palito.identitytest'}},oauth_client:[],api_key:[{current_key:'synthetic-native-compile-only-not-a-key'}],services:{appinvite_service:{other_platform_oauth_client:[]}}}],configuration_version:'1'}));
await writeFile(ios,'<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>PROJECT_ID</key><string>demo-palito-native-test</string><key>BUNDLE_ID</key><string>dev.palito.identitytest</string></dict></plist>');
const config={EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED:'true',EXPO_PUBLIC_PALITO_API_ORIGIN:'https://api.example.test',PALITO_ANDROID_PACKAGE:'dev.palito.identitytest',PALITO_IOS_BUNDLE:'dev.palito.identitytest',GOOGLE_SERVICES_JSON:android,GOOGLE_SERVICES_PLIST:ios};
if(!process.env.GITHUB_ENV)throw new Error('Runner environment file required');
await writeFile(process.env.GITHUB_ENV,Object.entries(config).map(([k,v])=>`${k}=${v}\n`).join(''),{flag:'a'});
