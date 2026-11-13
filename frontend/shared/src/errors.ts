/** Domain failures are data. No native platform or network exceptions escape the repository. */
export const messages = {
  unauthorized: { bn: 'এই কাজের অনুমতি নেই। সঠিক ডেমো অ্যাকাউন্টে প্রবেশ করুন।', en: 'This account cannot perform that action. Switch to the appropriate demo account.' },
  blocked: { bn: 'এই ডেমো অ্যাকাউন্টটি বন্ধ আছে।', en: 'This demo account is blocked.' },
  not_found: { bn: 'তথ্যটি পাওয়া যায়নি। তালিকা আবার দেখুন।', en: 'That record was not found. Refresh the list.' },
  validation: { bn: 'তথ্য যাচাই করে আবার চেষ্টা করুন।', en: 'Check the entered information and try again.' },
  invalid_transition: { bn: 'বর্তমান অবস্থায় এই কাজ করা যাবে না।', en: 'That action is not available in the current state.' },
  duplicate: { bn: 'এই কাজটি ইতিমধ্যে সম্পন্ন হয়েছে।', en: 'This action has already been completed.' },
  offline: { bn: 'অফলাইন ডেমো চলছে। সংযোগ চালু করে আবার চেষ্টা করুন।', en: 'The offline demo is active. Restore connectivity and try again.' },
  network: { bn: 'ডেমো সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', en: 'The simulated connection failed. Try again.' },
  storage: { bn: 'ডেমো তথ্য সংরক্ষণ করা যায়নি। কোনো পরিবর্তন হয়নি।', en: 'Demo data could not be saved. No changes were made.' },
  corrupt_storage: { bn: 'সংরক্ষিত ডেমো তথ্য পড়া যায়নি। ডেমো রিসেট করুন।', en: 'Saved demo data could not be read. Reset the demo to continue.' },
  version: { bn: 'সংরক্ষিত ডেমো তথ্যের সংস্করণ মেলে না। ডেমো রিসেট করুন।', en: 'Saved demo data uses an unsupported version. Reset the demo to continue.' },
  collateral: { bn: 'এই পশুটি অন্য ঋণের জন্য সংরক্ষিত আছে।', en: 'This animal is already reserved as collateral.' },
  ltv: { bn: 'ঋণ যাচাইকৃত মূল্যের সর্বোচ্চ ৭০% হতে পারে।', en: 'The loan cannot exceed 70% of the verified collateral value.' },
  evidence: { bn: 'প্রয়োজনীয় ছবি, অবস্থান এবং ঘটনার সময় যোগ করুন।', en: 'Add the required photo, location, and incident timestamp.' },
  coverage: { bn: 'এই পশুর জন্য সক্রিয় বীমা নেই।', en: 'This animal does not have active insurance coverage.' },
  iot: { bn: 'এই ডেমো পর্যালোচনার জন্য ৪৮ ঘণ্টার সংযুক্ত ডিভাইস তথ্য প্রয়োজন।', en: 'This demo review requires 48 hours of connected device evidence.' },
  funds: { bn: 'ডেমো ওয়ালেটে যথেষ্ট টাকা নেই।', en: 'The demo wallet has insufficient funds.' },
  otp: { bn: 'ডেমো কোড ভুল বা মেয়াদ শেষ। নতুন কোড নিন।', en: 'The demo code is incorrect or expired. Request a new code.' },
  success: { bn: 'ডেমো তথ্য সংরক্ষিত হয়েছে।', en: 'Demo changes saved.' },
} as const;

export type DomainErrorCode = keyof typeof messages;
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  constructor(code: DomainErrorCode) {
    super(messages[code].en);
    this.name = 'DomainError';
    this.code = code;
  }
}
export function assertDomain(condition: unknown, code: DomainErrorCode = 'validation'): asserts condition {
  if (!condition) throw new DomainError(code);
}
