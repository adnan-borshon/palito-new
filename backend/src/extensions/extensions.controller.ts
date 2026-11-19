import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { revision } from "../care/care.service.js";
import { Public, type AuthRequest } from "../platform/auth.js";
import {
  AdminUsersPageDto,
  AdvanceFulfillmentDto,
  AiRequestDto,
  AlertsPageDto,
  BindDeviceDto,
  CancelOrderDto,
  ContentPageDto,
  CreateExportDto,
  CreateOrderDto,
  CreateProductDto,
  EmergencyRequestDto,
  IngestTelemetryDto,
  OrdersPageDto,
  ProductsPageDto,
  ProvisionDeviceDto,
  SaveContentDto,
  SetCartItemDto,
} from "./dto.js";
import { ExtensionsService } from "./extensions.service.js";

@Controller()
export class ExtensionsController {
  constructor(
    @Inject(ExtensionsService) private readonly extensions: ExtensionsService,
  ) {}

  // ==================== M8a: Telemetry, Devices, Alerts & Farm Summary ====================

  @Post("devices/provision")
  @HttpCode(200)
  provisionDevice(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: ProvisionDeviceDto,
  ) {
    return this.extensions.provisionDevice(r.principal, key, d);
  }

  @Post("animals/:id/device-bindings")
  @HttpCode(200)
  bindDevice(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: BindDeviceDto,
  ) {
    return this.extensions.bindDevice(r.principal, id, key, d);
  }

  @Delete("device-bindings/:id")
  @HttpCode(200)
  unbindDevice(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
  ) {
    return this.extensions.unbindDevice(r.principal, id, key);
  }

  @Post("devices/:id/telemetry")
  @Public()
  @HttpCode(200)
  ingestTelemetry(
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("x-palito-device-secret") secret: string | undefined,
    @Body() d: IngestTelemetryDto,
  ) {
    return this.extensions.ingestTelemetry(id, secret, d);
  }

  @Get("animals/:id/telemetry")
  animalTelemetry(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.extensions.animalTelemetry(r.principal, id);
  }

  @Get("farms/:id/summary")
  farmSummary(@Req() r: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.farmSummary(r.principal, id);
  }

  @Get("alerts")
  listAlerts(@Req() r: AuthRequest, @Query() q: AlertsPageDto) {
    return this.extensions.listAlerts(r.principal, q);
  }

  @Get("alerts/:id")
  alertDetail(@Req() r: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.alertDetail(r.principal, id);
  }

  @Post("alerts/:id/acknowledgement")
  @HttpCode(200)
  acknowledgeAlert(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
  ) {
    return this.extensions.acknowledgeAlert(
      r.principal,
      id,
      key,
      revision(match),
    );
  }

  // ==================== M8b: Bounded AI Support ====================

  @Post("ai/requests")
  @HttpCode(200)
  createAiRequest(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: AiRequestDto,
  ) {
    return this.extensions.createAiRequest(r.principal, key, d);
  }

  @Get("ai/requests")
  listAiRequests(@Req() r: AuthRequest) {
    return this.extensions.listAiRequests(r.principal);
  }

  // ==================== M8c: Calls & Emergency Triage ====================

  @Post("consultations/:id/call-token")
  @HttpCode(200)
  issueCallToken(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
  ) {
    return this.extensions.issueCallToken(r.principal, id, key);
  }

  @Post("emergency-requests")
  @HttpCode(200)
  createEmergencyRequest(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: EmergencyRequestDto,
  ) {
    return this.extensions.createEmergencyRequest(r.principal, key, d);
  }

  @Get("emergency-requests")
  listEmergencyRequests(@Req() r: AuthRequest) {
    return this.extensions.listEmergencyRequests(r.principal);
  }

  // ==================== M8d: Commerce & Fulfillment ====================

  @Post("admin/products")
  @HttpCode(200)
  createProduct(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateProductDto,
  ) {
    return this.extensions.createProduct(r.principal, key, d);
  }

  @Get("products")
  listProducts(@Query() q: ProductsPageDto) {
    return this.extensions.listProducts(q);
  }

  @Get("products/:id")
  productDetail(@Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.productDetail(id);
  }

  @Get("me/cart")
  getCart(@Req() r: AuthRequest) {
    return this.extensions.getCart(r.principal);
  }

  @Put("me/cart/items/:productId")
  setCartItem(
    @Req() r: AuthRequest,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: SetCartItemDto,
  ) {
    return this.extensions.setCartItem(r.principal, productId, key, d);
  }

  @Post("orders")
  @HttpCode(200)
  createOrder(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateOrderDto,
  ) {
    return this.extensions.createOrder(r.principal, key, d);
  }

  @Get("orders")
  listOrders(@Req() r: AuthRequest, @Query() q: OrdersPageDto) {
    return this.extensions.listOrders(r.principal, q);
  }

  @Get("orders/:id")
  orderDetail(@Req() r: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.orderDetail(r.principal, id);
  }

  @Post("orders/:id/cancellation")
  @HttpCode(200)
  cancelOrder(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: CancelOrderDto,
  ) {
    return this.extensions.cancelOrder(
      r.principal,
      id,
      key,
      revision(match),
      d,
    );
  }

  @Post("orders/:id/fulfillment-events")
  @HttpCode(200)
  advanceFulfillment(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: AdvanceFulfillmentDto,
  ) {
    return this.extensions.advanceFulfillment(
      r.principal,
      id,
      key,
      revision(match),
      d,
    );
  }

  // ==================== M8e: Admin Users, Content & Audited Exports ====================

  @Get("admin/users")
  listAdminUsers(@Req() r: AuthRequest, @Query() q: AdminUsersPageDto) {
    return this.extensions.listAdminUsers(r.principal, q);
  }

  @Post("content")
  @HttpCode(200)
  createContent(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: SaveContentDto,
  ) {
    return this.extensions.createContent(r.principal, key, d);
  }

  @Patch("content/:id")
  updateContent(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: SaveContentDto,
  ) {
    return this.extensions.updateContent(
      r.principal,
      id,
      key,
      revision(match),
      d,
    );
  }

  @Post("content/:id/publication")
  @HttpCode(200)
  publishContent(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
  ) {
    return this.extensions.publishContent(r.principal, id, key, revision(match));
  }

  @Get("content")
  listPublishedContent(@Query() q: ContentPageDto) {
    return this.extensions.listPublishedContent(q);
  }

  @Get("content/:id")
  publishedContentDetail(@Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.publishedContentDetail(id);
  }

  @Get("admin/reports")
  systemReport(@Req() r: AuthRequest) {
    return this.extensions.systemReport(r.principal);
  }

  @Post("admin/exports")
  @HttpCode(200)
  createExport(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateExportDto,
  ) {
    return this.extensions.createExport(r.principal, key, d);
  }

  @Get("admin/exports/:id/download")
  downloadExport(@Req() r: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    return this.extensions.downloadExport(r.principal, id);
  }
}
