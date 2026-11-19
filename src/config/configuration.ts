import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV as string,
  port: Number(process.env.PORT),
}));

export const mongoConfig = registerAs('mongo', () => ({
  uri: process.env.MONGO_URI as string,
}));

export const dynamodbConfig = registerAs('dynamodb', () => ({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.DYNAMODB_REGION as string,
  table: process.env.DYNAMODB_TABLE as string,
}));

export const externalApiConfig = registerAs('externalApi', () => ({
  baseUrl: process.env.EXTERNAL_API_URL as string,
  timeoutMs: Number(process.env.EXTERNAL_API_TIMEOUT_MS),
  retries: Number(process.env.EXTERNAL_API_RETRIES),
}));