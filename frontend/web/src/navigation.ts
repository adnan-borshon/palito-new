import type { Localized, Role } from '@palito/shared';

export const roleNames: Record<Role, Localized> = {
  farmer: { bn: 'খামারি', en: 'Farmer' },
  vet: { bn: 'পশুচিকিৎসক', en: 'Veterinarian' },
  bank: { bn: 'ব্যাংক', en: 'Bank' },
  insurer: { bn: 'বীমা প্রতিষ্ঠান', en: 'Insurer' },
  admin: { bn: 'প্রশাসক', en: 'Administrator' },
};

export const roleSubtitles: Record<Role, Localized> = {
  bank: { bn: 'কৃষি ঋণ যাচাই ও পোর্টফোলিও ডেস্ক', en: 'Livestock Credit Underwriting & Loan Portfolio Desk' },
  vet: { bn: 'ক্লিনিক্যাল ট্রায়াজ, টেলিমেডিসিন ও প্রেসক্রিপশন ডেস্ক', en: 'Clinical Triage, Telemedicine & Prescription Desk' },
  admin: { bn: 'প্ল্যাটফর্ম গভর্ন্যান্স, শিক্ষা ও অপারেশনস কনসোল', en: 'Platform Governance, CMS & Operations Console' },
  insurer: { bn: 'পলিসি অনুমোদন, দাবি যাচাই ও সেটেলমেন্ট ডেস্ক', en: 'Policy Underwriting, Claim Verification & Settlement Desk' },
  farmer: { bn: 'খামার ব্যবস্থাপনা, স্বাস্থ্য পাসপোর্ট ও আর্থিক সেবা পোর্টাল', en: 'Herd Management, Health Passport & Financial Services Portal' },
};

export interface WebNavItem {
  screen: string;
  label: Localized;
  icon:
    | 'layout-dashboard'
    | 'file-check'
    | 'landmark'
    | 'bell'
    | 'user'
    | 'calendar'
    | 'paw'
    | 'shield-check'
    | 'users'
    | 'book-open'
    | 'bar-chart-3'
    | 'scan'
    | 'wallet'
    | 'stethoscope'
    | 'shopping-bag'
    | 'radio'
    | 'help-circle';
  group?: 'primary' | 'secondary';
}

export const roleNavItems: Record<Role, WebNavItem[]> = {
  bank: [
    { screen: 'home', label: { bn: 'ওভারভিউ ও কিউ', en: 'Overview & Queue' }, icon: 'layout-dashboard', group: 'primary' },
    { screen: 'applications', label: { bn: 'ঋণ আবেদন যাচাই', en: 'Loan Underwriting' }, icon: 'file-check', group: 'primary' },
    { screen: 'loans', label: { bn: 'সক্রিয় ঋণ ও সেটেলমেন্ট', en: 'Active Loans & Settlements' }, icon: 'landmark', group: 'primary' },
    { screen: 'notifications', label: { bn: 'বিজ্ঞপ্তি', en: 'Notifications' }, icon: 'bell', group: 'secondary' },
    { screen: 'profile', label: { bn: 'প্রোফাইল ও সেটিংস', en: 'Profile & Settings' }, icon: 'user', group: 'secondary' },
  ],
  vet: [
    { screen: 'home', label: { bn: 'ক্লিনিক্যাল ডেস্ক', en: 'Clinical Desk' }, icon: 'layout-dashboard', group: 'primary' },
    { screen: 'appointments', label: { bn: 'সাক্ষাৎ ও পরামর্শ', en: 'Consultations & Rx' }, icon: 'calendar', group: 'primary' },
    { screen: 'animals', label: { bn: 'প্রাণী ডিরেক্টরি ও রেকর্ড', en: 'Patient Registry' }, icon: 'paw', group: 'primary' },
    { screen: 'reviews', label: { bn: 'বীমা দাবি পর্যালোচনা', en: 'Claim Reviews' }, icon: 'shield-check', group: 'primary' },
    { screen: 'notifications', label: { bn: 'বিজ্ঞপ্তি', en: 'Notifications' }, icon: 'bell', group: 'secondary' },
    { screen: 'profile', label: { bn: 'প্রোফাইল ও সময়সূচি', en: 'Clinician Profile' }, icon: 'user', group: 'secondary' },
  ],
  admin: [
    { screen: 'home', label: { bn: 'সিস্টেম ওভারভিউ', en: 'System Overview' }, icon: 'layout-dashboard', group: 'primary' },
    { screen: 'users', label: { bn: 'ব্যবহারকারী ও অ্যাক্সেস', en: 'Users & Access' }, icon: 'users', group: 'primary' },
    { screen: 'content', label: { bn: 'শিক্ষামূলক কন্টেন্ট (CMS)', en: 'Educational CMS' }, icon: 'book-open', group: 'primary' },
    { screen: 'reports', label: { bn: 'অডিট ও অপারেশনস রিপোর্ট', en: 'Audit & Reports' }, icon: 'bar-chart-3', group: 'primary' },
    { screen: 'notifications', label: { bn: 'বিজ্ঞপ্তি', en: 'Notifications' }, icon: 'bell', group: 'secondary' },
    { screen: 'profile', label: { bn: 'প্রোফাইল ও সেটিংস', en: 'Profile & Settings' }, icon: 'user', group: 'secondary' },
  ],
  insurer: [
    { screen: 'home', label: { bn: 'আন্ডাররাইটিং ওভারভিউ', en: 'Underwriting Overview' }, icon: 'layout-dashboard', group: 'primary' },
    { screen: 'applications', label: { bn: 'পলিসি আবেদন', en: 'Policy Applications' }, icon: 'file-check', group: 'primary' },
    { screen: 'claims', label: { bn: 'দাবি যাচাই ও পেআউট', en: 'Claims & Payouts' }, icon: 'shield-check', group: 'primary' },
    { screen: 'policies', label: { bn: 'সক্রিয় পলিসি', en: 'Active Policies' }, icon: 'landmark', group: 'primary' },
    { screen: 'notifications', label: { bn: 'বিজ্ঞপ্তি', en: 'Notifications' }, icon: 'bell', group: 'secondary' },
    { screen: 'profile', label: { bn: 'প্রোফাইল ও সেটিংস', en: 'Profile & Settings' }, icon: 'user', group: 'secondary' },
  ],
  farmer: [
    { screen: 'home', label: { bn: 'খামার ড্যাশবোর্ড', en: 'Farm Dashboard' }, icon: 'layout-dashboard', group: 'primary' },
    { screen: 'animals', label: { bn: 'আমার প্রাণী ও পাসপোর্ট', en: 'My Animals & Passport' }, icon: 'paw', group: 'primary' },
    { screen: 'devices', label: { bn: 'ডিভাইস, ভাইটালস ও সতর্কতা', en: 'IoT Vitals & Alerts' }, icon: 'radio', group: 'primary' },
    { screen: 'care', label: { bn: 'পশুচিকিৎসক ও প্রেসক্রিপশন', en: 'Vet Care & Reminders' }, icon: 'stethoscope', group: 'primary' },
    { screen: 'ai', label: { bn: 'স্ক্যান ও AI পরামর্শ', en: 'Scan & AI Advisor' }, icon: 'scan', group: 'primary' },
    { screen: 'wallet', label: { bn: 'ওয়ালেট, ঋণ ও বীমা', en: 'Wallet, Loans & Insurance' }, icon: 'wallet', group: 'primary' },
    { screen: 'market', label: { bn: 'ওষুধ ও খাদ্য বাজার', en: 'Marketplace & Orders' }, icon: 'shopping-bag', group: 'primary' },
    { screen: 'education', label: { bn: 'খামার শিক্ষা', en: 'Knowledge Hub' }, icon: 'book-open', group: 'secondary' },
    { screen: 'notifications', label: { bn: 'বিজ্ঞপ্তি', en: 'Notifications' }, icon: 'bell', group: 'secondary' },
    { screen: 'support', label: { bn: 'সহায়তা কেন্দ্র', en: 'Support Desk' }, icon: 'help-circle', group: 'secondary' },
    { screen: 'profile', label: { bn: 'প্রোফাইল ও খামার তথ্য', en: 'Profile & Farm Setup' }, icon: 'user', group: 'secondary' },
  ],
};

export function webHref(role: Role, screen = 'home', id?: string): string {
  return id ? `/${role}/${screen}/${encodeURIComponent(id)}` : `/${role}/${screen}`;
}

export function mobileDeepLink(role: Role, screen = 'home', id?: string): string {
  return id ? `palito://${role}/${screen}/${encodeURIComponent(id)}` : `palito://${role}/${screen}`;
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && Object.hasOwn(roleNames, value);
}
