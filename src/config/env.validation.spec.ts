import { envValidationSchema } from './env.validation.js';

const validEnv = {
  MONGO_URI: 'mongodb://localhost:27017/validations',
  DYNAMODB_TABLE: 'validation-audit',
  EXTERNAL_API_URL: 'https://restcountries.com/v3.1',
  EXCHANGE_BASE_CURRENCY: 'USD',
  EXCHANGE_TARGET_CURRENCY: 'COP',
};

describe('envValidationSchema', () => {
  it('applies defaults when optional variables are missing', () => {
    const { error, value } = envValidationSchema.validate(validEnv);

    expect(error).toBeUndefined();
    expect(value).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      DYNAMODB_REGION: 'us-east-1',
      EXTERNAL_API_TIMEOUT_MS: 3000,
      EXTERNAL_API_RETRIES: 2,
    });
  });

  it('reports every missing required variable', () => {
    const { error } = envValidationSchema.validate({}, { abortEarly: false });

    const missing = error?.details.map((detail) => detail.path[0]);
    expect(missing).toEqual(
      expect.arrayContaining([
        'MONGO_URI',
        'DYNAMODB_TABLE',
        'EXTERNAL_API_URL',
      ]),
    );
  });

  it('rejects a MONGO_URI with an invalid scheme', () => {
    const { error } = envValidationSchema.validate({
      ...validEnv,
      MONGO_URI: 'http://localhost:27017',
    });

    expect(error?.details[0].path).toEqual(['MONGO_URI']);
  });
});