import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { DynamoDbHealthIndicator } from './indicators/dynamodb.health.js';

const DEPENDENCY_TIMEOUT_MS = 1500;

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly dynamodb: DynamoDbHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe: the process is running' })
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe: MongoDB and DynamoDB are reachable',
  })
  ready() {
    return this.health.check([
      () =>
        this.mongoose.pingCheck('mongodb').withTimeout(DEPENDENCY_TIMEOUT_MS),
      () =>
        this.dynamodb.tableCheck('dynamodb').withTimeout(DEPENDENCY_TIMEOUT_MS),
    ]);
  }
}