import { describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createDemoRepository, createDemoState, DEMO_IDS, type DemoScenario, type Role } from '@palito/shared';
import { DemoProvider } from '@/providers/demo';
import { FeatureScreen } from '../registry';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), canGoBack: () => true, back: jest.fn(), replace: jest.fn() },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

function makeRepo(role: Role = 'farmer', scenario: DemoScenario = 'normal', locale: 'bn' | 'en' = 'en') {
  const initialState = createDemoState(scenario);
  const user = initialState.users.find(u => u.role === role)!;
  initialState.session.userId = user.id;
  initialState.session.locale = locale;
  return createDemoRepository({ initialState, latencyMs: 0 });
}

describe('cross-role mobile journeys and role screens', () => {
  test('UC-001: vet accepts, starts, and completes consultation; farmer receives prescription and reminder', async () => {
    const repo = makeRepo('vet', 'normal');
    const appointmentId = 'appointment-pending';

    const { rerender } = await render(
      <DemoProvider repository={repo}>
        <FeatureScreen role="vet" screen="appointment" id={appointmentId} />
      </DemoProvider>,
    );

    await fireEvent.press(screen.getByTestId('vet-accept-appointment'));
    await waitFor(() => expect(repo.getSnapshot().appointments.find(a => a.id === appointmentId)?.status).toBe('accepted'));

    await fireEvent.press(screen.getByTestId('vet-start-consultation'));
    await waitFor(() => expect(repo.getSnapshot().appointments.find(a => a.id === appointmentId)?.status).toBe('in_progress'));

    await fireEvent.press(screen.getByTestId('vet-complete-consultation'));
    await waitFor(() => expect(repo.getSnapshot().appointments.find(a => a.id === appointmentId)?.status).toBe('completed'));

    const snapshot = repo.getSnapshot();
    expect(snapshot.prescriptions).toHaveLength(1);
    expect(snapshot.reminders).toHaveLength(1);
    expect(snapshot.notifications.some(n => n.userId === DEMO_IDS.insurer && n.screen === 'policies')).toBe(true);

    await act(async () => {
      await repo.execute({ type: 'auth.switch', userId: DEMO_IDS.farmer });
    });
    const reminderId = repo.getSnapshot().reminders[0].id;
    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="reminders" />
      </DemoProvider>,
    );

    await fireEvent.press(screen.getByTestId(`take-reminder-${reminderId}`));
    await waitFor(() => expect(repo.getSnapshot().reminders[0].takenDates).toHaveLength(1));
  });

  test('UC-002: farmer submits death claim on secured collateral; insurer auto-reviews and pays out settling debt first', async () => {
    const repo = makeRepo('farmer', 'normal');
    const policyId = `policy-${DEMO_IDS.collateral}`;

    const { rerender } = await render(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="claim-apply" id={policyId} />
      </DemoProvider>,
    );

    await fireEvent.changeText(screen.getByTestId('claim-amount'), '90000');
    await fireEvent.changeText(screen.getByTestId('claim-description'), 'Sudden death confirmed with collar and photo evidence');
    await fireEvent.press(screen.getByTestId('attach-evidence'));
    await fireEvent.press(screen.getByTestId('attach-location'));
    await fireEvent.press(screen.getByTestId('submit-claim'));
    await fireEvent.press(screen.getByTestId('confirm-action'));

    await waitFor(() => expect(repo.getSnapshot().claims).toHaveLength(1));
    const claimId = repo.getSnapshot().claims[0].id;

    await act(async () => {
      await repo.execute({ type: 'auth.switch', userId: DEMO_IDS.insurer });
    });
    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="insurer" screen="claim" id={claimId} />
      </DemoProvider>,
    );

    await fireEvent.press(screen.getByTestId('auto-review'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().claims[0].status).toBe('approved'));

    await fireEvent.press(screen.getByTestId('pay-claim'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().claims[0].status).toBe('paid'));

    const paidClaim = repo.getSnapshot().claims[0];
    expect(paidClaim.debtSettlement).toBe(32000);
    expect(paidClaim.farmerPayout).toBe(58000);
    expect(repo.getSnapshot().loans.find(l => l.id === 'loan-active')?.status).toBe('settled');
    expect(repo.getSnapshot().animals.find(a => a.id === DEMO_IDS.collateral)?.status).toBe('deceased');
  });

  test('UC-003: enforces 70% LTV cap, creates offer, accepts, bank approves/disburses, and farmer repays', async () => {
    const repo = makeRepo('farmer', 'normal');

    const { rerender } = await render(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="loan-apply" id={DEMO_IDS.healthy} />
      </DemoProvider>,
    );

    // 70% of 140,000 is 98,000; 99,000 must be blocked by validation
    await fireEvent.changeText(screen.getByTestId('loan-amount-input'), '99000');
    await fireEvent.press(screen.getByTestId('create-loan-offer'));
    expect(screen.getByText('Loan principal cannot exceed 70% of verified collateral value.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('loan-amount-input'), '98000');
    await fireEvent.press(screen.getByTestId('create-loan-offer'));
    await fireEvent.press(screen.getByTestId('confirm-action'));

    await waitFor(() => expect(repo.getSnapshot().loans.some(l => l.animalId === DEMO_IDS.healthy && l.status === 'offered')).toBe(true));
    const loan = repo.getSnapshot().loans.find(l => l.animalId === DEMO_IDS.healthy)!;

    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="loan" id={loan.id} />
      </DemoProvider>,
    );
    await fireEvent.press(screen.getByTestId('accept-loan-offer'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().loans.find(l => l.id === loan.id)?.status).toBe('submitted'));

    await act(async () => {
      await repo.execute({ type: 'auth.switch', userId: DEMO_IDS.bank });
    });
    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="bank" screen="loan" id={loan.id} />
      </DemoProvider>,
    );
    await fireEvent.press(screen.getByTestId('approve-loan'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().loans.find(l => l.id === loan.id)?.status).toBe('approved'));

    await fireEvent.press(screen.getByTestId('disburse-loan'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().loans.find(l => l.id === loan.id)?.status).toBe('active'));

    await act(async () => {
      await repo.execute({ type: 'auth.switch', userId: DEMO_IDS.farmer });
    });
    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="loan" id={loan.id} />
      </DemoProvider>,
    );
    await fireEvent.changeText(screen.getByTestId('repay-amount-input'), '10000');
    await fireEvent.press(screen.getByTestId('submit-repay'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().loans.find(l => l.id === loan.id)?.outstanding).toBe(88000));
  });

  test('Farmer AI companion (text/photo/voice) and marketplace order/delivery simulation work end-to-end', async () => {
    const repo = makeRepo('farmer', 'normal');
    const { rerender } = await render(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="ai" />
      </DemoProvider>,
    );

    await fireEvent.changeText(screen.getByTestId('ai-text-input'), 'Not ruminating and fever');
    await fireEvent.press(screen.getByTestId('ai-submit-text'));
    await waitFor(() => expect(repo.getSnapshot().aiMessages.length).toBeGreaterThanOrEqual(2));

    await fireEvent.press(screen.getByTestId('ai-mode-voice'));
    await fireEvent.press(screen.getByTestId('ai-voice-start'));
    await fireEvent.press(screen.getByTestId('ai-voice-stop'));
    await fireEvent.press(screen.getByTestId('ai-submit-voice'));
    await waitFor(() => expect(repo.getSnapshot().aiMessages.some(m => m.mode === 'voice')).toBe(true));

    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="shop" />
      </DemoProvider>,
    );

    await fireEvent.press(screen.getByTestId('add-cart-product-feed'));
    await waitFor(() => expect(repo.getSnapshot().carts[DEMO_IDS.farmer]).toHaveLength(1));

    await fireEvent.press(screen.getByTestId('place-order'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(repo.getSnapshot().orders).toHaveLength(1));

    const orderId = repo.getSnapshot().orders[0].id;
    await rerender(
      <DemoProvider repository={repo}>
        <FeatureScreen role="farmer" screen="order" id={orderId} />
      </DemoProvider>,
    );
    await fireEvent.press(screen.getByTestId(`advance-order-${orderId}`));
    await waitFor(() => expect(repo.getSnapshot().orders[0].status).toBe('confirmed'));
  });

  test('Admin content publishing updates farmer education view and Bangla default locale renders properly', async () => {
    const repo = makeRepo('admin', 'normal', 'bn');
    await render(
      <DemoProvider repository={repo}>
        <FeatureScreen role="admin" screen="content" />
      </DemoProvider>,
    );

    expect(screen.getByText('শিক্ষামূলক কনটেন্ট')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('content-title-bn'), 'নতুন খামার নির্দেশিকা');
    await fireEvent.changeText(screen.getByTestId('content-title-en'), 'New farm care guide');
    await fireEvent.changeText(screen.getByTestId('content-body-bn'), 'গরুর সুষম খাদ্য ও টিকার সম্পূর্ণ নির্দেশিকা।');
    await fireEvent.changeText(screen.getByTestId('content-body-en'), 'Complete guide to balanced cattle nutrition and immunization.');
    await fireEvent.press(screen.getByTestId('save-content'));

    await waitFor(() =>
      expect(repo.getSnapshot().content.some(c => c.title.en === 'New farm care guide' && c.status === 'published')).toBe(true),
    );
  });
});
