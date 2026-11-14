'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebApp } from '@/providers/web-provider.tsx';
import { webHref } from '@/navigation.ts';

export default function HomePage() {
  const router = useRouter();
  const { ready, role } = useWebApp();

  useEffect(() => {
    if (!ready) return;
    if (role) {
      router.replace(webHref(role, 'home'));
    } else {
      router.replace('/login');
    }
  }, [ready, role, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] text-[#1F2937]">
      <div className="rounded-[16px] border border-[#E2E8F0] bg-white px-6 py-4 text-sm font-semibold text-[#0F602D]">
        পালিতো লোড হচ্ছে · Loading Palito Workspace...
      </div>
    </div>
  );
}
