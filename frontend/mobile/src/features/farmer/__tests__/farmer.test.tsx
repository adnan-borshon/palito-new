import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createDemoRepository, createDemoState, DEMO_IDS, type DemoScenario } from '@palito/shared';
import { DemoProvider } from '@/providers/demo';
import { AnimalEditor, AnimalsScreen } from '../animals';
import { AlertsScreen, EmergencyScreen } from '../monitoring';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), canGoBack: () => true, back: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) }));

function repository(scenario: DemoScenario = 'normal') {
  const initialState = createDemoState(scenario);
  initialState.session.userId = DEMO_IDS.farmer;
  initialState.session.locale = 'en';
  return createDemoRepository({ initialState, latencyMs: 0 });
}

describe('farmer mobile interactions', () => {
  test('invalid registration preserves state; valid Bangla numerals create a linked passport', async () => {
    const repo = repository();
    const before = repo.getSnapshot().animals.length;
    await render(<DemoProvider repository={repo}><AnimalEditor /></DemoProvider>);
    await fireEvent.press(screen.getByTestId('animal-save'));
    expect(screen.getByText('Enter the animal’s name')).toBeTruthy();
    expect(repo.getSnapshot().animals).toHaveLength(before);
    await fireEvent.changeText(screen.getByTestId('animal-name'), 'Test calf');
    await fireEvent.changeText(screen.getByTestId('animal-breed'), 'Local');
    await fireEvent.changeText(screen.getByTestId('animal-birth'), '2025-01-01');
    await fireEvent.changeText(screen.getByTestId('animal-weight'), '৮০');
    await fireEvent.changeText(screen.getByTestId('animal-value'), '৩০০০০');
    await fireEvent.press(screen.getByTestId('animal-save'));
    await waitFor(() => expect(screen.getByText('Your animal record is ready')).toBeTruthy());
    const animal = repo.getSnapshot().animals.find(a => a.name === 'Test calf')!;
    expect(animal.ownerId).toBe(DEMO_IDS.farmer);
    expect(animal.weightKg).toBe(80);
    expect(repo.getSnapshot().records.some(r => r.animalId === animal.id && r.kind === 'registration')).toBe(true);
  });

  test('animal search only reveals the current farmer’s records', async () => {
    const repo = repository();
    await render(<DemoProvider repository={repo}><AnimalsScreen /></DemoProvider>);
    expect(screen.queryByTestId('animal-card-' + DEMO_IDS.otherAnimal)).toBeNull();
    await fireEvent.changeText(screen.getByTestId('animal-search'), 'PL-1002');
    expect(screen.getByTestId('animal-card-' + DEMO_IDS.sick)).toBeTruthy();
    expect(screen.queryByTestId('animal-card-' + DEMO_IDS.healthy)).toBeNull();
  });

  test('priority booking preserves the originating alert and seven-day source history', async () => {
    const repo = repository('health');
    const alert = repo.getSnapshot().alerts.find(a => a.kind !== 'disconnected')!;
    await render(<DemoProvider repository={repo}><AlertsScreen id={alert.id} /></DemoProvider>);
    await fireEvent.press(screen.getByTestId('alert-book'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().appointments.some(a => a.alertId === alert.id)).toBe(true));
    const appointment = repo.getSnapshot().appointments.find(a => a.alertId === alert.id)!;
    expect(appointment.animalId).toBe(alert.animalId);
    expect(appointment.priority).toBe('urgent');
    expect(repo.getSnapshot().alerts.find(a => a.id === alert.id)?.appointmentId).toBe(appointment.id);
    expect(repo.getSnapshot().devices.find(d => d.animalId === alert.animalId)!.readings.length).toBeGreaterThanOrEqual(7);
  });

  test('emergency confirmation creates one dispatch shared with the veterinarian', async () => {
    const repo = repository();
    await render(<DemoProvider repository={repo}><EmergencyScreen /></DemoProvider>);
    expect(screen.getByText('Emergency dispatch notice')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('emergency-request'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().appointments.filter(a => a.priority === 'emergency')).toHaveLength(1));
    const appointment = repo.getSnapshot().appointments.find(a => a.priority === 'emergency')!;
    expect(appointment.vetId).toBe(DEMO_IDS.vet);
    expect(repo.getSnapshot().notifications.some(n => n.userId === DEMO_IDS.vet && n.entityId === appointment.id)).toBe(true);
    await fireEvent.press(screen.getByTestId('emergency-request'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    expect(repo.getSnapshot().appointments.filter(a => a.priority === 'emergency')).toHaveLength(1);
  });
});

