import type { DemoState, Localized, Role, User } from './types.ts';
import { assertDomain } from './errors.ts';

export const bilingual = (bn: string, en: string): Localized => ({ bn, en });
export const findById = <T extends { id: string }>(items: T[], id: string): T => {
  const item = items.find(entry => entry.id === id);
  assertDomain(item, 'not_found');
  return item;
};
export const demoBalance = (state: DemoState, userId: string): number => state.payments
  .filter(payment => payment.userId === userId)
  .reduce((total, payment) => total + (payment.direction === 'credit' ? payment.amount : -payment.amount), 0);
export function actor(state: DemoState, roles?: readonly Role[]): User {
  const user = state.users.find(entry => entry.id === state.session.userId);
  assertDomain(user, 'unauthorized');
  assertDomain(user.status === 'active', 'blocked');
  assertDomain(!roles || roles.includes(user.role), 'unauthorized');
  return user;
}
export function ownedAnimal(state: DemoState, animalId: string) {
  const user = actor(state, ['farmer']);
  const animal = findById(state.animals, animalId);
  assertDomain(animal.ownerId === user.id, 'unauthorized');
  return animal;
}
export function activeAnimal(state: DemoState, animalId: string) {
  const animal = ownedAnimal(state, animalId);
  assertDomain(!['sold', 'deceased'].includes(animal.status), 'invalid_transition');
  return animal;
}
export function nextId(state: DemoState, kind: string): string {
  const count = Object.values(state).filter(Array.isArray).reduce((sum, values) => sum + values.length, 0);
  return `${kind}-${state.revision + 1}-${count + 1}`;
}
export function notify(state: DemoState, userId: string, title: Localized, body: Localized, screen?: string, entityId?: string) {
  state.notifications.push({ id: nextId(state, 'notification'), userId, title, body, read: false, createdAt: state.now, screen, entityId });
}
export const heldCollateral = (state: DemoState, animalId: string, exceptId?: string) => state.loans.some(loan => loan.animalId === animalId && loan.id !== exceptId && ['offered', 'submitted', 'approved', 'active'].includes(loan.status));
export function payment(state: DemoState, userId: string, kind: DemoState['payments'][number]['kind'], amount: number, direction: 'credit' | 'debit', referenceId: string) {
  assertDomain(Number.isSafeInteger(amount) && amount > 0);
  assertDomain(Number.isSafeInteger(demoBalance(state, userId) + (direction === 'credit' ? amount : -amount)));
  if (direction === 'debit') assertDomain(demoBalance(state, userId) >= amount, 'funds');
  state.payments.push({ id: nextId(state, 'payment'), userId, kind, amount, direction, referenceId, createdAt: state.now });
}
export function linkedVet(state: DemoState, animalId: string): User {
  const user = actor(state, ['vet']);
  assertDomain(state.appointments.some(item => item.animalId === animalId && item.vetId === user.id && !['rejected', 'cancelled'].includes(item.status)) || state.claims.some(item => item.animalId === animalId && item.vetId === user.id && item.status === 'vet_review'), 'unauthorized');
  return user;
}
