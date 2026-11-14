import { describe, expect, jest, test } from '@jest/globals';
import { isRole, routeFor } from '@/navigation';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('mobile role routes', () => {
  test('rejects inherited object properties in untrusted deep links', () => {
    for (const value of ['constructor', 'toString', '__proto__', '', null, undefined, 1]) expect(isRole(value)).toBe(false);
    for (const value of ['farmer', 'vet', 'bank', 'insurer', 'admin']) expect(isRole(value)).toBe(true);
  });
  test('keeps entity ids as route parameters', () => {
    expect(routeFor('farmer', 'animal', 'cow/1')).toEqual({ pathname: '/[role]/[screen]/[id]', params: { role: 'farmer', screen: 'animal', id: 'cow/1' } });
  });
});
