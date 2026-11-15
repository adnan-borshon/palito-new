import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { AuthRequest } from "../platform/auth.js";
import { revision } from "../care/care.service.js";
import { PageDto } from "../care/dto.js";
import {
  AdherenceDto,
  AuditEventsPageDto,
  MarkNotificationsReadDto,
  NotificationPrefsDto,
  NotificationsPageDto,
} from "./dto.js";
import { OpsService } from "./ops.service.js";

@Controller()
export class OpsController {
  constructor(private readonly ops: OpsService) {}

  @Get("me/notification-preferences")
  getPreferences(@Req() r: AuthRequest) {
    return this.ops.getPreferences(r.principal);
  }

  @Patch("me/notification-preferences")
  updatePreferences(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Headers("if-match") v: string | undefined,
    @Body() d: NotificationPrefsDto,
  ) {
    return this.ops.updatePreferences(r.principal, k, revision(v), d);
  }

  @Get("notifications")
  notifications(@Req() r: AuthRequest, @Query() q: NotificationsPageDto) {
    return this.ops.listNotifications(r.principal, q);
  }

  @Post("notifications/read")
  markRead(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: MarkNotificationsReadDto,
  ) {
    return this.ops.markRead(r.principal, k, d);
  }

  @Post("reminders/:id/adherence-events")
  recordAdherence(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
    @Body() d: AdherenceDto,
  ) {
    return this.ops.recordAdherence(r.principal, id, k, d);
  }

  @Get("admin/system-health")
  systemHealth(@Req() r: AuthRequest) {
    return this.ops.systemHealth(r.principal);
  }

  @Get("admin/outbox/dead-letter")
  deadLetters(@Req() r: AuthRequest, @Query() q: PageDto) {
    return this.ops.deadLetters(r.principal, q);
  }

  @Post("admin/outbox/:id/retry")
  retryDeadLetter(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") k: string | undefined,
  ) {
    return this.ops.retryDeadLetter(r.principal, id, k);
  }

  @Get("admin/audit-events")
  auditEvents(@Req() r: AuthRequest, @Query() q: AuditEventsPageDto) {
    return this.ops.auditEvents(r.principal, q);
  }
}
