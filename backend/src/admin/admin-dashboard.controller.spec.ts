import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;

  const adminDashboardServiceMock = {
    getOverview: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [{ provide: AdminDashboardService, useValue: adminDashboardServiceMock }],
    }).compile();

    controller = module.get(AdminDashboardController);
  });

  it('returns dashboard overview', async () => {
    adminDashboardServiceMock.getOverview.mockResolvedValue({ stats: { totalUsers: 100 } });

    await expect(controller.getOverview()).resolves.toEqual({ stats: { totalUsers: 100 } });
    expect(adminDashboardServiceMock.getOverview).toHaveBeenCalledTimes(1);
  });

  it('propagates dashboard service errors', async () => {
    adminDashboardServiceMock.getOverview.mockRejectedValue(new Error('dashboard unavailable'));

    await expect(controller.getOverview()).rejects.toThrow('dashboard unavailable');
  });
});
