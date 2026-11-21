import Link from 'next/link';
import { LoginView } from '@/features/auth.tsx';

export default function DemoPage() {
  return <><div className="p-3 text-center"><Link href="/identity">যাচাইকৃত ফোনে সাইন ইন · Verified phone sign-in</Link><h1 className="text-lg font-semibold">নমুনা কর্মক্ষেত্র · Demo workspace</h1><p className="text-sm">Demo changes are saved in this browser.</p></div><LoginView /></>;
}
