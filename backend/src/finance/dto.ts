import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateValuationDto {
  @IsUUID()
  animalId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  amountMinor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  assessedValueMinor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  approvedValueMinor?: string;

  @IsOptional()
  @IsIn(["BDT"])
  currency?: "BDT";

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  notes!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/)
  expiresAt!: string;
}

export class CreateLoanQuoteDto {
  @IsUUID()
  animalId!: string;

  @IsUUID()
  valuationId!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  requestedPrincipalMinor!: string;

  @IsInt()
  @Min(1)
  @Max(24)
  termMonths!: number;
}

export class CreateLoanDto {
  @IsUUID()
  quoteId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  purpose!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  repaymentSource?: string;
}

export class LoanDecisionDto {
  @IsIn(["approve", "reject"])
  decision!: "approve" | "reject";

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note!: string;
}

export class DisburseLoanDto {
  @IsOptional()
  @IsIn(["SANDBOX_SIMULATOR", "MOBILE_MONEY_PENDING"])
  provider?: "SANDBOX_SIMULATOR" | "MOBILE_MONEY_PENDING";
}

export class RepaymentIntentDto {
  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  amountMinor!: string;

  @IsOptional()
  @IsIn(["WALLET", "SANDBOX_SIMULATOR", "MOBILE_MONEY_PENDING"])
  provider?: "WALLET" | "SANDBOX_SIMULATOR" | "MOBILE_MONEY_PENDING";
}

export class CareFeeIntentDto {
  @IsUUID()
  appointmentId!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  amountMinor!: string;

  @IsOptional()
  @IsIn(["SANDBOX_SIMULATOR", "MOBILE_MONEY_PENDING"])
  provider?: "SANDBOX_SIMULATOR" | "MOBILE_MONEY_PENDING";
}

export class GraceDecisionDto {
  @IsUUID()
  installmentId!: string;

  @IsInt()
  @Min(1)
  @Max(90)
  graceDays!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class ProviderWebhookDto {
  @IsIn(["SANDBOX_SIMULATOR", "MOBILE_MONEY_PENDING"])
  provider!: "SANDBOX_SIMULATOR" | "MOBILE_MONEY_PENDING";

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  externalEventId!: string;

  @IsUUID()
  paymentIntentId!: string;

  @IsIn(["CONFIRMED", "SETTLED", "FAILED"])
  status!: "CONFIRMED" | "SETTLED" | "FAILED";

  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  amountMinor!: string;

  @IsIn(["BDT"])
  currency!: "BDT";

  @IsOptional()
  @IsString()
  @MaxLength(300)
  failureReason?: string;
}

export class LoansPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsIn([
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "DISBURSING",
    "ACTIVE",
    "PAID",
    "SETTLED",
    "CANCELLED",
  ])
  status?:
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "DISBURSING"
    | "ACTIVE"
    | "PAID"
    | "SETTLED"
    | "CANCELLED";
}
