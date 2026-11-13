import type { DemoScenario, DemoState, User, VitalReading } from './types.ts';
import { isoAfter } from './validation.ts';

export const DEMO_IDS = {
  farmer: 'farmer-rahim', otherFarmer: 'farmer-salma', vet: 'vet-farhana', bank: 'bank-padma', insurer: 'insurer-suraksha', admin: 'admin-palito',
  farm: 'farm-shobuj', healthy: 'animal-lali', sick: 'animal-moti', collateral: 'animal-shyamoli', uninsured: 'animal-champa', otherAnimal: 'animal-salma',
} as const;
export const DEMO_ACCOUNTS: readonly User[] = [
  { id: DEMO_IDS.farmer, role: 'farmer', name: 'Rahim Uddin', nameBn: 'রহিম উদ্দিন', phone: '+8801712345678', status: 'active', district: 'Sirajganj' },
  { id: DEMO_IDS.otherFarmer, role: 'farmer', name: 'Salma Begum', nameBn: 'সালমা বেগম', phone: '+8801812345678', status: 'active', district: 'Pabna' },
  { id: DEMO_IDS.vet, role: 'vet', name: 'Dr. Farhana Ahmed', nameBn: 'ডা. ফারহানা আহমেদ', phone: '+8801912345678', status: 'active', district: 'Sirajganj', specialty: 'Livestock care · প্রাণিসম্পদ চিকিৎসা', fee: 500, rating: 4.9, available: true },
  { id: DEMO_IDS.bank, role: 'bank', name: 'Padma Bank Demo', nameBn: 'পদ্মা ব্যাংক ডেমো', phone: '+8801612345678', status: 'active', district: 'Dhaka' },
  { id: DEMO_IDS.insurer, role: 'insurer', name: 'Suraksha Insurance Demo', nameBn: 'সুরক্ষা বীমা ডেমো', phone: '+8801512345678', status: 'active', district: 'Dhaka' },
  { id: DEMO_IDS.admin, role: 'admin', name: 'Palito Admin', nameBn: 'পালিত অ্যাডমিন', phone: '+8801312345678', status: 'active', district: 'Dhaka' },
];

export function sampleReadings(now: string, abnormal = false): VitalReading[] {
  return Array.from({ length: 29 }, (_, index) => ({
    at: isoAfter(now, -(28 - index) * 360), temperature: abnormal && index === 28 ? 40.2 : 38.2 + (index % 4) * 0.1,
    heartRate: abnormal && index === 28 ? 100 : 65 + index % 8, activity: abnormal && index === 28 ? 21 : 70 + index % 9,
  }));
}

export function createDemoState(scenario: DemoScenario = 'normal', date: Date = new Date('2026-11-14T03:00:00.000Z')): DemoState {
  const now = date.toISOString();
  const earlier = isoAfter(now, -1440 * 10);
  const state: DemoState = {
    schemaVersion: 1, revision: 0, now, processedRequests: [],
    session: { userId: null, locale: 'bn', onboarded: false }, settings: { offline: false, notifications: true, scenario },
    users: DEMO_ACCOUNTS.map(user => ({ ...user })),
    farms: [{ id: DEMO_IDS.farm, ownerId: DEMO_IDS.farmer, name: 'সবুজ খামার', district: 'Sirajganj', address: 'শাহজাদপুর, সিরাজগঞ্জ', size: 2 },
      { id: 'farm-salma', ownerId: DEMO_IDS.otherFarmer, name: 'সালমার খামার', district: 'Pabna', address: 'পাবনা সদর', size: 1 }],
    animals: [
      { id: DEMO_IDS.healthy, ownerId: DEMO_IDS.farmer, farmId: DEMO_IDS.farm, tag: 'PL-1001', name: 'লালী', species: 'cattle', breed: 'Holstein Friesian', sex: 'female', birthDate: '2022-03-10T00:00:00.000Z', weightKg: 380, value: 140000, healthScore: 94, status: 'healthy', registeredAt: earlier },
      { id: DEMO_IDS.sick, ownerId: DEMO_IDS.farmer, farmId: DEMO_IDS.farm, tag: 'PL-1002', name: 'মতি', species: 'cattle', breed: 'Sahiwal', sex: 'female', birthDate: '2023-01-10T00:00:00.000Z', weightKg: 280, value: 110000, healthScore: 66, status: 'attention', productionDrop: true, registeredAt: earlier },
      { id: DEMO_IDS.collateral, ownerId: DEMO_IDS.farmer, farmId: DEMO_IDS.farm, tag: 'PL-1003', name: 'শ্যামলী', species: 'cattle', breed: 'Red Chittagong', sex: 'female', birthDate: '2021-05-12T00:00:00.000Z', weightKg: 320, value: 100000, healthScore: 89, status: 'healthy', registeredAt: earlier },
      { id: DEMO_IDS.uninsured, ownerId: DEMO_IDS.farmer, farmId: DEMO_IDS.farm, tag: 'PL-1004', name: 'চম্পা', species: 'goat', breed: 'Black Bengal', sex: 'female', birthDate: '2024-06-01T00:00:00.000Z', weightKg: 24, value: 18000, healthScore: 92, status: 'healthy', registeredAt: earlier },
      { id: DEMO_IDS.otherAnimal, ownerId: DEMO_IDS.otherFarmer, farmId: 'farm-salma', tag: 'PL-2001', name: 'রূপা', species: 'buffalo', breed: 'Local', sex: 'female', birthDate: '2022-01-01T00:00:00.000Z', weightKg: 400, value: 160000, healthScore: 90, status: 'healthy', registeredAt: earlier },
    ],
    records: [], devices: [], alerts: [], appointments: [], prescriptions: [], reminders: [],
    products: [
      { id: 'product-feed', name: { bn: 'সুষম গবাদিপশুর খাদ্য', en: 'Balanced cattle feed' }, category: 'feed', price: 1450, unit: { bn: '২৫ কেজি', en: '25 kg' }, stock: 40, requiresPrescription: false },
      { id: 'product-mineral', name: { bn: 'মিনারেল মিক্স (ডেমো)', en: 'Mineral mix (demo)' }, category: 'feed', price: 350, unit: { bn: '১ কেজি', en: '1 kg' }, stock: 80, requiresPrescription: false },
      { id: 'product-medicine', name: { bn: 'প্রেসক্রিপশন পণ্য (ডেমো)', en: 'Prescription product (demo)' }, category: 'medicine', price: 450, unit: { bn: '১ প্যাকেট', en: '1 pack' }, stock: 10, requiresPrescription: true },
      { id: 'product-collar', name: { bn: 'স্মার্ট কলার (ডেমো)', en: 'Smart collar (demo)' }, category: 'equipment', price: 2500, unit: { bn: '১টি', en: '1 item' }, stock: 12, requiresPrescription: false },
    ],
    carts: {}, orders: [], policies: [], claims: [], loans: [], payments: [], notifications: [],
    content: [
      { id: 'content-health', title: { bn: 'প্রতিদিন পশুর যত্ন', en: 'Your daily care routine' }, body: { bn: 'পরিষ্কার পানি, নিরাপদ আশ্রয় এবং নিয়মিত পর্যবেক্ষণ নিশ্চিত করুন। অসুস্থতার লক্ষণে পশুচিকিৎসকের সাহায্য নিন।', en: 'Provide clean water and safe shelter, and observe animals regularly. Contact a veterinarian when you notice signs of illness.' }, category: 'health', status: 'published', updatedAt: now },
      { id: 'content-finance', title: { bn: 'ঋণ বোঝার সহজ উপায়', en: 'Understanding a loan' }, body: { bn: 'এই অ্যাপের মূল্য ও হার শুধুই ডেমো। ঋণের শর্ত ও পরিশোধের পরিকল্পনা আগে বুঝুন।', en: 'Values and rates in this app are examples. Review terms and a repayment plan before making a decision.' }, category: 'finance', status: 'draft', updatedAt: now },
    ], audit: [], aiMessages: [],
  };
  if (scenario === 'empty') { state.farms = []; state.animals = []; return state; }
  for (const animal of state.animals) {
    state.records.push({ id: `record-${animal.id}`, animalId: animal.id, kind: 'registration', title: { bn: 'স্বাস্থ্য পাসপোর্ট তৈরি', en: 'Health passport created' }, note: 'নমুনা নিবন্ধন / Sample registration', createdAt: earlier });
    if (animal.id !== DEMO_IDS.uninsured) state.devices.push({ id: `device-${animal.id}`, animalId: animal.id, serial: `PAL-${animal.tag}`, connected: true, battery: 82, lastSeenAt: now, readings: sampleReadings(now, animal.id === DEMO_IDS.sick) });
  }
  for (const animalId of [DEMO_IDS.healthy, DEMO_IDS.collateral]) state.policies.push({ id: `policy-${animalId}`, farmerId: DEMO_IDS.farmer, animalId, insurerId: DEMO_IDS.insurer, coverage: animalId === DEMO_IDS.healthy ? 120000 : 90000, premium: 3000, status: 'active', submittedAt: earlier, startsAt: earlier, expiresAt: isoAfter(now, 1440 * 355), enhanced: true });
  state.policies.push({ id: 'policy-pending', farmerId: DEMO_IDS.farmer, animalId: DEMO_IDS.sick, insurerId: DEMO_IDS.insurer, coverage: 80000, premium: 2400, status: 'submitted', submittedAt: now, enhanced: true });
  state.loans.push({ id: 'loan-active', farmerId: DEMO_IDS.farmer, animalId: DEMO_IDS.collateral, bankId: DEMO_IDS.bank, purpose: 'খামারের উন্নতি / Farm improvements', repaymentSource: 'দুধ বিক্রি / Milk sales', collateralValue: 100000, amount: 40000, annualRate: 10, termMonths: 12, outstanding: 32000, status: 'active', createdAt: earlier, dueAt: isoAfter(now, 1440 * 20) });
  state.loans.push({ id: 'loan-pending', farmerId: DEMO_IDS.otherFarmer, animalId: DEMO_IDS.otherAnimal, bankId: DEMO_IDS.bank, purpose: 'খাদ্য কেনা / Feed purchase', repaymentSource: 'দুধ বিক্রি / Milk sales', collateralValue: 160000, amount: 60000, annualRate: 10, termMonths: 12, outstanding: 0, status: 'submitted', createdAt: now });
  state.payments.push({ id: 'payment-opening', userId: DEMO_IDS.farmer, kind: 'loan_disbursement', amount: 40000, direction: 'credit', referenceId: 'loan-active', createdAt: earlier }, { id: 'payment-repaid', userId: DEMO_IDS.farmer, kind: 'repayment', amount: 8000, direction: 'debit', referenceId: 'loan-active', createdAt: earlier });
  state.alerts.push({ id: 'alert-temperature', animalId: DEMO_IDS.sick, kind: 'temperature', severity: 'warning', title: { bn: 'মতির তাপমাত্রায় পরিবর্তন', en: 'Moti’s temperature has changed' }, message: { bn: 'এটি নমুনা ডিভাইস তথ্য। পশুচিকিৎসকের পরামর্শের জন্য বুকিং দিন।', en: 'This is sample device data. Book a veterinarian to review it.' }, createdAt: now, status: 'open' });
  state.appointments.push({ id: 'appointment-pending', farmerId: DEMO_IDS.farmer, animalId: DEMO_IDS.healthy, vetId: DEMO_IDS.vet, scheduledAt: isoAfter(now, 120), mode: 'video', priority: 'routine', reason: 'নিয়মিত স্বাস্থ্য পরীক্ষা / Routine checkup', status: 'requested', createdAt: now });
  for (const user of state.users) state.notifications.push({ id: `welcome-${user.id}`, userId: user.id, title: { bn: 'পালিত ডেমোতে স্বাগতম', en: 'Welcome to the Palito demo' }, body: { bn: 'সব তথ্য ও লেনদেন এই ডিভাইসে অনুকরণ করা হয়।', en: 'All data and transactions are simulated on this device.' }, createdAt: now, read: false });
  if (scenario === 'insurance') state.claims.push({ id: 'claim-pending', policyId: `policy-${DEMO_IDS.collateral}`, animalId: DEMO_IDS.collateral, farmerId: DEMO_IDS.farmer, insurerId: DEMO_IDS.insurer, kind: 'death', amount: 90000, evidence: { photo: true, location: true, description: 'নমুনা ঘটনা, যাচাইয়ের জন্য / Sample incident for review', capturedAt: now }, status: 'submitted', createdAt: now });
  return state;
}
