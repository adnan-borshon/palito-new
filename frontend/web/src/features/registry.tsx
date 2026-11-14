'use client';

import type { Role } from '@palito/shared';
import { COMMON_WEB_SCREENS, CommonWebFeature } from './common.tsx';
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
  if ((COMMON_WEB_SCREENS as readonly string[]).includes(screen)) {
    return <CommonWebFeature screen={screen} />;
  }

  switch (role) {
    case 'bank':
      return <BankWebFeature screen={screen} id={id} />;
    case 'vet':
      return <VetWebFeature screen={screen} id={id} />;
    case 'admin':
      return <AdminWebFeature screen={screen} />;
    case 'insurer':
      return <InsurerWebFeature screen={screen} id={id} />;
    case 'farmer':
      return <FarmerWebFeature screen={screen} id={id} />;
  }
}
