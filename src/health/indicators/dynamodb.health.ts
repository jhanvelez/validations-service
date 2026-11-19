import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../audit/audit.constants.js';
import { dynamodbConfig } from '../../config/configuration.js';

@Injectable()
export class DynamoDbHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly client: DynamoDBDocumentClient,
    @Inject(dynamodbConfig.KEY)
    private readonly config: ConfigType<typeof dynamodbConfig>,
  ) {}

  tableCheck<const TKey extends string>(key: TKey) {
    return this.healthIndicatorService
      .check(key)
      .attempt(async ({ signal }) => {
        await this.client.send(
          new DescribeTableCommand({ TableName: this.config.table }),
          { abortSignal: signal },
        );
      })
      .withData({ table: this.config.table });
  }
}