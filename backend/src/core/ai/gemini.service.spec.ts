import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { GeminiService } from './gemini.service';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new GeminiService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws at construction when GEMINI_API_KEY is missing', () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => new GeminiService()).toThrow(InternalServerErrorException);
  });

  it('rejects empty image buffers', async () => {
    await expect(service.analyzeImage(Buffer.from(''), 'image/png')).rejects.toBeInstanceOf(
      HttpException,
    );

    try {
      await service.analyzeImage(Buffer.from(''), 'image/png');
    } catch (error: any) {
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('returns normalized analysis on valid JSON response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            skinType: 'Dry',
            healthScore: 85,
            skinAge: 29,
            summary: 'Healthy skin',
            concerns: [
              {
                label: 'Dehydration',
                severity: 'high',
                description: 'Skin is dry',
                tips: ['Hydrate well', '', 'Use HA serum'],
                icon: 'InvalidIcon',
              },
            ],
            morningRoutine: [{ step: 'Cleanse', priority: 'high' }],
            eveningRoutine: [{ step: 'Moisturize', priority: 'low' }],
          }),
      },
    });

    const result = await service.analyzeImage(Buffer.from('abc'), 'image/png');

    expect(result.skinType).toBe('Dry');
    expect(result.concerns[0]).toMatchObject({
      severity: 'High',
      icon: 'Sparkles',
      color: 'text-blue-500',
    });
    expect(result.concerns[0].tips).toEqual(['Hydrate well', 'Use HA serum']);
    expect(result.morningRoutine[0].priority).toBe('high');
    expect(result.eveningRoutine[0].priority).toBe('low');
  });

  it('accepts markdown-wrapped JSON and strips code fences', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '```json\n{"skinType":"Oily","healthScore":70,"skinAge":32}\n```',
      },
    });

    const result = await service.analyzeImage(Buffer.from('abc'), 'image/jpeg');

    expect(result).toMatchObject({
      skinType: 'Oily',
      healthScore: 70,
      skinAge: 32,
      concerns: [],
    });
  });

  it('throws BAD_GATEWAY when Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'not-json',
      },
    });

    try {
      await service.analyzeImage(Buffer.from('abc'), 'image/png');
      fail('Expected analyzeImage to throw');
    } catch (error: any) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      expect(error.getResponse()).toMatchObject({
        message: 'Gemini returned invalid JSON',
      });
    }
  });

  it('maps 429 errors to TOO_MANY_REQUESTS with retry info', async () => {
    mockGenerateContent.mockRejectedValue({
      status: 429,
      message: 'rate limit',
      errorDetails: [
        {
          '@type': 'type.googleapis.com/google.rpc.RetryInfo',
          retryDelay: '42s',
        },
      ],
    });

    try {
      await service.analyzeImage(Buffer.from('abc'), 'image/png');
      fail('Expected analyzeImage to throw');
    } catch (error: any) {
      expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(error.getResponse()).toMatchObject({
        code: 'AI_QUOTA_EXCEEDED',
        retryAfterMs: 42000,
      });
    }
  });

  it('maps 400 errors to BAD_REQUEST', async () => {
    mockGenerateContent.mockRejectedValue({
      status: 400,
      message: 'bad request body',
    });

    try {
      await service.analyzeImage(Buffer.from('abc'), 'image/png');
      fail('Expected analyzeImage to throw');
    } catch (error: any) {
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toMatchObject({
        code: 'AI_BAD_REQUEST',
      });
    }
  });

  it('maps unknown errors to INTERNAL_SERVER_ERROR', async () => {
    mockGenerateContent.mockRejectedValue(new Error('boom'));

    try {
      await service.analyzeImage(Buffer.from('abc'), 'image/png');
      fail('Expected analyzeImage to throw');
    } catch (error: any) {
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.getResponse()).toMatchObject({
        code: 'AI_ANALYSIS_FAILED',
        details: 'boom',
      });
    }
  });

  it('uses default retryAfterMs when retry info is missing', async () => {
    mockGenerateContent.mockRejectedValue({
      status: 429,
      message: 'rate limit no retry info',
      errorDetails: 'not-an-array',
    });

    try {
      await service.analyzeImage(Buffer.from('abc'), 'image/png');
      fail('Expected analyzeImage to throw');
    } catch (error: any) {
      expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(error.getResponse()).toMatchObject({
        code: 'AI_QUOTA_EXCEEDED',
        retryAfterMs: 60000,
      });
    }
  });

  it('falls back to safe defaults for malformed analysis payload', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            concerns: [
              {
                label: 'Acne breakout',
                severity: 'medium',
                description: null,
                tips: ['', 42],
                color: '',
              },
              {
                label: 'Sun damage',
                severity: 'mild',
                riskLevel: {
                  level: 'custom',
                  label: 'Custom',
                  color: 'text-black',
                  bgColor: 'bg-black',
                },
                icon: 'Sun',
              },
            ],
            morningRoutine: [{ time: 'Morning', priority: 'unexpected' }],
            eveningRoutine: [{ time: 'Evening', priority: 'LOW' }],
          }),
      },
    });

    const result = await service.analyzeImage(Buffer.from('abc'), 'image/png');

    expect(result.skinType).toBe('Unknown');
    expect(result.healthScore).toBe(0);
    expect(result.skinAge).toBe(0);
    expect(result.concerns[0]).toMatchObject({
      severity: 'Moderate',
      tips: ['No specific tips provided.'],
      color: 'text-purple-500',
    });
    expect(result.concerns[1]).toMatchObject({
      icon: 'Sun',
      riskLevel: {
        level: 'custom',
        label: 'Custom',
        color: 'text-black',
        bgColor: 'bg-black',
      },
      color: 'text-yellow-500',
    });
    expect(result.morningRoutine[0].priority).toBe('medium');
    expect(result.eveningRoutine[0].priority).toBe('low');
  });

  it('generateTextResponse returns trimmed text', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '  hello from AI  ',
      },
    });

    await expect(service.generateTextResponse('prompt')).resolves.toBe('hello from AI');
  });

  it('generateTextResponse wraps generation errors in HttpException', async () => {
    mockGenerateContent.mockRejectedValue(new Error('text-generation-failed'));

    try {
      await service.generateTextResponse('prompt');
      fail('Expected generateTextResponse to throw');
    } catch (error: any) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.getResponse()).toMatchObject({
        message: 'Failed to generate text response with AI',
        details: 'text-generation-failed',
      });
    }
  });
});
