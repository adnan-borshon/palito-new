import { useLocalSearchParams } from 'expo-router';
import { FeatureScreen } from '@/features/registry';
import { isRole } from '@/navigation';
export default function DetailRoute() {
  const { role, screen, id } = useLocalSearchParams<{ role: string; screen: string; id: string }>();
  return isRole(role) ? <FeatureScreen role={role} screen={screen} id={id} /> : null;
}
