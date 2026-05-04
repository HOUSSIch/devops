import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { chromium } from 'playwright';

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService();
  });

  it('rejects missing analysis bodies', async () => {
    await expect(service.getRecommendedProducts(undefined as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects analyses without a skinType', async () => {
    await expect(service.getRecommendedProducts({} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('builds deduplicated search queries from concerns and routines', () => {
    const queries = (service as any).buildQueries({
      skinType: 'Dry',
      concerns: [{ label: 'Dryness' }, { label: 'Acne' }, { label: 'Acne' }],
      morningRoutine: [{ step: 'A', product: 'Vitamin C serum', time: 'Morning' }],
      eveningRoutine: [],
    });

    expect(queries).toContain('hydrating moisturizer');
    expect(queries).toContain('niacinamide serum');
    expect(queries).toContain('cleanser');
    expect(queries.length).toBeLessThanOrEqual(8);
  });

  it('parses and sorts results from YesStyle text', () => {
    const parsed = (service as any).parseYesStyleText(
      'Brand One - Bright Serum\nUS$ 12.99\nBrand One - Bright Serum\nUS$ 12.99',
      'bright serum',
      { skinType: 'Dry', concerns: [], morningRoutine: [], eveningRoutine: [] },
    );

    expect(parsed).toHaveLength(2);

    const products = (service as any).deduplicateAndSort(parsed);

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      brand: 'Brand One',
      name: 'Bright Serum',
      price: 'US$ 12.99',
    });
  });

  it('scrapes products using a mocked Playwright browser', async () => {
    const page = {
      goto: jest.fn(),
      waitForTimeout: jest.fn(),
      evaluate: jest.fn().mockResolvedValue('Brand One - Bright Serum\nUS$ 12.99'),
    } as any;
    const browser = {
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn(),
    } as any;

    (chromium.launch as jest.Mock).mockResolvedValue(browser);
    jest.spyOn(service as any, 'buildQueries').mockReturnValue(['bright serum']);

    const results = await service.getRecommendedProducts({ skinType: 'Dry' });

    expect(results).toHaveLength(1);
    expect(page.goto).toHaveBeenCalledWith(
      expect.stringContaining('bright%20serum'),
      expect.any(Object),
    );
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it('throws a helpful error when the browser is missing', async () => {
    (chromium.launch as jest.Mock).mockRejectedValue(new Error("Executable doesn't exist"));

    await expect(service.getRecommendedProducts({ skinType: 'Dry' })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
