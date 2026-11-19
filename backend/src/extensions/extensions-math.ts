import { BadRequestException } from "@nestjs/common";

export interface TelemetryAlertCandidate {
  kind: "HIGH_TEMPERATURE" | "LOW_BATTERY";
  severity: "CRITICAL" | "WARNING";
  title: string;
  summary: string;
  ruleVersion: string;
}

/**
 * Validates sensor event-time window:
 * rejects malformed dates, timestamps >5 minutes in the future, or stale readings >24 hours old.
 */
export function validateTelemetryWindow(
  observedAt: Date,
  now: Date = new Date(),
): void {
  if (!(observedAt instanceof Date) || !Number.isFinite(observedAt.getTime())) {
    throw new BadRequestException("Invalid telemetry observedAt timestamp");
  }
  const maxFutureMs = now.getTime() + 5 * 60_000;
  const minPastMs = now.getTime() - 24 * 3_600_000;
  if (observedAt.getTime() > maxFutureMs) {
    throw new BadRequestException(
      "Telemetry observedAt exceeds allowed future clock skew (+5 minutes)",
    );
  }
  if (observedAt.getTime() < minPastMs) {
    throw new BadRequestException(
      "Telemetry observedAt is older than the 24-hour ingestion window",
    );
  }
}

/**
 * Evaluates conservative reviewed sandbox alert rules with explicit clinical uncertainty
 * and mandatory veterinarian handoff guidance (no autonomous diagnosis or claim decision).
 */
export function evaluateTelemetryRules(input: {
  temperatureC: number;
  heartRateBpm: number;
  batteryPct: number;
}): TelemetryAlertCandidate[] {
  const alerts: TelemetryAlertCandidate[] = [];
  if (input.temperatureC >= 39.5) {
    alerts.push({
      kind: "HIGH_TEMPERATURE",
      severity: "CRITICAL",
      title: "উচ্চ তাপমাত্রা সতর্কতা · Elevated temperature threshold alert",
      summary: `Observed temperature ${input.temperatureC.toFixed(2)}°C (HR ${input.heartRateBpm} bpm) exceeded sandbox rule threshold (39.5°C). Sensor data is advisory only; consult a verified veterinarian for clinical diagnosis.`,
      ruleVersion: "alert-sandbox-v1",
    });
  }
  if (input.batteryPct <= 15) {
    alerts.push({
      kind: "LOW_BATTERY",
      severity: "WARNING",
      title: "ডিভাইস ব্যাটারি কম · Low wearable sensor battery",
      summary: `Wearable collar battery is at ${input.batteryPct}%. Recharge or swap sensor module to avoid telemetry sampling gaps.`,
      ruleVersion: "alert-sandbox-v1",
    });
  }
  return alerts;
}

const HOSTILE_OVERRIDE_PATTERNS =
  /ignore previous instructions|sign prescription|approve loan|settle claim|override admin|grant role/i;

export function sanitizeAiPrompt(promptText: string): string {
  const trimmed = promptText.trim();
  if (!trimmed) {
    throw new BadRequestException("AI promptText must not be empty");
  }
  if (HOSTILE_OVERRIDE_PATTERNS.test(trimmed)) {
    throw new BadRequestException(
      "AI request refused: prompt cannot instruct clinical prescribing, financial approval, or role escalation",
    );
  }
  return trimmed;
}

export function buildBoundedAiGuidance(input: {
  promptText: string;
  animalName: string;
  species: string;
  breed: string;
  locale: "bn" | "en";
  hasMedia: boolean;
}) {
  const sanitizedPrompt = sanitizeAiPrompt(input.promptText);
  const uncertaintyNote =
    input.locale === "bn"
      ? "সতর্কতা: এটি কেবল প্রাথমিক পরামর্শ (স্যান্ডবক্স); চূড়ান্ত রোগ নির্ণয় বা প্রেসক্রিপশনের জন্য নিবন্ধিত পশুচিকিৎসকের পরামর্শ নিন।"
      : "Uncertainty notice: Sandbox triage guidance only. AI never diagnoses, prescribes medicine, or authorizes loans/claims; consult a verified veterinarian.";

  const guidanceText =
    input.locale === "bn"
      ? `${input.animalName} (${input.species}, ${input.breed}) সম্পর্কে আপনার প্রশ্ন ("${sanitizedPrompt.slice(0, 120)}") পর্যালোচিত হয়েছে${input.hasMedia ? " (সংযুক্ত প্রাইভেট ছবি রেফারেন্সসহ)" : ""}। পানির প্রাপ্যতা, খাদ্যের রুচি ও শরীরের তাপমাত্রা পর্যবেক্ষণ করুন এবং পশুচিকিৎসকের অ্যাপয়েন্টমেন্ট নিন।`
      : `Sandbox triage reviewed for ${input.animalName} (${input.species}, ${input.breed})${input.hasMedia ? " with authorized private photo reference" : ""}: monitor hydration, feed intake, and rectal temperature, and escalate to a verified veterinarian consultation if symptoms persist.`;

  return {
    sanitizedPrompt,
    promptVersion: "ai-sandbox-v1",
    modelId: "sandbox-vet-triage-v1",
    guidanceText,
    uncertaintyNote,
    suggestVetHandoff: true,
  };
}
