import Link from 'next/link';
import { LoginView } from '@/features/auth.tsx';

export default function LoginPage() {
  return <><div className="p-3 text-center"><Link href="/identity">যাচাইকৃত ফোনে সাইন ইন · Verified phone sign-in</Link><p className="text-sm">Demo workspace below</p></div><LoginView /></>;
}
