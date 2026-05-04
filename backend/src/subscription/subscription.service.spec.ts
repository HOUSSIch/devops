import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/prisma/prisma.service';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const prismaMock = {
    user: {
      update: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(SubscriptionService);
  });

  it('upgrades the user tier through Prisma', async () => {
    prismaMock.user.update.mockResolvedValue({ id: 'u1', subscriptionTier: 'GOLD' });

    await expect(service.upgradeTier('u1', 'GOLD' as any)).resolves.toEqual({
      id: 'u1',
      subscriptionTier: 'GOLD',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { subscriptionTier: 'GOLD' },
    });
  });
});
