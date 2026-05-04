import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let controller: CartController;

  const cartServiceMock = {
    addToCart: jest.fn(),
    getCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    checkout: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: cartServiceMock }],
    }).compile();

    controller = module.get(CartController);
  });

  it('adds a product to the cart using req.user.sub', async () => {
    cartServiceMock.addToCart.mockResolvedValue({ id: 'i1' });

    await expect(
      controller.addToCart({ user: { sub: 'kc-1' } }, { name: 'x' }),
    ).resolves.toEqual({ id: 'i1' });
    expect(cartServiceMock.addToCart).toHaveBeenCalledWith('kc-1', { name: 'x' });
  });

  it('returns the cart for the current user', async () => {
    cartServiceMock.getCart.mockResolvedValue({ items: [] });

    await expect(controller.getCart({ user: { sub: 'kc-1' } })).resolves.toEqual({ items: [] });
  });

  it('removes a cart item', async () => {
    cartServiceMock.removeFromCart.mockResolvedValue({ success: true });

    await expect(
      controller.removeFromCart({ user: { sub: 'kc-1' } }, 'i1'),
    ).resolves.toEqual({ success: true });
  });

  it('updates cart item quantity', async () => {
    cartServiceMock.updateQuantity.mockResolvedValue({ id: 'i1', quantity: 2 });

    await expect(
      controller.updateQuantity({ user: { sub: 'kc-1' } }, 'i1', 2),
    ).resolves.toEqual({ id: 'i1', quantity: 2 });
  });

  it('checks out the current cart', async () => {
    cartServiceMock.checkout.mockResolvedValue({ id: 'o1' });

    await expect(controller.checkout({ user: { sub: 'kc-1' } })).resolves.toEqual({ id: 'o1' });
  });
});
