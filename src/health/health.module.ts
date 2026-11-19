import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuditModule } from '../audit/audit.module.js';
import { HealthController } from './health.controller.js';
import { DynamoDbHealthIndicator } from './indicators/dynamodb.health.js';

@Module({
  imports: [TerminusModule, AuditModule],
  controllers: [HealthController],
  providers: [DynamoDbHealthIndicator],
})
export class HealthModule {}