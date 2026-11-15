'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { isRole } from '@/navigation.ts';
import { AppShell } from '@/components/app-shell.tsx';
import { WebFeatureRegistry } from '@/features/registry.tsx';

export default function RoleWorkspacePage({
  params,
}: {
  params: Promise<{ role: string; slug?: string[] }>;
}) {
  const resolved = use(params);
  const router = useRouter();
  const { ready, state, user, run } = useWebApp();

  const validRole = isRole(resolved.role) ? resolved.role : null;
  const screen = resolved.slug?.[0] ?? 'home';
  const id = resolved.slug?.[1];

  useEffect(() => {
    if (!ready) return;
    if (!validRole) {
      router.replace('/login');
      return;
    }
    // Synchronize active user role if navigating directly to a role URL
    if (!user || user.role !== validRole) {
      const targetAccount = DEMO_ACCOUNTS.find((a) => a.role === validRole);
      if (targetAccount) {
        void run({ type: 'auth.switch', userId: targetAccount.id });
      }
    }
  }, [ready, validRole, user, run, router]);

  if (!ready || !validRole) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] text-[#1F2937]">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white px-6 py-4 text-sm font-semibold text-[#0F602D]">
          পালিতো ওয়ার্কবেঞ্চ প্রস্তুত হচ্ছে · Preparing Workspace...
        </div>
      </div>
    );
  }

  return (
    <AppShell role={validRole} activeScreen={screen} activeId={id}>
      <WebFeatureRegistry
        key={`${validRole}:${user?.id ?? 'anon'}:${state.settings.scenario}:${screen}:${id ?? ''}`}
        role={validRole}
        screen={screen}
        id={id}
      />
    </AppShell>
  );
}
