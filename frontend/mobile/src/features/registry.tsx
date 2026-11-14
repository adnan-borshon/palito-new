import type { Role } from '@palito/shared';
import type { FeatureProps } from './types';
import CommonFeature, { COMMON_SCREENS } from './common';
import FarmerFeature from './farmer';
import VetFeature from './vet';
import { BankFeature, InsurerFeature } from './finance';
import AdminFeature from './admin';

export function FeatureScreen({ role, screen, id }: FeatureProps & { role: Role }) {
  if ((COMMON_SCREENS as readonly string[]).includes(screen)) {
    return <CommonFeature screen={screen} id={id} />;
  }
  switch (role) {
    case 'farmer':
      return <FarmerFeature screen={screen} id={id} />;
    case 'vet':
      return <VetFeature screen={screen} id={id} />;
    case 'bank':
      return <BankFeature screen={screen} id={id} />;
    case 'insurer':
      return <InsurerFeature screen={screen} id={id} />;
    case 'admin':
      return <AdminFeature screen={screen} id={id} />;
  }
}
