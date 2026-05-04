import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  let service: RemindersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    reminder: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RemindersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(RemindersService);
  });

  it('rejects missing authenticated user id', async () => {
    await expect(service.getUserByKeycloakId('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects missing database user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserByKeycloakId('kc-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('normalizes reminder days in getMyReminders', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.findMany.mockResolvedValue([
      { id: 'r1', days: null },
      { id: 'r2', days: ['mon'] },
    ]);

    await expect(service.getMyReminders('kc-1')).resolves.toEqual([
      { id: 'r1', days: [] },
      { id: 'r2', days: ['mon'] },
    ]);
  });

  it('validates reminder creation input', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(
      service.createReminder('kc-1', {
        type: 'morning',
        time: '08:00',
        title: ' ',
        days: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a reminder', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.create.mockResolvedValue({ id: 'r1', days: ['mon'] });

    await expect(
      service.createReminder('kc-1', {
        type: 'morning',
        time: '08:00',
        title: 'Moisturize',
        description: 'Apply cream',
        enabled: false,
        days: ['mon'],
      }),
    ).resolves.toEqual({ id: 'r1', days: ['mon'] });
  });

  it('rejects updating reminders owned by another user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.findUnique.mockResolvedValue({ id: 'r1', userId: 'other' });

    await expect(
      service.updateReminder('kc-1', 'r1', { title: 'Update' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates a reminder', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
    prismaMock.reminder.update.mockResolvedValue({ id: 'r1', days: ['tue'] });

    await expect(
      service.updateReminder('kc-1', 'r1', {
        title: '  Updated  ',
        description: '  New note  ',
        days: ['tue'],
      }),
    ).resolves.toEqual({ id: 'r1', days: ['tue'] });
  });

  it('rejects deletion of a missing reminder', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.findUnique.mockResolvedValue(null);

    await expect(service.deleteReminder('kc-1', 'r1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deletes a reminder', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.reminder.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
    prismaMock.reminder.delete.mockResolvedValue({ id: 'r1' });

    await expect(service.deleteReminder('kc-1', 'r1')).resolves.toEqual({
      success: true,
    });
  });
});
