import type { DemoState } from './types.ts';
import { assertDomain } from './errors.ts';
import { isNonNegativeMoney, isPositiveMoney, isValidDate, maximumLoanAmount } from './validation.ts';

type Check = (value: unknown) => boolean;
const text: Check = value => typeof value === 'string' && value.length <= 20000;
const nonempty: Check = value => text(value) && (value as string).trim().length > 0;
const bool: Check = value => typeof value === 'boolean';
const numeric: Check = value => typeof value === 'number' && Number.isFinite(value);
const integer: Check = value => typeof value === 'number' && isNonNegativeMoney(value);
const money: Check = value => typeof value === 'number' && isPositiveMoney(value);
const date: Check = isValidDate;
const choice = (...values: unknown[]): Check => value => values.includes(value);
const optional = (check: Check): Check => value => value === undefined || check(value);
const array = (check: Check): Check => value => Array.isArray(value) && value.length <= 50000 && value.every(check);
const object = (fields: Record<string, Check>): Check => value => !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(fields).every(([key, check]) => check((value as Record<string, unknown>)[key])) && Object.keys(value).every(key => key in fields);
const localized = object({ bn: nonempty, en: nonempty });
const id = nonempty;
const role = choice('farmer', 'vet', 'bank', 'insurer', 'admin');
const medicine = object({ name: nonempty, dose: nonempty, frequency: nonempty, days: value => integer(value) && (value as number) >= 1 && (value as number) <= 90 });
const cartItem = object({ productId: id, quantity: value => integer(value) && (value as number) > 0 && (value as number) <= 99 });
const shape: Check = object({
  schemaVersion: choice(1), revision: integer, now: date,
  session: object({ userId: value => value === null || id(value), locale: choice('bn', 'en'), onboarded: bool, pendingPhone: optional(nonempty), otpExpiresAt: optional(date) }),
  settings: object({ offline: bool, notifications: bool, scenario: choice('normal', 'health', 'insurance', 'lending', 'empty'), failNext: optional(bool) }),
  processedRequests: array(object({ requestId: id, command: nonempty, resultId: optional(id) })),
  users: array(object({ id, role, name: nonempty, nameBn: nonempty, phone: nonempty, status: choice('active', 'suspended'), district: nonempty, avatar: optional(text), specialty: optional(text), fee: optional(integer), rating: optional(numeric), available: optional(bool), schedule: optional(text) })),
  farms: array(object({ id, ownerId: id, name: nonempty, district: nonempty, address: nonempty, size: value => numeric(value) && (value as number) > 0 })),
  animals: array(object({ id, ownerId: id, farmId: id, tag: nonempty, name: nonempty, species: choice('cattle', 'goat', 'buffalo'), breed: nonempty, sex: choice('female', 'male'), birthDate: date, weightKg: value => numeric(value) && (value as number) > 0 && (value as number) <= 2000, value: money, healthScore: value => numeric(value) && (value as number) >= 0 && (value as number) <= 100, status: choice('healthy', 'attention', 'critical', 'deceased', 'sold'), image: optional(text), registeredAt: date, productionDrop: optional(bool) })),
  records: array(object({ id, animalId: id, vetId: optional(id), appointmentId: optional(id), kind: choice('registration', 'checkup', 'vaccination', 'treatment', 'death'), title: localized, note: nonempty, createdAt: date, nextDueAt: optional(date) })),
  devices: array(object({ id, animalId: id, serial: nonempty, connected: bool, battery: value => numeric(value) && (value as number) >= 0 && (value as number) <= 100, lastSeenAt: date, readings: array(object({ at: date, temperature: numeric, heartRate: numeric, activity: numeric })) })),
  alerts: array(object({ id, animalId: id, kind: choice('temperature', 'heart_rate', 'inactivity', 'disconnected', 'emergency'), severity: choice('info', 'warning', 'critical'), title: localized, message: localized, createdAt: date, status: choice('open', 'acknowledged', 'escalated', 'resolved'), appointmentId: optional(id) })),
  appointments: array(object({ id, farmerId: id, animalId: id, vetId: id, alertId: optional(id), scheduledAt: date, mode: choice('video', 'visit'), priority: choice('routine', 'urgent', 'emergency'), reason: nonempty, status: choice('requested', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed'), createdAt: date, decisionNote: optional(text), consultationNote: optional(text) })),
  prescriptions: array(object({ id, appointmentId: id, animalId: id, farmerId: id, vetId: id, diagnosis: nonempty, advice: nonempty, medicines: array(medicine), createdAt: date })),
  reminders: array(object({ id, prescriptionId: id, animalId: id, medicine: nonempty, time: nonempty, takenDates: array(date), enabled: bool })),
  products: array(object({ id, name: localized, category: choice('medicine', 'feed', 'equipment'), price: money, unit: localized, stock: integer, image: optional(text), requiresPrescription: bool })),
  carts: value => !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(array(cartItem)),
  orders: array(object({ id, farmerId: id, items: array(object({ productId: id, quantity: money, price: money })), total: money, address: nonempty, status: choice('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'), createdAt: date })),
  policies: array(object({ id, farmerId: id, animalId: id, insurerId: id, coverage: money, premium: money, status: choice('submitted', 'active', 'rejected', 'expired', 'settled'), submittedAt: date, startsAt: optional(date), expiresAt: optional(date), decisionNote: optional(text), enhanced: optional(bool) })),
  claims: array(object({ id, policyId: id, animalId: id, farmerId: id, insurerId: id, kind: choice('illness', 'death'), amount: money, evidence: object({ photo: bool, location: bool, description: nonempty, capturedAt: optional(date), latitude: optional(value => numeric(value) && Math.abs(value as number) <= 90), longitude: optional(value => numeric(value) && Math.abs(value as number) <= 180) }), status: choice('submitted', 'manual_review', 'vet_review', 'approved', 'rejected', 'paid'), createdAt: date, vetId: optional(id), vetOpinion: optional(text), decisionNote: optional(text), payout: optional(integer), debtSettlement: optional(integer), farmerPayout: optional(integer) })),
  loans: array(object({ id, farmerId: id, animalId: id, bankId: id, purpose: nonempty, repaymentSource: nonempty, collateralValue: money, amount: money, annualRate: value => numeric(value) && (value as number) >= 0 && (value as number) <= 100, termMonths: value => integer(value) && (value as number) >= 1 && (value as number) <= 36, outstanding: integer, status: choice('offered', 'submitted', 'approved', 'rejected', 'active', 'paid', 'settled'), createdAt: date, dueAt: optional(date), graceUntil: optional(date), decisionNote: optional(text) })),
  payments: array(object({ id, userId: id, kind: choice('loan_disbursement', 'repayment', 'insurance_payout', 'debt_settlement', 'order', 'premium'), amount: money, direction: choice('credit', 'debit'), referenceId: id, createdAt: date })),
  notifications: array(object({ id, userId: id, title: localized, body: localized, createdAt: date, read: bool, screen: optional(text), entityId: optional(id) })),
  content: array(object({ id, title: localized, body: localized, category: choice('health', 'nutrition', 'finance'), status: choice('draft', 'published'), updatedAt: date })),
  audit: array(object({ id, actorId: id, action: nonempty, entityId: optional(id), at: date, detail: text })),
  aiMessages: array(object({ id, userId: id, role: choice('user', 'assistant'), text: localized, at: date, mode: choice('text', 'photo', 'voice') })),
});

/** Validate both the persisted shape and cross-record ownership before accepting a snapshot. */
export function assertState(value: unknown): asserts value is DemoState {
  assertDomain(value && typeof value === 'object', 'corrupt_storage');
  assertDomain((value as { schemaVersion?: unknown }).schemaVersion === 1, 'version');
  assertDomain(shape(value), 'corrupt_storage'); const state = value as DemoState;
  const valid = (condition: unknown) => assertDomain(condition, 'corrupt_storage');
  for (const entries of Object.values(state).filter(Array.isArray)) {
    if (entries.length && 'id' in entries[0]) valid(new Set(entries.map((item: { id: string }) => item.id)).size === entries.length);
  }
  valid(new Set(state.processedRequests.map(item => item.requestId)).size === state.processedRequests.length);
  const user = (userId: string, expectedRole?: string) => state.users.find(item => item.id === userId && (!expectedRole || item.role === expectedRole));
  const animal = (animalId: string, ownerId?: string) => state.animals.find(item => item.id === animalId && (!ownerId || item.ownerId === ownerId));
  valid(!state.session.userId || user(state.session.userId)); valid(state.users.some(item => item.role === 'admin' && item.status === 'active'));
  for (const farm of state.farms) valid(user(farm.ownerId, 'farmer'));
  for (const item of state.animals) { valid(user(item.ownerId, 'farmer') && state.farms.some(farm => farm.id === item.farmId && farm.ownerId === item.ownerId)); valid(Date.parse(item.birthDate) <= Date.parse(state.now)); }
  for (const item of state.devices) valid(animal(item.animalId));
  valid(new Set(state.devices.map(item => item.serial)).size === state.devices.length); valid(new Set(state.devices.map(item => item.animalId)).size === state.devices.length);
  for (const item of state.records) valid(animal(item.animalId) && (!item.vetId || user(item.vetId, 'vet')) && (!item.appointmentId || state.appointments.some(appointment => appointment.id === item.appointmentId && appointment.animalId === item.animalId)));
  for (const item of state.alerts) valid(animal(item.animalId) && (!item.appointmentId || state.appointments.some(appointment => appointment.id === item.appointmentId && appointment.animalId === item.animalId)));
  for (const item of state.appointments) valid(animal(item.animalId, item.farmerId) && user(item.vetId, 'vet') && (!item.alertId || state.alerts.some(alert => alert.id === item.alertId && alert.animalId === item.animalId)));
  for (const item of state.prescriptions) valid(state.appointments.some(appointment => appointment.id === item.appointmentId && appointment.animalId === item.animalId && appointment.farmerId === item.farmerId && appointment.vetId === item.vetId));
  for (const item of state.reminders) valid(state.prescriptions.some(prescription => prescription.id === item.prescriptionId && prescription.animalId === item.animalId));
  for (const [userId, cart] of Object.entries(state.carts)) { valid(user(userId, 'farmer')); valid(new Set(cart.map(item => item.productId)).size === cart.length); for (const item of cart) valid(state.products.some(product => product.id === item.productId)); }
  for (const item of state.orders) { valid(user(item.farmerId, 'farmer') && item.items.length > 0 && item.total === item.items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0)); for (const entry of item.items) valid(state.products.some(product => product.id === entry.productId)); }
  for (const item of state.policies) { valid(animal(item.animalId, item.farmerId) && user(item.insurerId, 'insurer')); if (['active', 'expired', 'settled'].includes(item.status)) valid(item.startsAt && item.expiresAt && Date.parse(item.startsAt) < Date.parse(item.expiresAt)); }
  for (const item of state.claims) {
    const policy = state.policies.find(policy => policy.id === item.policyId); valid(policy && policy.animalId === item.animalId && policy.farmerId === item.farmerId && policy.insurerId === item.insurerId && item.amount <= policy.coverage);
    valid(!item.vetId || user(item.vetId, 'vet')); if (item.status === 'paid') valid(item.payout === item.amount && item.debtSettlement !== undefined && item.farmerPayout !== undefined && item.payout === item.debtSettlement + item.farmerPayout);
  }
  for (const item of state.loans) { valid(animal(item.animalId, item.farmerId) && user(item.bankId, 'bank') && item.amount <= maximumLoanAmount(item.collateralValue) && item.outstanding <= item.amount); if (['paid', 'settled', 'offered', 'submitted', 'approved', 'rejected'].includes(item.status)) valid(item.outstanding === 0); }
  const held = state.loans.filter(item => ['offered', 'submitted', 'approved', 'active'].includes(item.status)); valid(new Set(held.map(item => item.animalId)).size === held.length);
  const covered = state.policies.filter(item => ['submitted', 'active'].includes(item.status)); valid(new Set(covered.map(item => item.animalId)).size === covered.length);
  for (const item of state.payments) {
    valid(user(item.userId));
    if (['loan_disbursement', 'repayment', 'debt_settlement'].includes(item.kind)) valid(state.loans.some(loan => loan.id === item.referenceId && (item.kind === 'debt_settlement' ? loan.bankId : loan.farmerId) === item.userId));
    if (item.kind === 'insurance_payout') valid(state.claims.some(claim => claim.id === item.referenceId && claim.farmerId === item.userId));
    if (item.kind === 'premium') valid(state.policies.some(policy => policy.id === item.referenceId && policy.farmerId === item.userId));
    if (item.kind === 'order') valid(state.orders.some(order => order.id === item.referenceId && order.farmerId === item.userId));
  }
  for (const item of state.notifications) valid(user(item.userId)); for (const item of state.aiMessages) valid(user(item.userId, 'farmer'));
}
