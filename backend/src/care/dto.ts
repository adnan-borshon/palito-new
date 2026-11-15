import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
export class PageDto {
  @IsOptional() @IsString() @MaxLength(200) cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
}
export class FarmDto {
  @IsString() @Length(1, 120) @Matches(/\S/) name!: string;
  @IsString() @Length(1, 120) @Matches(/\S/) district!: string;
  @IsString() @Length(1, 500) @Matches(/\S/) address!: string;
  @IsString() @Matches(/^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/) areaAcres!: string;
}
export class AnimalDto {
  @IsUUID() farmId!: string;
  @IsString() @Length(1, 120) @Matches(/\S/) name!: string;
  @IsIn(["cattle", "buffalo", "goat", "sheep"]) species!: string;
  @IsString() @Length(1, 120) @Matches(/\S/) breed!: string;
  @IsIn(["female", "male", "unknown"]) sex!: string;
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) birthDate!: string;
  @IsString() @Matches(/^(?:0|[1-9]\d{0,4})(?:\.\d{1,3})?$/) weightKg!: string;
  @IsString() @Matches(/^(?:0|[1-9]\d{0,18})$/) estimateMinor!: string;
  @IsOptional()
  @IsString()
  @Length(1, 80)
  @Matches(/^[A-Za-z0-9_-]+$/)
  tag?: string;
}
export class AnimalEditDto {
  @IsString() @Length(1, 120) @Matches(/\S/) name!: string;
  @IsString() @Length(1, 120) @Matches(/\S/) breed!: string;
  @IsString() @Matches(/^(?:0|[1-9]\d{0,4})(?:\.\d{1,3})?$/) weightKg!: string;
  @IsString() @Matches(/^(?:0|[1-9]\d{0,18})$/) estimateMinor!: string;
  @IsOptional() @IsUUID() photoFileId?: string;
}
export class NoteDto {
  @IsString() @Length(1, 4000) @Matches(/\S/) note!: string;
}
export class ReasonDto {
  @IsString() @Length(1, 1000) @Matches(/\S/) reason!: string;
}
export class SlotsDto {
  @IsArray()
  @ArrayMaxSize(64)
  @IsISO8601({ strict: true }, { each: true })
  startsAt!: string[];
}
export class BookingDto {
  @IsUUID() animalId!: string;
  @IsUUID() slotId!: string;
  @IsIn(["visit", "video"]) mode!: "visit" | "video";
  @IsString() @Length(1, 2000) @Matches(/\S/) reason!: string;
  @Equals(true) consent!: boolean;
  @Equals("care-v1") consentVersion!: string;
}
export class DecisionDto {
  @IsIn(["accept", "reject"]) decision!: "accept" | "reject";
  @IsString() @Length(1, 1000) @Matches(/\S/) note!: string;
}
export class RescheduleDto {
  @IsUUID() slotId!: string;
  @Equals(true) consent!: boolean;
}
export class MedicineDto {
  @IsString() @Length(1, 200) @Matches(/\S/) name!: string;
  @IsString() @Length(1, 200) @Matches(/\S/) dose!: string;
  @IsString() @Length(1, 200) @Matches(/\S/) frequency!: string;
  @IsInt() @Min(1) @Max(365) days!: number;
}
export class CompletionDto {
  @IsOptional() @IsIn(["checkup", "vaccination", "treatment"]) kind?: string;
  @IsString() @Length(1, 4000) @Matches(/\S/) diagnosis!: string;
  @IsString() @Length(1, 4000) @Matches(/\S/) advice!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MedicineDto)
  medicines!: MedicineDto[];
  @IsOptional() @IsISO8601({ strict: true }) followUpAt?: string;
}
export class AmendmentDto extends NoteDto {
  @IsString() @Length(1, 1000) @Matches(/\S/) reason!: string;
}
export class ReminderDto {
  @IsBoolean() enabled!: boolean;
}
export class UploadDto {
  @IsUUID() animalId!: string;
  @IsIn(["animal-photo", "clinical-evidence"]) purpose!:
    "animal-photo" | "clinical-evidence";
  @IsIn(["image/png", "image/jpeg"]) contentType!: "image/png" | "image/jpeg";
  @IsInt() @Min(1) @Max(1048576) sizeBytes!: number;
}
export class FileCompletionDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) sha256!: string;
}

export class VetProfileDto {
  @IsString() @Length(1, 120) @Matches(/\S/) district!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsIn(["cattle", "goat", "buffalo", "sheep"], { each: true })
  species!: string[];
  @IsString() @Length(1, 1000) @Matches(/\S/) bio!: string;
}
export class VetsPageDto extends PageDto {
  @IsOptional() @IsString() @MaxLength(120) search?: string;
  @IsOptional() @IsString() @MaxLength(120) district?: string;
  @IsOptional() @IsIn(["cattle", "goat", "buffalo", "sheep"]) species?: string;
}
