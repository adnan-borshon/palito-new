import type { Role } from '@palito/shared';
import { EmptyState, Screen } from '@/components/ui';
import { roleNames } from '@/navigation';
import { useDemo } from '@/providers/demo';
import type { FeatureProps } from './types';

/** Role modules replace this explicit in-progress fallback as they are integrated. */
export function FeatureScreen({ role, screen, id }: FeatureProps & { role: Role }) {
  const { t, locale } = useDemo();
  return <Screen title={roleNames[role][locale]} back={Boolean(id)} testID={`${role}-${screen}`}>
    <EmptyState title={t('এই পর্দার কাজ চলছে', 'This screen is being implemented')} description={t('মোবাইল পর্যালোচনার আগে এই কাজ শেষ ও পরীক্ষা করা হবে।', 'This workflow will be completed and tested before mobile review.')} />
  </Screen>;
}
