import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('GeminiController', () => {
  let controller: GeminiController;

  const geminiServiceMock = {
    analyzeImage: jest.fn(),
  } as any;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    analysis: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  } as any;

  const cloudinaryServiceMock = {
    uploadFile: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [
        { provide: GeminiService, useValue: geminiServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryServiceMock },
      ],
    }).compile();

    controller = module.get(GeminiController);
  });

  it('throws when no file is uploaded', async () => {
    await expect(controller.analyze(undefined as any, { user: { sub: 'kc-1' } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when file buffer is missing', async () => {
    await expect(
      controller.analyze({ mimetype: 'image/png' } as any, { user: { sub: 'kc-1' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when token does not include authenticated user', async () => {
    await expect(
      controller.analyze({ buffer: Buffer.from('img'), mimetype: 'image/png' } as any, { user: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when authenticated user is missing in database', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      controller.analyze(
        { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
        { user: { sub: 'kc-1' } },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when AI analysis result is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    geminiServiceMock.analyzeImage.mockResolvedValue({ skinType: 'Dry' });

    await expect(
      controller.analyze(
        { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
        { user: { sub: 'kc-1' } },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('analyzes, uploads image and persists analysis on success', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    geminiServiceMock.analyzeImage.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    cloudinaryServiceMock.uploadFile.mockResolvedValue({ secure_url: 'http://img.url/a.png' });
    prismaMock.analysis.create.mockResolvedValue({ id: 'a1' });

    const result = await controller.analyze(
      { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      { user: { sub: 'kc-1' } },
    );

    expect(cloudinaryServiceMock.uploadFile).toHaveBeenCalledTimes(1);
    expect(prismaMock.analysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'u1',
        imageUrl: 'http://img.url/a.png',
      }),
    });
    expect(result).toMatchObject({
      success: true,
      data: expect.objectContaining({
        imageUrl: 'http://img.url/a.png',
        savedAnalysisId: 'a1',
      }),
    });
  });

  it('throws when latest-analysis endpoint has no authenticated user', async () => {
    await expect(controller.getMyLatestAnalysis({ user: {} })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when latest-analysis user is absent in database', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(controller.getMyLatestAnalysis({ user: { sub: 'kc-1' } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns null payload when no analysis exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue(null);

    await expect(controller.getMyLatestAnalysis({ user: { sub: 'kc-1' } })).resolves.toEqual({
      message: 'No analysis found for this user',
      data: null,
    });
  });

  it('returns latest analysis when available', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.analysis.findFirst.mockResolvedValue({ id: 'a1', skinType: 'Dry' });

    await expect(controller.getMyLatestAnalysis({ user: { sub: 'kc-1' } })).resolves.toEqual({
      success: true,
      data: { id: 'a1', skinType: 'Dry' },
    });
  });
});
