import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { dynamodbConfig } from '../config/configuration.js';
import {
  AUDIT_EVENT_TYPES,
  DYNAMODB_DOCUMENT_CLIENT,
} from './audit.constants.js';
import type { AuditItem, ValidationCreatedEvent } from './audit.types.js';

@Injectable()
export class AuditService {
  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly client: DynamoDBDocumentClient,
    @Inject(dynamodbConfig.KEY)
    private readonly config: ConfigType<typeof dynamodbConfig>,
  ) {}

  async recordValidationCreated(event: ValidationCreatedEvent): Promise<void> {
    const occurredAt = event.occurredAt.toISOString();

    const item: AuditItem = {
      pk: `DOC#${event.documentNumber}`,
      sk: `${occurredAt}#${event.validationId}`,
      eventType: AUDIT_EVENT_TYPES.VALIDATION_CREATED,
      validationId: event.validationId,
      documentNumber: event.documentNumber,
      occurredAt,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.config.table,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk)',
      }),
    );
  }
}