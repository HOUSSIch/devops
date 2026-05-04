import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(CartService);
  });

  it('rejects products with missing required fields', async () => {
    await expect(service.addToCart('kc-1', { name: 'x' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates a user, cart and cart item when adding to cart', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 'u1' });
    prismaMock.cart.findUnique.mockResolvedValue(null);
    prismaMock.cart.create.mockResolvedValue({ id: 'c1' });
    prismaMock.cartItem.create.mockResolvedValue({ id: 'i1' });

    await expect(
      service.addToCart('kc-1', {
        name: 'Cleanser',
        brand: 'Brand',
        price: '$10.00',
        image: 'img.jpg',
        url: 'https://example.com',
      }),
    ).resolves.toEqual({ id: 'i1' });

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.cart.create).toHaveBeenCalledWith({ data: { userId: 'u1' } });
    expect(prismaMock.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: 'c1',
        name: 'Cleanser',
        brand: 'Brand',
        price: '$10.00',
        image: 'img.jpg',
        url: 'https://example.com',
        quantity: 1,
      },
    });
  });

  it('reuses an existing cart when present', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cart.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.cartItem.create.mockResolvedValue({ id: 'i1' });

    await service.addToCart('kc-1', {
      name: 'Cleanser',
      brand: 'Brand',
      price: '$10.00',
      image: 'img.jpg',
    });

    expect(prismaMock.cart.create).not.toHaveBeenCalled();
    expect(prismaMock.cartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ cartId: 'c1' }) }),
    );
  });

  it('returns an empty cart when none exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cart.findUnique.mockResolvedValue(null);

    await expect(service.getCart('kc-1')).resolves.toEqual({ items: [] });
  });

  it('returns cart items when a cart exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cart.findUnique.mockResolvedValue({ id: 'c1', items: [{ id: 'i1' }] });

    await expect(service.getCart('kc-1')).resolves.toEqual({ id: 'c1', items: [{ id: 'i1' }] });
  });

  it('throws when removing a missing item', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cartItem.findUnique.mockResolvedValue(null);

    await expect(service.removeFromCart('kc-1', 'i1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when the cart item belongs to another user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'i1',
      cart: { userId: 'other-user' },
    });

    await expect(service.removeFromCart('kc-1', 'i1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes an item from the cart', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'i1',
      cart: { userId: 'u1' },
    });

    await expect(service.removeFromCart('kc-1', 'i1')).resolves.toEqual({
      message: 'Item removed from cart',
    });
    expect(prismaMock.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
  });

  it('delegates updateQuantity to removeFromCart when quantity is zero', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'i1',
      cart: { userId: 'u1' },
    });
    const removeSpy = jest.spyOn(service, 'removeFromCart').mockResolvedValue({
      message: 'Item removed from cart',
    } as any);

    await expect(service.updateQuantity('kc-1', 'i1', 0)).resolves.toEqual({
      message: 'Item removed from cart',
    });
    expect(removeSpy).toHaveBeenCalledWith('kc-1', 'i1');
  });

  it('updates item quantity when quantity is positive', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'i1',
      cart: { userId: 'u1' },
    });
    prismaMock.cartItem.update.mockResolvedValue({ id: 'i1', quantity: 3 });

    await expect(service.updateQuantity('kc-1', 'i1', 3)).resolves.toEqual({
      id: 'i1',
      quantity: 3,
    });
  });

  it('rejects checkout on an empty cart', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.cart.findUnique.mockResolvedValue({ id: 'c1', items: [] });

    await expect(service.checkout('kc-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates an order and clears the cart on checkout', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', username: 'alice' });
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'c1',
      items: [
        {
          name: 'Cleanser',
          brand: 'Brand',
          price: '$10.00',
          image: 'img.jpg',
          url: 'https://example.com',
          quantity: 1,
        },
      ],
    });
    prismaMock.order.create.mockResolvedValue({ id: 'o1', items: [{ id: 'oi1' }] });

    await expect(service.checkout('kc-1')).resolves.toEqual({ id: 'o1', items: [{ id: 'oi1' }] });

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          shipping: 8,
          tax: 1,
          total: 19,
        }),
        include: { items: true },
      }),
    );
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'c1' } });
  });
});
