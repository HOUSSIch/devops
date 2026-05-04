import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { PrismaService } from '../prisma/prisma.service';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('ScannerService', () => {
  let service: ScannerService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    analysis: {
      findFirst: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'scanner-test-key';
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new ScannerService(prismaMock as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws at construction when GEMINI_API_KEY is missing', () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => new ScannerService(prismaMock as PrismaService)).toThrow(
      'GEMINI_API_KEY is not defined in .env',
    );
  });

  it('analyzes a product query and normalizes response values', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            name: 'Serum X',
            compatibility: 'unknown-value',
            compatibilityScore: 110,
            ingredients: [{ name: 'Niacinamide', status: 'beneficial' }],
            layeringOrder: '3',
            conflictsWith: [123],
            recommendations: ['Use at night'],
          }),
      },
    });

    const result = await service.analyzeProductForUser('kc-1', 'serum');

    expect(result).toMatchObject({
      name: 'Serum X',
      compatibility: 'caution',
      compatibilityScore: 100,
      layeringOrder: 3,
    });
    expect(result.ingredients[0].status).toBe('beneficial');
    expect(result.conflictsWith).toEqual(['123']);
  });

  it('throws when authenticated user id is missing', async () => {
    await expect(service.analyzeProductForUser('', 'serum')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.analyzeProductForUser('kc-404', 'serum')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when no previous analysis exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue(null);

    await expect(service.analyzeProductForUser('kc-1', 'serum')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('wraps AI runtime errors for query analysis', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    mockGenerateContent.mockRejectedValue(new Error('AI failed'));

    await expect(service.analyzeProductForUser('kc-1', 'serum')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('rejects empty product image buffers', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });

    await expect(
      service.analyzeProductImageForUser('kc-1', Buffer.from(''), 'image/png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('analyzes a product image and sends prompt plus image payload', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            barcode: '123',
            name: 'Cleanser',
            brand: 'Brand',
            compatibility: 'good',
            compatibilityScore: 70,
            ingredients: [{ name: 'X', status: 'unexpected', description: 'd' }],
            layeringOrder: null,
          }),
      },
    });

    const result = await service.analyzeProductImageForUser(
      'kc-1',
      Buffer.from('image-binary'),
      'image/png',
    );

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.any(String),
        expect.objectContaining({
          inlineData: expect.objectContaining({ mimeType: 'image/png' }),
        }),
      ]),
    );
    expect(result.ingredients[0].status).toBe('neutral');
    expect(result.layeringOrder).toBe(0);
  });

  it('wraps invalid JSON image responses in HttpException', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'invalid-json',
      },
    });

    await expect(
      service.analyzeProductImageForUser('kc-1', Buffer.from('img'), 'image/png'),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
