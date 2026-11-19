import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  MONGO_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  DYNAMODB_ENDPOINT: Joi.string().uri({ scheme: ['http', 'https'] }),
  DYNAMODB_REGION: Joi.string().default('us-east-1'),
  DYNAMODB_TABLE: Joi.string().required(),
  EXTERNAL_API_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  EXTERNAL_API_TIMEOUT_MS: Joi.number().integer().min(100).default(3000),
  EXTERNAL_API_RETRIES: Joi.number().integer().min(0).max(5).default(2),
    EXCHANGE_BASE_CURRENCY: Joi.string().length(3).uppercase().default('USD'),
  EXCHANGE_TARGET_CURRENCY: Joi.string().length(3).uppercase().default('COP'),
});