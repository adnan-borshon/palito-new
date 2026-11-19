import { BadRequestException } from "@nestjs/common";
import { dateOnly } from "../platform/data-contracts.js";

export function computeBackoffMs(attempt: number): number {
  if (!Number.isSafeInteger(attempt) || attempt < 1) return 15_000;
  const factor = 2 ** Math.min(attempt - 1, 8);
  return Math.min(3_600_000, factor * 15_000);
}

/** Converts a UTC instant to an Asia/Dhaka (UTC+6) calendar date YYYY-MM-DD. */
export function dhakaDateString(utcInstant: Date = new Date()): string {
  const shifted = new Date(utcInstant.getTime() + 6 * 3_600_000);
  return shifted.toISOString().slice(0, 10);
}

/** Validates a YYYY-MM-DD adherence date in Asia/Dhaka (must not be in the future or >366 days old). */
export function validateAdherenceDate(
  localDate: string,
  nowUtc: Date = new Date(),
): Date {
  let parsed: Date;
  try {
    parsed = dateOnly(localDate);
  } catch {
    throw new BadRequestException();
  }
  const todayDhaka = dhakaDateString(nowUtc);
  const minDhaka = dhakaDateString(
    new Date(nowUtc.getTime() - 366 * 86_400_000),
  );
  if (localDate > todayDhaka || localDate < minDhaka) {
    throw new BadRequestException();
  }
  return parsed;
}

export interface MinimalNotificationTemplate {
  category: string;
  title: string;
  body: string;
  urgent: boolean;
}

/**
 * Generates privacy-minimized bilingual notification copy.
 * Never embeds clinical diagnoses, prescription medicine names, phone numbers, or raw financial secrets.
 */
export function minimalNotificationCopy(
  topic: string,
): MinimalNotificationTemplate {
  switch (topic) {
    case "CARE_REMINDER_DUE":
      return {
        category: "CARE_REMINDER",
        title: "পরিচর্যার রিমাইন্ডার · Care follow-up due",
        body: "আপনার পশুর নির্ধারিত ফলো-আপ বা ওষুধের সময় হয়েছে। পালিতো অ্যাপে বিস্তারিত দেখুন। · A scheduled animal care follow-up is due. Open Palito to review.",
        urgent: false,
      };
    case "CARE_REMINDER_ESCALATION":
      return {
        category: "ESCALATION",
        title: "জরুরি পরিচর্যা সতর্কতা · 4h overdue care escalation",
        body: "নির্ধারিত ফলো-আপ ৪ ঘণ্টা পেরিয়ে গেছে এবং এখনও নিশ্চিত করা হয়নি। অনুগ্রহ করে দ্রুত পরীক্ষা করুন। · A care follow-up is over 4 hours past due without confirmation.",
        urgent: true,
      };
    case "APPOINTMENT_BOOKED":
      return {
        category: "APPOINTMENT",
        title: "নতুন সাক্ষাতের অনুরোধ · New appointment request",
        body: "একটি নতুন পশুচিকিৎসা সাক্ষাতের অনুরোধ নথিভুক্ত হয়েছে। · A veterinary appointment request has been recorded.",
        urgent: false,
      };
    case "APPOINTMENT_DECIDED":
    case "APPOINTMENT_ACCEPTED":
    case "APPOINTMENT_REJECTED":
      return {
        category: "APPOINTMENT",
        title: "সাক্ষাতের সিদ্ধান্ত আপডেট · Appointment decision updated",
        body: "আপনার পশুচিকিৎসা সাক্ষাতের অবস্থা আপডেট হয়েছে। · Your veterinary appointment status has been updated.",
        urgent: false,
      };
    case "VALUATION_APPROVED":
      return {
        category: "LOAN",
        title: "জামানত মূল্যায়ন অনুমোদিত · Collateral valuation approved",
        body: "ব্যাংক আপনার পশুর জামানত মূল্যায়ন অনুমোদন করেছে। · A verified bank collateral valuation is now available.",
        urgent: false,
      };
    case "APPOINTMENT_CANCELLED":
      return {
        category: "APPOINTMENT",
        title: "সাক্ষাৎ বাতিল · Appointment cancelled",
        body: "নির্ধারিত পশুচিকিৎসা সাক্ষাৎটি বাতিল করা হয়েছে। · A scheduled veterinary appointment was cancelled.",
        urgent: false,
      };
    case "CONSULTATION_COMPLETED":
      return {
        category: "CARE_EVENT",
        title: "পরামর্শ ও প্রেসক্রিপশন প্রস্তুত · Consultation & prescription ready",
        body: "পশুচিকিৎসক পরামর্শ সম্পন্ন করেছেন। অ্যাপে নিরাপদে প্রেসক্রিপশন দেখুন। · The veterinarian completed the consultation. Sign in to view the record.",
        urgent: false,
      };
    case "LOAN_SUBMITTED":
      return {
        category: "LOAN",
        title: "নতুন ঋণ আবেদন (স্যান্ডবক্স) · Sandbox loan application",
        body: "একটি নতুন জামানতকৃত ঋণ আবেদন পর্যালোচনার জন্য জমা পড়েছে। · A collateralized sandbox loan application is ready for review.",
        urgent: false,
      };
    case "LOAN_DECIDED":
      return {
        category: "LOAN",
        title: "ঋণ আবেদনের সিদ্ধান্ত (স্যান্ডবক্স) · Sandbox loan decision",
        body: "আপনার স্যান্ডবক্স ঋণ আবেদনের সিদ্ধান্ত আপডেট হয়েছে। · Your sandbox loan application status was updated.",
        urgent: false,
      };
    case "LOAN_DISBURSED":
      return {
        category: "LOAN",
        title: "স্যান্ডবক্স অর্থ ছাড় · Sandbox loan disbursed",
        body: "স্যান্ডবক্স ঋণের এন্ট্রি লেজারে যুক্ত হয়েছে (এটি উত্তোলনযোগ্য অর্থ নয়)। · Sandbox loan ledger credit posted (not real withdrawable funds).",
        urgent: false,
      };
    case "LOAN_REPAID":
    case "LOAN_REPAYMENT_SETTLED":
    case "PAYMENT_SETTLED":
      return {
        category: "LOAN",
        title: "স্যান্ডবক্স কিস্তি সমন্বয় · Sandbox repayment posted",
        body: "স্যান্ডবক্স ঋণের পরিশোধ লেজার ও কিস্তিতে সমন্বয় হয়েছে। · Sandbox loan repayment was allocated to your schedule.",
        urgent: false,
      };
    case "LOAN_GRACE_GRANTED":
      return {
        category: "LOAN",
        title: "কিস্তির সময় বৃদ্ধি (স্যান্ডবক্স) · Sandbox installment grace granted",
        body: "ব্যাংক পর্যালোচনার পর আপনার কিস্তির নির্ধারিত তারিখ বৃদ্ধি করা হয়েছে। · Your installment due date was extended after manual bank review.",
        urgent: false,
      };
    case "POLICY_SUBMITTED":
      return {
        category: "INSURANCE",
        title: "বীমা আবেদন নথিভুক্ত (স্যান্ডবক্স) · Sandbox policy application submitted",
        body: "আপনার পশুর বীমা আবেদন পর্যালোচনার জন্য জমা হয়েছে। · Your livestock insurance policy application was submitted.",
        urgent: false,
      };
    case "POLICY_DECIDED":
      return {
        category: "INSURANCE",
        title: "বীমা আবেদনের সিদ্ধান্ত (স্যান্ডবক্স) · Sandbox policy decision",
        body: "বীমা প্রতিষ্ঠান আপনার আবেদনের সিদ্ধান্ত দিয়েছে। সক্রিয়করণের জন্য প্রিমিয়াম নিশ্চিতকরণ প্রয়োজন। · Insurer recorded a policy decision; confirmed premium activates coverage.",
        urgent: false,
      };
    case "POLICY_ACTIVATED":
      return {
        category: "INSURANCE",
        title: "বীমা পলিসি সক্রিয় (স্যান্ডবক্স) · Sandbox policy coverage active",
        body: "প্রিমিয়াম নিশ্চিত হওয়ার পর আপনার স্যান্ডবক্স বীমা পলিসি সক্রিয় হয়েছে। · Your sandbox livestock insurance coverage is now active.",
        urgent: false,
      };
    case "CLAIM_SUBMITTED":
      return {
        category: "INSURANCE",
        title: "বীমা দাবি জমা (স্যান্ডবক্স) · Sandbox insurance claim submitted",
        body: "প্রমাণসহ বীমা দাবি পর্যালোচনার জন্য নথিভুক্ত হয়েছে। · Your insurance claim and private evidence were recorded for review.",
        urgent: false,
      };
    case "CLAIM_REFERRED_TO_VET":
      return {
        category: "INSURANCE",
        title: "বীমা দাবির ক্লিনিক্যাল মতামত অনুরোধ · Claim clinical review referral",
        body: "একটি বীমা দাবির জন্য আপনার ক্লিনিক্যাল মতামত অনুরোধ করা হয়েছে। · An insurer referred a livestock claim for your clinical opinion.",
        urgent: false,
      };
    case "CLAIM_VET_REVIEWED":
      return {
        category: "INSURANCE",
        title: "পশুচিকিৎসকের মতামত সংরক্ষিত · Veterinarian claim opinion recorded",
        body: "রেফারকৃত পশুচিকিৎসক বীমা দাবিতে ক্লিনিক্যাল মতামত যুক্ত করেছেন। · The referred veterinarian submitted a signed clinical opinion.",
        urgent: false,
      };
    case "CLAIM_DECIDED":
      return {
        category: "INSURANCE",
        title: "বীমা দাবির সিদ্ধান্ত (স্যান্ডবক্স) · Sandbox claim decision updated",
        body: "আপনার স্যান্ডবক্স বীমা দাবির পর্যালোচনার সিদ্ধান্ত আপডেট হয়েছে। · A decision was recorded on your sandbox insurance claim.",
        urgent: false,
      };
    case "CLAIM_SETTLED":
      return {
        category: "INSURANCE",
        title: "বীমা দাবি নিষ্পত্তি (স্যান্ডবক্স) · Sandbox claim settlement posted",
        body: "স্যান্ডবক্স বীমা দাবির অর্থ ঋণ সমন্বয় ও লেজারে নিষ্পত্তি হয়েছে (উত্তোলনযোগ্য অর্থ নয়)। · Sandbox claim settlement allocated debt-first in the ledger.",
        urgent: false,
      };
    case "DEVICE_ALERT_RAISED":
      return {
        category: "DEVICE_ALERT",
        title: "পশুর টেলিমেট্রি সতর্কতা · Livestock sensor alert raised",
        body: "ডিভাইস থেকে নতুন সতর্কতা পাওয়া গেছে। পালিতো অ্যাপে বিস্তারিত দেখুন। · A reviewed sensor alert rule triggered. Open Palito to review.",
        urgent: true,
      };
    case "DEVICE_ALERT_ESCALATION":
      return {
        category: "ESCALATION",
        title: "৪ ঘণ্টার জরুরি সতর্কতা বৃদ্ধি · 4h overdue device alert escalation",
        body: "টেলিমেট্রি সতর্কতা ৪ ঘণ্টার বেশি সময় ধরে নিশ্চিত করা হয়নি। দ্রুত পরীক্ষা করুন। · An open device alert was not acknowledged within 4 hours.",
        urgent: true,
      };
    case "EMERGENCY_TRIAGE_LOGGED":
      return {
        category: "EMERGENCY",
        title: "জরুরি ট্রায়াজ অনুরোধ · Emergency triage request recorded",
        body: "আপনার জরুরি পশুচিকিৎসা ট্রায়াজ অনুরোধ নথিভুক্ত হয়েছে। কভারেজ ও স্লট অ্যাপে দেখুন। · Your emergency veterinary triage request was recorded. Check coverage status in Palito.",
        urgent: true,
      };
    case "ORDER_PAID":
      return {
        category: "COMMERCE",
        title: "অর্ডার পেমেন্ট নিশ্চিত (স্যান্ডবক্স) · Sandbox order payment confirmed",
        body: "আপনার অর্ডারের পেমেন্ট স্যান্ডবক্স লেজারে সমন্বয় হয়েছে। · Your sandbox pharmacy order payment has been confirmed.",
        urgent: false,
      };
    case "ORDER_FULFILLMENT_UPDATED":
      return {
        category: "COMMERCE",
        title: "অর্ডার ডেলিভারি আপডেট · Order fulfillment status updated",
        body: "আপনার অর্ডারের ডেলিভারি অবস্থা হালনাগাদ হয়েছে। · Your order fulfillment status has been updated.",
        urgent: false,
      };
    case "ORDER_REFUNDED":
      return {
        category: "COMMERCE",
        title: "অর্ডার বাতিল ও রিফান্ড (স্যান্ডবক্স) · Sandbox order cancelled & refunded",
        body: "বাতিলকৃত অর্ডারের অর্থ আপনার স্যান্ডবক্স ওয়ালেট লেজারে ফেরত দেওয়া হয়েছে। · Cancelled order funds were returned to your sandbox wallet ledger.",
        urgent: false,
      };
    default:
      return {
        category: "SYSTEM",
        title: "পালিতো বিজ্ঞপ্তি · Palito notification",
        body: "আপনার অ্যাকাউন্টে একটি নতুন আপডেট রয়েছে। · You have a new update in your Palito workspace.",
        urgent: false,
      };
  }
}
