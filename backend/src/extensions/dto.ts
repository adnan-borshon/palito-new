import { Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class ProvisionDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9._-]+$/)
  serialNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  firmwareVersion?: string;
}

export class BindDeviceDto {
  @IsUUID()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  provisioningSecret!: string;
}

export class IngestTelemetryDto {
  @IsInt()
  @Min(1)
  sessionEpoch!: number;

  @IsInt()
  @Min(1)
  sequenceNumber!: number;

  @IsNumber()
  @Min(25)
  @Max(48)
  temperatureC!: number;

  @IsInt()
  @Min(10)
  @Max(300)
  heartRateBpm!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  activityIndex!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  batteryPct!: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/)
  observedAt!: string;
}

export class AlertsPageDto {
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
  @IsIn(["OPEN", "ACKNOWLEDGED", "ESCALATED"])
  status?: "OPEN" | "ACKNOWLEDGED" | "ESCALATED";
}

export class AiRequestDto {
  @IsUUID()
  animalId!: string;

  @IsIn(["TEXT", "VOICE", "PHOTO"])
  modality!: "TEXT" | "VOICE" | "PHOTO";

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  promptText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  transcriptText?: string;

  @IsOptional()
  @IsBoolean()
  transcriptConfirmed?: boolean;

  @IsOptional()
  @IsUUID()
  mediaFileId?: string;

  @IsOptional()
  @IsIn(["bn", "en"])
  locale?: "bn" | "en";

  @IsOptional()
  @IsBoolean()
  simulateOutage?: boolean;
}

export class EmergencyRequestDto {
  @IsUUID()
  animalId!: string;

  @IsOptional()
  @IsUUID()
  alertId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  symptoms!: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[A-Za-z0-9._-]+$/)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  nameBn!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  nameEn!: string;

  @IsIn(["MEDICINE", "SUPPLEMENT", "FEED", "EQUIPMENT"])
  category!: "MEDICINE" | "SUPPLEMENT" | "FEED" | "EQUIPMENT";

  @IsBoolean()
  requiresPrescription!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  matchedMedicineName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxPerPrescriptionQty?: number;

  @IsString()
  @Matches(/^[1-9]\d{0,17}$/)
  unitPriceMinor!: string;

  @IsInt()
  @Min(0)
  @Max(100000)
  stockQuantity!: number;
}

export class ProductsPageDto {
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
  @IsIn(["MEDICINE", "SUPPLEMENT", "FEED", "EQUIPMENT"])
  category?: "MEDICINE" | "SUPPLEMENT" | "FEED" | "EQUIPMENT";

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;
}

export class SetCartItemDto {
  @IsInt()
  @Min(0)
  @Max(100)
  quantity!: number;

  @IsOptional()
  @IsUUID()
  prescriptionId?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shippingAddress!: string;

  @IsOptional()
  @IsIn(["WALLET", "SANDBOX_SIMULATOR"])
  provider?: "WALLET" | "SANDBOX_SIMULATOR";
}

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class AdvanceFulfillmentDto {
  @IsIn(["PACKED", "SHIPPED", "DELIVERED"])
  status!: "PACKED" | "SHIPPED" | "DELIVERED";

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note!: string;
}

export class OrdersPageDto {
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
    "PAYMENT_PENDING",
    "PAID",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ])
  status?:
    | "PAYMENT_PENDING"
    | "PAID"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
}

export class SaveContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleBn!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleEn!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  bodyBn!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  bodyEn!: string;

  @IsIn(["HEALTH", "NUTRITION", "FINANCE", "INSURANCE", "IOT"])
  category!: "HEALTH" | "NUTRITION" | "FINANCE" | "INSURANCE" | "IOT";
}

export class ContentPageDto {
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
  @IsIn(["HEALTH", "NUTRITION", "FINANCE", "INSURANCE", "IOT"])
  category?: "HEALTH" | "NUTRITION" | "FINANCE" | "INSURANCE" | "IOT";
}

export class CreateExportDto {
  @IsIn(["SUMMARY", "LEDGER_AUDIT", "CLINICAL_COUNTS"])
  reportKind!: "SUMMARY" | "LEDGER_AUDIT" | "CLINICAL_COUNTS";

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fromDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  toDate?: string;
}

export class AdminUsersPageDto {
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
  @IsIn(["PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"])
  status?: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
}
