import {
  BadGatewayException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditService } from '../audit/audit.service.js';
import { ExchangeRateClient } from '../exchange-rate/exchange-rate.client.js';
import { Validation } from './schemas/validation.schema.js';
import { ValidationsService } from './validations.service.js';

const exchangeRate = {
  provider: 'exchangerate-api.com',
  baseCurrency: 'USD',
  targetCurrency: 'COP',
  rate: 3320.18,
  rateUpdatedAt: new Date('2026-11-18T00:02:31Z'),
  fetchedAt: new Date('2026-11-18T15:00:00Z'),
};

const dto = { name: 'Juan Pérez', documentNumber: '1020304050' };

describe('ValidationsService', () => {
  let service: ValidationsService;
  const validationModel = {
    create: vi.fn(),
    findById: vi.fn(),
    deleteOne: vi.fn(),
  };
  const exchangeRateClient = { getLatestRate: vi.fn() };
  const auditService = { recordValidationCreated: vi.fn() };

  const createdValidation = () => {
    const _id = new Types.ObjectId();
    return {
      _id,
      id: _id.toString(),
      ...dto,
      exchangeRate,
      createdAt: new Date('2026-11-19T02:29:07.822Z'),
    };
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    exchangeRateClient.getLatestRate.mockResolvedValue(exchangeRate);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ValidationsService,
        { provide: getModelToken(Validation.name), useValue: validationModel },
        { provide: ExchangeRateClient, useValue: exchangeRateClient },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = moduleRef.get(ValidationsService);
  });

  it('persists the enriched validation and records the audit event', async () => {
    const created = createdValidation();
    validationModel.create.mockResolvedValue(created);
    auditService.recordValidationCreated.mockResolvedValue(undefined);

    await expect(service.create(dto)).resolves.toBe(created);
    expect(validationModel.create).toHaveBeenCalledWith({
      ...dto,
      exchangeRate,
    });
    expect(auditService.recordValidationCreated).toHaveBeenCalledWith({
      validationId: created.id,
      documentNumber: created.documentNumber,
      occurredAt: created.createdAt,
    });
  });

  it('does not persist when the enrichment fails', async () => {
    exchangeRateClient.getLatestRate.mockRejectedValue(
      new BadGatewayException(),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(validationModel.create).not.toHaveBeenCalled();
    expect(auditService.recordValidationCreated).not.toHaveBeenCalled();
  });

  it('rolls back the validation when the audit event fails', async () => {
    const created = createdValidation();
    validationModel.create.mockResolvedValue(created);
    auditService.recordValidationCreated.mockRejectedValue(new Error('down'));
    validationModel.deleteOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(validationModel.deleteOne).toHaveBeenCalledWith({
      _id: created._id,
    });
  });

  it('still reports 503 when the rollback also fails', async () => {
    validationModel.create.mockResolvedValue(createdValidation());
    auditService.recordValidationCreated.mockRejectedValue(new Error('down'));
    validationModel.deleteOne.mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error('mongo down')),
    });

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('returns the validation when it exists', async () => {
    const id = new Types.ObjectId();
    const found = { id: id.toString(), name: 'Juan Pérez' };
    validationModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(found),
    });

    await expect(service.findById(id)).resolves.toBe(found);
    expect(validationModel.findById).toHaveBeenCalledWith(id);
  });

  it('throws NotFoundException when the validation does not exist', async () => {
    validationModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findById(new Types.ObjectId())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});