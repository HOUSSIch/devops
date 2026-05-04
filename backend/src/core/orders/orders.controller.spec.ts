import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersServiceMock = {
    getOrders: jest.fn(),
    getOrder: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersServiceMock }],
    }).compile();

    controller = module.get(OrdersController);
  });

  it('returns all orders for authenticated user', async () => {
    ordersServiceMock.getOrders.mockResolvedValue([{ id: 'o1' }]);

    await expect(controller.getOrders({ user: { sub: 'kc-1' } })).resolves.toEqual([{ id: 'o1' }]);
    expect(ordersServiceMock.getOrders).toHaveBeenCalledWith('kc-1');
  });

  it('returns one order by id for authenticated user', async () => {
    ordersServiceMock.getOrder.mockResolvedValue({ id: 'o1' });

    await expect(controller.getOrder({ user: { sub: 'kc-1' } }, 'o1')).resolves.toEqual({ id: 'o1' });
    expect(ordersServiceMock.getOrder).toHaveBeenCalledWith('kc-1', 'o1');
  });

  it('propagates service errors in getOrders', async () => {
    ordersServiceMock.getOrders.mockRejectedValue(new Error('orders unavailable'));

    await expect(controller.getOrders({ user: { sub: 'kc-1' } })).rejects.toThrow('orders unavailable');
  });

  it('propagates service errors in getOrder', async () => {
    ordersServiceMock.getOrder.mockRejectedValue(new Error('order lookup failed'));

    await expect(controller.getOrder({ user: { sub: 'kc-1' } }, 'o1')).rejects.toThrow(
      'order lookup failed',
    );
  });
});
