import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/prisma/prisma.service';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;

  const prismaMock = {
    user: {
      count: jest.fn(),
    },
    analysis: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-04T12:00:00.000Z'));
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AdminDashboardService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds overview stats and recent activity', async () => {
    prismaMock.user.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(0);
    prismaMock.analysis.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(8);
    prismaMock.analysis.findMany.mockResolvedValue([
      {
        id: 'a1',
        createdAt: new Date('2026-05-03T09:00:00.000Z'),
        user: { username: 'alice', email: 'alice@example.com' },
      },
    ]);

    await expect(service.getOverview()).resolves.toEqual({
      stats: {
        totalUsers: 10,
        activeUsers: 4,
        analysesToday: 2,
        revenue: 30,
        totalUsersChange: '+100.0%',
        activeUsersChange: '-60.0%',
        analysesTodayChange: '-75.0%',
        revenueChange: '+100.0%',
      },
      recentActivity: [
        {
          id: 'a1',
          user: 'alice',
          action: 'Completed skin analysis',
          time: new Date('2026-05-03T09:00:00.000Z'),
          status: 'completed',
        },
      ],
    });
  });
});
