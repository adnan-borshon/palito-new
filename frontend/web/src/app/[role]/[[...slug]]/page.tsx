'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebApp } from '@/providers/web-provider.tsx';
import { isRole, webHref } from '@/navigation.ts';
import { AppShell } from '@/components/app-shell.tsx';
import { WebFeatureRegistry } from '@/features/registry.tsx';

export default function RoleWorkspacePage({
  params,
}: {
  params: Promise<{ role: string; slug?: string[] }>;
}) {
  const resolved = use(params);
  const router = useRouter();
  const { ready, state, user } = useWebApp();

  const validRole = isRole(resolved.role) ? resolved.role : null;
  const screen = resolved.slug?.[0] ?? 'home';
  const id = resolved.slug?.[1];

  useEffect(() => {
    if (!ready) return;
    if (!user || !validRole) router.replace('/demo');
    else if (validRole !== user.role) router.replace(webHref(user.role, 'home'));
  }, [ready, validRole, user, router]);

  if (!ready || !validRole || user?.role !== validRole) {
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
