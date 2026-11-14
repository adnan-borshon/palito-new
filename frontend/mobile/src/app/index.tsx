import { Redirect } from 'expo-router';
import { LoadingState } from '@/components/ui';
import { routeFor } from '@/navigation';
import { useDemo } from '@/providers/demo';

export default function EntryRoute() {
  const { ready, state, user } = useDemo();
  if (!ready) return <LoadingState />;
  if (user) return <Redirect href={routeFor(user.role)} />;
  return <Redirect href={state.session.onboarded ? '/login' : '/welcome'} />;
}
