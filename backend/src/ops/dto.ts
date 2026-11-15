import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";
import { PageDto } from "../care/dto.js";

export class NotificationPrefsDto {
  @IsBoolean() inAppEnabled!: boolean;
  @IsBoolean() smsEnabled!: boolean;
  @IsBoolean() pushEnabled!: boolean;
  @Equals("notify-v1") consentVersion!: string;
}

export class NotificationsPageDto extends PageDto {
  @IsOptional() @IsIn(["true", "false"]) unreadOnly?: "true" | "false";
}

export class MarkNotificationsReadDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID(undefined, { each: true })
  ids?: string[];

  @IsOptional()
  @IsISO8601({ strict: true })
  readBefore?: string;
}

export class AdherenceDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  localDate!: string;

  @IsIn(["taken", "skipped"])
  status!: "taken" | "skipped";
}

export class AuditEventsPageDto extends PageDto {
  @IsOptional() @IsString() @MaxLength(40) targetKind?: string;
  @IsOptional() @IsUUID() targetId?: string;
}
