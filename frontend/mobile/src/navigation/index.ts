import { router, type Href } from 'expo-router';
import type { Localized, Role } from '@palito/shared';
import type { IconName } from '@/components/ui';

export const roleNames: Record<Role, Localized> = {
  farmer: { bn: 'খামারি', en: 'Farmer' }, vet: { bn: 'পশুচিকিৎসক', en: 'Veterinarian' },
  bank: { bn: 'ব্যাংক', en: 'Bank' }, insurer: { bn: 'বীমা প্রতিষ্ঠান', en: 'Insurer' }, admin: { bn: 'প্রশাসক', en: 'Administrator' },
};
export interface NavItem { screen: string; label: Localized; icon: IconName; }
const home: NavItem = { screen: 'home', label: { bn: 'হোম', en: 'Home' }, icon: 'home-outline' };
const profile: NavItem = { screen: 'profile', label: { bn: 'প্রোফাইল', en: 'Profile' }, icon: 'person-outline' };
const animals: NavItem = { screen: 'animals', label: { bn: 'পশু', en: 'Animals' }, icon: 'paw-outline' };
export const roleTabs: Record<Role, NavItem[]> = {
  farmer: [home, animals, { screen: 'ai', label: { bn: 'পালিত AI', en: 'Palito AI' }, icon: 'scan-outline' }, { screen: 'wallet', label: { bn: 'ওয়ালেট', en: 'Wallet' }, icon: 'wallet-outline' }, profile],
  vet: [home, { screen: 'appointments', label: { bn: 'সাক্ষাৎ', en: 'Visits' }, icon: 'calendar-outline' }, animals, { screen: 'reviews', label: { bn: 'পর্যালোচনা', en: 'Reviews' }, icon: 'shield-checkmark-outline' }, profile],
  bank: [home, { screen: 'applications', label: { bn: 'আবেদন', en: 'Applications' }, icon: 'document-text-outline' }, { screen: 'loans', label: { bn: 'ঋণ', en: 'Loans' }, icon: 'cash-outline' }, { screen: 'notifications', label: { bn: 'বার্তা', en: 'Alerts' }, icon: 'notifications-outline' }, profile],
  insurer: [home, { screen: 'applications', label: { bn: 'আবেদন', en: 'Applications' }, icon: 'document-text-outline' }, { screen: 'claims', label: { bn: 'দাবি', en: 'Claims' }, icon: 'shield-checkmark-outline' }, { screen: 'policies', label: { bn: 'পলিসি', en: 'Policies' }, icon: 'documents-outline' }, profile],
  admin: [home, { screen: 'users', label: { bn: 'ব্যবহারকারী', en: 'Users' }, icon: 'people-outline' }, { screen: 'content', label: { bn: 'শিক্ষা', en: 'Content' }, icon: 'book-outline' }, { screen: 'reports', label: { bn: 'রিপোর্ট', en: 'Reports' }, icon: 'bar-chart-outline' }, profile],
};
export function routeFor(role: Role, screen = 'home', id?: string): Href {
  return id ? { pathname: '/[role]/[screen]/[id]', params: { role, screen, id } } : { pathname: '/[role]/[screen]', params: { role, screen } };
}
export function navigate(role: Role, screen: string, id?: string) { router.push(routeFor(role, screen, id)); }
export function isRole(value: unknown): value is Role { return typeof value === 'string' && value in roleNames; }
