import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
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

describe('ValidationsService', () => {
  let service: ValidationsService;
  const validationModel = {
    create: vi.fn(),
    findById: vi.fn(),
  };
  const exchangeRateClient = { getLatestRate: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ValidationsService,
        { provide: getModelToken(Validation.name), useValue: validationModel },
        { provide: ExchangeRateClient, useValue: exchangeRateClient },
      ],
    }).compile();

    service = moduleRef.get(ValidationsService);
  });

  it('persists a new validation enriched with the exchange rate', async () => {
    const dto = { name: 'Juan Pérez', documentNumber: '1020304050' };
    const created = { id: new Types.ObjectId().toString(), ...dto };
    exchangeRateClient.getLatestRate.mockResolvedValue(exchangeRate);
    validationModel.create.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toBe(created);
    expect(validationModel.create).toHaveBeenCalledWith({
      ...dto,
      exchangeRate,
    });
  });

  it('does not persist when the enrichment fails', async () => {
    exchangeRateClient.getLatestRate.mockRejectedValue(
      new BadGatewayException(),
    );

    await expect(
      service.create({ name: 'Juan Pérez', documentNumber: '1020304050' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(validationModel.create).not.toHaveBeenCalled();
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