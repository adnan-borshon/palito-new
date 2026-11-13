import { useLocalSearchParams } from 'expo-router';
import { FeatureScreen } from '@/features/registry';
import { isRole } from '@/navigation';
export default function FeatureRoute() {
  const { role, screen } = useLocalSearchParams<{ role: string; screen: string }>();
  return isRole(role) ? <FeatureScreen role={role} screen={screen} /> : null;
}
