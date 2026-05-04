import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(prismaMock as PrismaService);
  });

  it('returns an empty array when user cannot be found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getOrders('kc-missing')).resolves.toEqual([]);
  });

  it('returns orders with existing totals unchanged', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.order.findMany.mockResolvedValue([
      { id: 'o1', total: 77, items: [{ price: '$10', quantity: 1 }] },
    ]);

    const orders = await service.getOrders('kc-1');

    expect(orders[0].total).toBe(77);
  });

  it('calculates totals when total is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'o2',
        total: null,
        shipping: 5,
        tax: 2,
        items: [
          { price: '$12.50', quantity: 2 },
          { price: '$3.00', quantity: 1 },
        ],
      },
    ]);

    const orders = await service.getOrders('kc-1');

    expect(orders[0].total).toBe(35);
  });

  it('returns 0 total when an order has no items', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'o3',
        total: undefined,
        shipping: 0,
        tax: 0,
        items: [],
      },
    ]);

    const orders = await service.getOrders('kc-1');

    expect(orders[0].total).toBe(0);
  });

  it('throws NotFoundException in getOrder when user cannot be found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getOrder('kc-missing', 'order-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns an order by id for an existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.order.findFirst.mockResolvedValue({ id: 'order-1', items: [] });

    await expect(service.getOrder('kc-1', 'order-1')).resolves.toEqual({
      id: 'order-1',
      items: [],
    });
    expect(prismaMock.order.findFirst).toHaveBeenCalledWith({
      where: { id: 'order-1', userId: 'u1' },
      include: { items: true },
    });
  });

  it('propagates data-access failures in getOrder', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.order.findFirst.mockRejectedValue(new Error('db exploded'));

    await expect(service.getOrder('kc-1', 'order-1')).rejects.toThrow('db exploded');
  });
});
