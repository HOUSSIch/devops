import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/prisma/prisma.service';
import { AnalysesService } from './analyses.service';

describe('AnalysesService', () => {
  let service: AnalysesService;

  const prismaMock = {
    analysis: {
      findMany: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AnalysesService);
  });

  it('maps analyses with normalized concerns and user fields', async () => {
    prismaMock.analysis.findMany.mockResolvedValue([
      {
        id: 'a1',
        skinType: 'Dry',
        healthScore: 82,
        concerns: null,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        imageUrl: 'https://example.com/a1.jpg',
        user: { username: 'alice', email: 'alice@example.com' },
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 'a1',
        skinType: 'Dry',
        healthScore: 82,
        concerns: [],
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        imageUrl: 'https://example.com/a1.jpg',
        status: 'completed',
        user: {
          username: 'alice',
          email: 'alice@example.com',
          avatar: null,
        },
      },
    ]);
  });

  it('exports CSV rows with quoted values', async () => {
    prismaMock.analysis.findMany.mockResolvedValue([
      {
        id: 'a1',
        skinType: 'Dry',
        healthScore: 82,
        concerns: [{ label: 'Dryness' }],
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        user: { username: 'alice', email: 'alice@example.com' },
      },
    ]);

    await expect(service.exportCsv()).resolves.toContain('"ID","User","Date"');
    await expect(service.exportCsv()).resolves.toContain('"a1","alice"');
  });
});
