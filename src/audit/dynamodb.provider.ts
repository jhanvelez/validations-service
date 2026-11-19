import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { dynamodbConfig } from '../config/configuration.js';
import { DYNAMODB_DOCUMENT_CLIENT } from './audit.constants.js';

export const dynamoDbDocumentClientProvider: Provider = {
  provide: DYNAMODB_DOCUMENT_CLIENT,
  inject: [dynamodbConfig.KEY],
  useFactory: (config: ConfigType<typeof dynamodbConfig>) =>
    DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: config.region,
        endpoint: config.endpoint,
      }),
    ),
};