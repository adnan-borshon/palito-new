import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const configure=createRequire(import.meta.url)('../../../frontend/mobile/app.config.js') as (input:{config:Record<string,unknown>})=>Record<string,unknown>;
test('native auth defaults off; missing provider files and identifiers cannot produce an enabled build',()=>{
 const previous=process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED;
 try{
  delete process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED;
  const base={name:'Palito',plugins:['expo-router']};assert.equal(configure({config:base}),base);
  process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED='true';assert.throws(()=>configure({config:base}),/requires app identifiers/);
 }finally{if(previous===undefined)delete process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED;else process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED=previous;}
});
