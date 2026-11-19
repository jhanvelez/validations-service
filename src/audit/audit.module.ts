import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { DYNAMODB_DOCUMENT_CLIENT } from './audit.constants.js';
import { AuditService } from './audit.service.js';
import { dynamoDbDocumentClientProvider } from './dynamodb.provider.js';

@Module({
  providers: [dynamoDbDocumentClientProvider, AuditService],
  exports: [AuditService],
})
export class AuditModule implements OnApplicationShutdown {
  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly client: DynamoDBDocumentClient,
  ) {}

  onApplicationShutdown(): void {
    this.client.destroy();
  }
}