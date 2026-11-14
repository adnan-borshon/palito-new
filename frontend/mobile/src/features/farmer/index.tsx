import type { FeatureProps } from '../types';
import { AppText, Button, Screen } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { FarmerFinanceFeature, FARMER_FINANCE_SCREENS } from '../finance';
import { go } from './components';
import { FarmerHome, EducationScreen } from './home';
import { AnimalsScreen, AnimalDetail, AnimalEditor, FarmScreen, RecordEditor } from './animals';
import { AlertsScreen, DevicesScreen, EmergencyScreen } from './monitoring';
import { AppointmentsScreen, PrescriptionsScreen, RemindersScreen, VetProfileScreen, VetsScreen } from './care';
import { AICompanionScreen, OrdersScreen, ShopScreen } from './companion';

export const farmerCoreScreens = [
  'home', 'animals', 'animal', 'animal-add', 'animal-edit', 'farm', 'record-add',
  'devices', 'device', 'alerts', 'alert', 'emergency', 'education', 'article',
  'vets', 'vet', 'book', 'appointments', 'appointment', 'prescriptions', 'prescription',
  'reminders', 'ai', 'shop', 'orders', 'order',
  ...FARMER_FINANCE_SCREENS,
] as const;

export default function FarmerFeature({ screen, id }: FeatureProps) {
  const { t } = useDemo();
  if ((FARMER_FINANCE_SCREENS as readonly string[]).includes(screen)) {
    return <FarmerFinanceFeature screen={screen} id={id} />;
  }
  switch (screen) {
    case 'home': return <FarmerHome />;
    case 'animals': return id ? <AnimalDetail key={id} id={id} /> : <AnimalsScreen />;
    case 'animal': return <AnimalDetail key={id} id={id} />;
    case 'animal-add': return <AnimalEditor key="new-animal" />;
    case 'animal-edit': return <AnimalEditor key={id} id={id} />;
    case 'farm': return <FarmScreen />;
    case 'record-add': return <RecordEditor key={id} id={id} />;
    case 'devices':
    case 'device': return <DevicesScreen id={id} />;
    case 'alerts':
    case 'alert': return <AlertsScreen id={id} />;
    case 'emergency': return <EmergencyScreen />;
    case 'education': return <EducationScreen />;
    case 'article': return <EducationScreen id={id} />;
    case 'vets': return <VetsScreen />;
    case 'vet':
    case 'book': return <VetProfileScreen key={id} id={id} />;
    case 'appointments':
    case 'appointment': return <AppointmentsScreen id={id} />;
    case 'prescriptions':
    case 'prescription': return <PrescriptionsScreen id={id} />;
    case 'reminders': return <RemindersScreen />;
    case 'ai': return <AICompanionScreen />;
    case 'shop': return <ShopScreen />;
    case 'orders':
    case 'order': return <OrdersScreen id={id} />;
    default:
      return (
        <Screen title={t('পাতা পাওয়া যায়নি', 'Page unavailable')} back>
          <AppText>{t('হোম থেকে আবার চেষ্টা করুন।', 'Try again from your home screen.')}</AppText>
          <Button title={t('হোম', 'Home')} onPress={() => go('home')} />
        </Screen>
      );
  }
}
