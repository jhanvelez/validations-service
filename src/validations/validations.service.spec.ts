import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Validation } from './schemas/validation.schema.js';
import { ValidationsService } from './validations.service.js';

describe('ValidationsService', () => {
  let service: ValidationsService;
  const validationModel = {
    create: vi.fn(),
    findById: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ValidationsService,
        { provide: getModelToken(Validation.name), useValue: validationModel },
      ],
    }).compile();

    service = moduleRef.get(ValidationsService);
  });

  it('persists a new validation', async () => {
    const dto = { name: 'Juan Pérez', documentNumber: '1020304050' };
    const created = { id: new Types.ObjectId().toString(), ...dto };
    validationModel.create.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toBe(created);
    expect(validationModel.create).toHaveBeenCalledWith(dto);
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