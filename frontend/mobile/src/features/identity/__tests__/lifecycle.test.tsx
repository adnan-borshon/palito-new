import {beforeEach,afterEach,test,expect,jest} from '@jest/globals';
import {render,screen,waitFor,fireEvent} from '@testing-library/react-native';
import Identity from '../screen-enabled.native';
import DisabledIdentity from '../screen.native';
const mockAuth:{currentUser:{uid:string;getIdToken:()=>Promise<string>}|null}={currentUser:null};
let mockListener:(()=>void)|undefined;
jest.mock('@react-native-firebase/auth',()=>({
 getAuth:()=>mockAuth,
 onAuthStateChanged:(_auth:unknown,callback:()=>void)=>{mockListener=callback;callback();return ()=>{mockListener=undefined;};},
 signOut:async()=>{mockAuth.currentUser=null;mockListener?.();},
 signInWithPhoneNumber:jest.fn(),
}));
jest.mock('expo-router',()=>({Link:'Text'}));
const originalFetch=globalThis.fetch;
beforeEach(()=>{process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED='true';process.env.EXPO_PUBLIC_PALITO_API_ORIGIN='https://api.palito.test';mockAuth.currentUser={uid:'alice',getIdToken:async()=>'synthetic-token'};Object.defineProperty(globalThis,'fetch',{configurable:true,writable:true,value:jest.fn(async()=>({ok:true,json:async()=>({displayName:'Alice'})}))});});
afterEach(()=>{Object.defineProperty(globalThis,'fetch',{configurable:true,writable:true,value:originalFetch});delete process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED;delete process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;});
test('SDK session restores profile after component remount and SDK sign-out clears it',async()=>{
 const view=await render(<Identity/>);await waitFor(()=>expect(screen.getByText('স্বাগতম · Alice')).toBeTruthy());
 await view.unmount();await render(<Identity/>);await waitFor(()=>expect(screen.getByText('স্বাগতম · Alice')).toBeTruthy());
 await fireEvent.press(screen.getByText('সাইন আউট · Sign out'));await waitFor(()=>expect(screen.queryByText('স্বাগতম · Alice')).toBeNull());expect(mockAuth.currentUser).toBeNull();
});
test('disabled native route does not initialize Firebase or expose cached profile',async()=>{
 process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED='false';await render(<DisabledIdentity/>);expect(screen.getByText('Native sign-in is not configured for this build.')).toBeTruthy();expect(globalThis.fetch).not.toHaveBeenCalled();
});
