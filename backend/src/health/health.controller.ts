import { Controller, Get, Inject, ServiceUnavailableException, type BeforeApplicationShutdown } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../platform/auth.js';
import { DatabaseService } from '../platform/database.js';

class HealthStatusDto {
  @ApiProperty({ enum: ['ok', 'ready'] })
  status!: 'ok' | 'ready';
}

@ApiTags('operations')
@Controller('health')
export class HealthController implements BeforeApplicationShutdown {
  private draining = false;
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}
  beginShutdown(): void { this.draining = true; }
  beforeApplicationShutdown(): void { this.beginShutdown(); }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Process liveness; no database dependency' })
  @ApiResponse({ status: 200, description: 'Process is alive', type: HealthStatusDto })
  live() { return { status: 'ok' }; }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness; bounded PostgreSQL SELECT 1 and not draining' })
  @ApiResponse({ status: 200, description: 'Ready', type: HealthStatusDto })
  @ApiResponse({ status: 503, description: 'Database unavailable or shutting down' })
  async ready() {
    if (this.draining) throw new ServiceUnavailableException();
    try { await this.database.ping(); } catch { throw new ServiceUnavailableException(); }
    return { status: 'ready' };
  }
}
