import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const productsServiceMock = {
    getRecommendedProducts: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsServiceMock }],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('forwards analysis payloads to the products service', async () => {
    productsServiceMock.getRecommendedProducts.mockResolvedValue([{ id: 'p1' }]);

    await expect(controller.getRecommendations({ skinType: 'Dry' })).resolves.toEqual([
      { id: 'p1' },
    ]);
  });
});