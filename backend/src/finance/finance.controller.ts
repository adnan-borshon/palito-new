import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Public, type AuthRequest } from "../platform/auth.js";
import { revision } from "../care/care.service.js";
import {
  CareFeeIntentDto,
  CreateLoanDto,
  CreateLoanQuoteDto,
  CreateValuationDto,
  DisburseLoanDto,
  GraceDecisionDto,
  LoanDecisionDto,
  LoansPageDto,
  ProviderWebhookDto,
  RepaymentIntentDto,
} from "./dto.js";
import { FinanceService } from "./finance.service.js";

@Controller()
export class FinanceController {
  constructor(
    @Inject(FinanceService) private readonly finance: FinanceService,
  ) {}

  @Post("valuations")
  @HttpCode(200)
  createValuation(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateValuationDto,
  ) {
    return this.finance.createValuation(r.principal, key, d);
  }

  @Post("valuations/:id/approve")
  @HttpCode(200)
  approveValuation(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
  ) {
    return this.finance.approveValuation(r.principal, id, key, revision(match));
  }

  @Get("animals/:id/valuations")
  listValuations(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.listValuations(r.principal, id);
  }

  @Get("animals/:id/collateral-eligibility")
  collateralEligibility(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.collateralEligibility(r.principal, id);
  }

  @Get("animals/:id/collateral-risk")
  collateralRiskSummary(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.collateralRiskSummary(r.principal, id);
  }

  @Post("loans/quotes")
  @HttpCode(200)
  createQuote(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateLoanQuoteDto,
  ) {
    return this.finance.createQuote(r.principal, key, d);
  }

  @Post("loans")
  @HttpCode(200)
  createLoan(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CreateLoanDto,
  ) {
    return this.finance.createLoan(r.principal, key, d);
  }

  @Get("loans")
  listLoans(@Req() r: AuthRequest, @Query() q: LoansPageDto) {
    return this.finance.listLoans(r.principal, q);
  }

  @Get("loans/:id")
  loanDetail(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.loanDetail(r.principal, id);
  }

  @Get("loans/:id/installments")
  listInstallments(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.listInstallments(r.principal, id);
  }

  @Post("loans/:id/decision")
  @HttpCode(200)
  decideLoan(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: LoanDecisionDto,
  ) {
    return this.finance.decideLoan(r.principal, id, key, revision(match), d);
  }

  @Post("loans/:id/disburse")
  @HttpCode(200)
  disburseLoan(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: DisburseLoanDto,
  ) {
    return this.finance.disburseLoan(r.principal, id, key, revision(match), d);
  }

  @Post("loans/:id/repayment-intents")
  @HttpCode(200)
  createRepaymentIntent(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: RepaymentIntentDto,
  ) {
    return this.finance.createRepaymentIntent(r.principal, id, key, d);
  }

  @Post("loans/:id/grace")
  @HttpCode(200)
  grantGrace(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Headers("if-match") match: string | undefined,
    @Body() d: GraceDecisionDto,
  ) {
    return this.finance.grantGrace(r.principal, id, key, revision(match), d);
  }

  @Post("payments/care-fee-intents")
  @HttpCode(200)
  createCareFeeIntent(
    @Req() r: AuthRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() d: CareFeeIntentDto,
  ) {
    return this.finance.createCareFeeIntent(r.principal, key, d);
  }

  @Get("me/wallet")
  wallet(@Req() r: AuthRequest) {
    return this.finance.wallet(r.principal);
  }

  @Get("payments/:id")
  paymentDetail(
    @Req() r: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.paymentDetail(r.principal, id);
  }

  @Post("webhooks/payments/sandbox")
  @Public()
  @HttpCode(200)
  handleWebhook(
    @Headers("x-palito-signature") signature: string | undefined,
    @Body() d: ProviderWebhookDto,
  ) {
    return this.finance.handleWebhook(signature, d);
  }

  @Get("admin/ledger/reconciliation")
  reconcileLedger(@Req() r: AuthRequest) {
    return this.finance.reconcileLedger(r.principal);
  }
}
