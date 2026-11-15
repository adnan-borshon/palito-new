import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Logger } from 'pino';

const errors: Record<number, [string, string]> = {
  400: ['VALIDATION', 'Invalid request'], 401: ['UNAUTHENTICATED', 'Authentication required'],
  403: ['FORBIDDEN', 'Request not permitted'], 404: ['NOT_FOUND', 'Resource not found'],
  409: ['CONFLICT', 'Resource conflict'], 413: ['PAYLOAD_TOO_LARGE', 'Request body too large'],
  415: ['UNSUPPORTED_MEDIA_TYPE', 'Unsupported request content type'],
  429: ['RATE_LIMITED', 'Too many requests'], 503: ['DEPENDENCY_UNAVAILABLE', 'Service not ready'],
};
export type CorrelatedRequest = Request & { requestId: string };
export function sendError(response: Response, status: number, requestId: string): void {
  const [code, message] = errors[status] ?? ['INTERNAL_ERROR', 'Unexpected server error'];
  response.status(status).json({ error: { code, message, requestId } });
}

@Catch()
export class SafeExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<CorrelatedRequest>();
    // Body-parser errors expose a numeric status but their message/body must never be echoed.
    const rawStatus = exception instanceof HttpException ? exception.getStatus()
      : (exception as { status?: unknown } | null)?.status;
    const prismaCode=(exception as {code?:string}|null)?.code;
    let status = prismaCode==='P2002'||prismaCode==='P2003' ? 409 : prismaCode==='P2025' ? 404 : 500;
    if (typeof rawStatus === 'number' && Number.isInteger(rawStatus)) {
      if ([400, 413, 415].includes(rawStatus) || (exception instanceof HttpException && rawStatus >= 400 && rawStatus <= 599)) status = rawStatus;
    }
    if (status >= 500) this.logger.error({ event: 'request_failed', requestId: request.requestId, status });
    sendError(response, status, request.requestId);
  }
}
