import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Req,
  Res,
  Headers,
  ParseUUIDPipe,
} from "@nestjs/common";
import type { Response } from "express";
import type { AuthRequest } from "../platform/auth.js";
import { CareService, revision } from "./care.service.js";
import {
  AmendmentDto,
  AnimalDto,
  AnimalEditDto,
  BookingDto,
  CompletionDto,
  DecisionDto,
  FarmDto,
  FileCompletionDto,
  NoteDto,
  PageDto,
  ReasonDto,
  ReminderDto,
  RescheduleDto,
  SlotsDto,
  UploadDto,
  VetProfileDto,
  VetsPageDto,
} from "./dto.js";
@Controller()
export class CareController {
  constructor(private readonly care: CareService) {}
  @Get("farms") farms(@Req() r: AuthRequest, @Query() q: PageDto) {
    return this.care.farms(r.principal, q);
  }
  @Post("farms") farm(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: FarmDto,
  ) {
    return this.care.createFarm(r.principal, k, d);
  }
  @Patch("farms/:id") editFarm(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: FarmDto,
  ) {
    return this.care.editFarm(r.principal, id, k, revision(v), d);
  }
  @Get("animals") animals(@Req() r: AuthRequest, @Query() q: PageDto) {
    return this.care.animals(r.principal, q);
  }
  @Post("animals") animal(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: AnimalDto,
  ) {
    return this.care.createAnimal(r.principal, k, d);
  }
  @Get("animals/:id/passport") passport(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.care.passport(r.principal, id);
  }
  @Get("animals/:id/records") records(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() q: PageDto,
  ) {
    return this.care.records(r.principal, id, q);
  }
  @Get("animals/:id/files") files(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() q: PageDto,
  ) {
    return this.care.files(r.principal, id, q);
  }
  @Patch("animals/:id") editAnimal(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: AnimalEditDto,
  ) {
    return this.care.editAnimal(r.principal, id, k, revision(v), d);
  }
  @Post("animals/:id/archive") archive(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: ReasonDto,
  ) {
    return this.care.archive(r.principal, id, k, revision(v), d.reason);
  }
  @Post("animals/:id/observations") observation(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: NoteDto,
  ) {
    return this.care.observation(r.principal, id, k, d.note);
  }
  @Get("vets") vets(@Query() q: VetsPageDto) {
    return this.care.vets(q);
  }
  @Get("vets/me/availability") schedule(@Req() r: AuthRequest) {
    return this.care.schedule(r.principal);
  }
  @Put("vets/me/availability") availability(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: SlotsDto,
  ) {
    return this.care.availability(r.principal, k, revision(v), d.startsAt);
  }
  @Put("vets/me/profile") profile(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: VetProfileDto,
  ) {
    return this.care.profile(r.principal, k, revision(v), d);
  }
  @Get("vets/:id") professional(@Param("id", ParseUUIDPipe) id: string) {
    return this.care.professional(id);
  }
  @Get("vets/:id/slots") slots(@Param("id", ParseUUIDPipe) id: string) {
    return this.care.slots(id);
  }
  @Get("appointments") appointments(
    @Req() r: AuthRequest,
    @Query() q: PageDto,
  ) {
    return this.care.appointments(r.principal, q);
  }
  @Get("appointments/:id") detail(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.care.appointmentDetail(r.principal, id);
  }
  @Post("appointments") book(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: BookingDto,
  ) {
    return this.care.book(r.principal, k, d);
  }
  @Post("appointments/:id/decision") decision(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: DecisionDto,
  ) {
    return this.care.decision(r.principal, id, k, revision(v), d);
  }
  @Post("appointments/:id/cancellation") cancel(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: ReasonDto,
  ) {
    return this.care.cancel(r.principal, id, k, revision(v), d.reason);
  }
  @Post("appointments/:id/reschedule") reschedule(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: RescheduleDto,
  ) {
    return this.care.reschedule(r.principal, id, k, revision(v), d.slotId);
  }
  @Post("appointments/:id/consent-withdrawal") withdraw(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
  ) {
    return this.care.withdraw(r.principal, id, k);
  }
  @Post("appointments/:id/consultations") start(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
  ) {
    return this.care.start(r.principal, id, k, revision(v));
  }
  @Post("consultations/:id/completion") complete(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: CompletionDto,
  ) {
    return this.care.complete(r.principal, id, k, revision(v), d);
  }
  @Get("prescriptions") prescriptions(@Req() r: AuthRequest, @Query() q: PageDto) {
    return this.care.prescriptions(r.principal, q);
  }
  @Get("prescriptions/:id") prescription(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.care.prescription(r.principal, id);
  }
  @Post("records/:id/amendments") amend(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: AmendmentDto,
  ) {
    return this.care.amend(r.principal, id, k, d);
  }
  @Get("reminders") reminders(@Req() r: AuthRequest, @Query() q: PageDto) {
    return this.care.reminders(r.principal, q);
  }
  @Patch("reminders/:id") reminder(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: ReminderDto,
  ) {
    return this.care.reminder(r.principal, id, k, revision(v), d.enabled);
  }
  @Post("files/uploads") upload(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: UploadDto,
  ) {
    return this.care.upload(r.principal, k, d);
  }
  @Put("files/:id/content") content(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("content-type") type: string,
  ) {
    return this.care.content(r.principal, id, type, r.body);
  }
  @Post("files/:id/completion") fileComplete(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: FileCompletionDto,
  ) {
    return this.care.fileComplete(r.principal, id, k, d.sha256);
  }
  @Get("files/:id") fileInfo(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.care.fileInfo(r.principal, id);
  }
  @Get("files/:id/download") async download(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const bytes = await this.care.download(r.principal, id);
    response.setHeader("Content-Type", "image/png");
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="palito-${id}.png"`,
    );
    response.send(bytes);
  }
}
