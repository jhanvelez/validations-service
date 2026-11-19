import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Test } from '@nestjs/testing';
import { dynamodbConfig } from '../config/configuration.js';
import { DYNAMODB_DOCUMENT_CLIENT } from './audit.constants.js';
import { AuditService } from './audit.service.js';

describe('AuditService', () => {
  let service: AuditService;
  const client = { send: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: DYNAMODB_DOCUMENT_CLIENT, useValue: client },
        {
          provide: dynamodbConfig.KEY,
          useValue: { table: 'validation-audit', region: 'us-east-1' },
        },
      ],
    }).compile();

    service = moduleRef.get(AuditService);
  });

  it('writes the event keyed by document and date', async () => {
    client.send.mockResolvedValue({});

    await service.recordValidationCreated({
      validationId: '6afe5ef34add1ee527b4ce7b',
      documentNumber: '1020304050',
      occurredAt: new Date('2026-11-19T02:29:07.822Z'),
    });

    const command = client.send.mock.calls[0][0] as PutCommand;
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input).toEqual({
      TableName: 'validation-audit',
      Item: {
        pk: 'DOC#1020304050',
        sk: '2026-11-19T02:29:07.822Z#6afe5ef34add1ee527b4ce7b',
        eventType: 'VALIDATION_CREATED',
        validationId: '6afe5ef34add1ee527b4ce7b',
        documentNumber: '1020304050',
        occurredAt: '2026-11-19T02:29:07.822Z',
      },
      ConditionExpression: 'attribute_not_exists(pk)',
    });
  });

  it('propagates DynamoDB failures to the caller', async () => {
    client.send.mockRejectedValue(new Error('ResourceNotFoundException'));

    await expect(
      service.recordValidationCreated({
        validationId: '6afe5ef34add1ee527b4ce7b',
        documentNumber: '1020304050',
        occurredAt: new Date(),
      }),
    ).rejects.toThrow('ResourceNotFoundException');
  });
});