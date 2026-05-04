import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  const subscriptionServiceMock = {
    upgradeTier: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: SubscriptionService, useValue: subscriptionServiceMock },
      ],
    }).compile();

    controller = module.get(SubscriptionController);
  });

  it('delegates subscription upgrade using req.user.sub', async () => {
    subscriptionServiceMock.upgradeTier.mockResolvedValue({ id: 'u1' });

    const req = { user: { sub: 'u1' } };
    await expect(controller.upgrade(req, 'GOLD' as any)).resolves.toEqual({ id: 'u1' });

    expect(subscriptionServiceMock.upgradeTier).toHaveBeenCalledWith('u1', 'GOLD');
  });
});
