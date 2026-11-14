'use client';

import type { Role } from '@palito/shared';
import { isCommonWebScreen } from '@/navigation.ts';
import { CommonWebFeature } from './common.tsx';
import { BankWebFeature } from './bank.tsx';
import { VetWebFeature } from './vet.tsx';
import { AdminWebFeature } from './admin.tsx';
import { InsurerWebFeature } from './insurer.tsx';
import { FarmerWebFeature } from './farmer.tsx';

export function WebFeatureRegistry({
  role,
  screen,
  id,
}: {
  role: Role;
  screen: string;
  id?: string;
}) {
  if (isCommonWebScreen(screen)) {
    return <CommonWebFeature screen={screen} id={id} />;
  }

  switch (role) {
    case 'bank':
      return <BankWebFeature screen={screen} id={id} />;
    case 'vet':
      return <VetWebFeature screen={screen} id={id} />;
    case 'admin':
      return <AdminWebFeature screen={screen} id={id} />;
    case 'insurer':
      return <InsurerWebFeature screen={screen} id={id} />;
    case 'farmer':
      return <FarmerWebFeature screen={screen} id={id} />;
  }
}
