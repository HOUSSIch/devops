import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '../core/cloudinary/cloudinary.service';
import { GeminiService } from '../core/ai/gemini.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  const userServiceMock = {
    upsertFromKeycloak: jest.fn(),
    getMeMergedByKeycloakId: jest.fn(),
    updateMeByKeycloakId: jest.fn(),
    updateSubscriptionByKeycloakId: jest.fn(),
    getImageLimit: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    upgradeSubscription: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
    update: jest.fn(),
    changePasswordByKeycloakId: jest.fn(),
    saveQuestionnaireByKeycloakId: jest.fn(),
    getQuestionnaireByKeycloakId: jest.fn(),
  } as any;

  const cloudinaryMock = {
    uploadFile: jest.fn(),
  } as any;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    analysis: {
      create: jest.fn(),
    },
  } as any;

  const geminiMock = {
    analyzeImage: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: GeminiService, useValue: geminiMock },
      ],
    }).compile();

    controller = module.get(UserController);
  });

  it('returns the request user in test()', () => {
    expect(controller.test({ user: { sub: 'kc-1' } })).toEqual({ sub: 'kc-1' });
  });

  it('syncs the current user from Keycloak', async () => {
    userServiceMock.upsertFromKeycloak.mockResolvedValue({ id: 'u1' });

    await expect(
      controller.syncMe({ user: { sub: 'kc-1', email: 'a@b.com', preferred_username: 'alice' } }),
    ).resolves.toEqual({ id: 'u1' });

    expect(userServiceMock.upsertFromKeycloak).toHaveBeenCalledWith({
      keycloakId: 'kc-1',
      email: 'a@b.com',
      username: 'alice',
    });
  });

  it('forwards getMe to the service', async () => {
    userServiceMock.getMeMergedByKeycloakId.mockResolvedValue({ id: 'u1' });

    await expect(controller.getMe({ user: { sub: 'kc-1' } })).resolves.toEqual({ id: 'u1' });
  });

  it('forwards updateMe payload fields to the service', async () => {
    userServiceMock.updateMeByKeycloakId.mockResolvedValue({ success: true });

    await expect(
      controller.updateMe({ user: { sub: 'kc-1' } }, 'A', 'B', 'a@b.com', 'alice', '123', '2000-01-01', 'Paris'),
    ).resolves.toEqual({ success: true });

    expect(userServiceMock.updateMeByKeycloakId).toHaveBeenCalledWith('kc-1', {
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      username: 'alice',
      phone: '123',
      birthday: '2000-01-01',
      address: 'Paris',
    });
  });

  it('forwards subscription updates', async () => {
    userServiceMock.updateSubscriptionByKeycloakId.mockResolvedValue({ id: 'u1' });

    await expect(
      controller.updateMySubscription({ user: { sub: 'kc-1' } }, 'GOLD'),
    ).resolves.toEqual({ id: 'u1' });
  });

  it('rejects uploadAndAnalyze without files', async () => {
    await expect(controller.uploadAndAnalyze([], { user: { sub: 'kc-1' } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects uploadAndAnalyze without an authenticated user', async () => {
    await expect(
      controller.uploadAndAnalyze([{ buffer: Buffer.from('x') } as any], { user: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects uploadAndAnalyze when the user is missing from Prisma', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      controller.uploadAndAnalyze(
        [{ buffer: Buffer.from('x'), mimetype: 'image/png', originalname: 'a.png' } as any],
        { user: { sub: 'kc-1' } },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects uploadAndAnalyze when the photo limit is exceeded', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', subscriptionTier: 'FREE' });
    userServiceMock.getImageLimit.mockReturnValue(1);

    await expect(
      controller.uploadAndAnalyze(
        [
          { buffer: Buffer.from('1'), mimetype: 'image/png', originalname: '1.png' } as any,
          { buffer: Buffer.from('2'), mimetype: 'image/png', originalname: '2.png' } as any,
        ],
        { user: { sub: 'kc-1' } },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('uploads, analyzes and saves an analysis', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', subscriptionTier: 'GOLD' });
    userServiceMock.getImageLimit.mockReturnValue(3);
    cloudinaryMock.uploadFile.mockResolvedValue({ secure_url: 'https://cdn/img.jpg' });
    geminiMock.analyzeImage.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 82,
      skinAge: 29,
      summary: 'Summary',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    prismaMock.analysis.create.mockResolvedValue({ id: 'a1' });
    prismaMock.user.update.mockResolvedValue({ id: 'u1' });

    await expect(
      controller.uploadAndAnalyze(
        [{ buffer: Buffer.from('img'), mimetype: 'image/png', originalname: 'a.png' } as any],
        { user: { sub: 'kc-1' } },
      ),
    ).resolves.toEqual({
      message: 'Analysis complete',
      analysisId: 'a1',
      result: expect.objectContaining({ skinType: 'Dry' }),
      imageUrl: 'https://cdn/img.jpg',
    });

    expect(prismaMock.analysis.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          imageUrl: 'https://cdn/img.jpg',
        }),
      }),
    );
  });

  it('maps progress history entries', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      analyses: [
        {
          id: 'a1',
          createdAt: new Date('2026-05-03T08:00:00.000Z'),
          imageUrl: 'img.jpg',
          concerns: [{ label: 'Dryness' }],
          summary: 'Note',
        },
      ],
    });

    await expect(controller.getProgressHistory({ user: { sub: 'kc-1' } })).resolves.toEqual([
      expect.objectContaining({
        id: 'a1',
        imageUrl: 'img.jpg',
        concerns: ['Dryness'],
        notes: 'Note',
      }),
    ]);
  });

  it('returns the empty dashboard state when there are no analyses', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', username: 'alice', analyses: [] });

    await expect(controller.getDashboardStats({ user: { sub: 'kc-1', given_name: 'Alice' } })).resolves.toEqual(
      expect.objectContaining({
        firstName: 'Alice',
        improvementPercentage: 0,
        chartData: [],
      }),
    );
  });

  it('returns a computed dashboard when analyses exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      username: 'alice',
      analyses: [
        {
          id: 'a1',
          createdAt: new Date('2026-05-01T08:00:00.000Z'),
          imageUrl: 'before.jpg',
          healthScore: 50,
          skinType: 'Dry',
          skinAge: 34,
        },
        {
          id: 'a2',
          createdAt: new Date('2026-05-03T08:00:00.000Z'),
          imageUrl: 'after.jpg',
          healthScore: 75,
          skinType: 'Dry',
          skinAge: 32,
        },
      ],
    });

    await expect(controller.getDashboardStats({ user: { sub: 'kc-1', given_name: 'Alice' } })).resolves.toEqual(
      expect.objectContaining({
        improvementPercentage: '50.0',
        currentScore: 75,
        previousScore: 50,
      }),
    );
  });

  it('forwards admin calls to the UserService', async () => {
    userServiceMock.findAll.mockResolvedValue([{ id: 'u1' }]);
    userServiceMock.create.mockResolvedValue({ id: 'u2' });
    userServiceMock.upgradeSubscription.mockResolvedValue({ id: 'u3' });
    userServiceMock.findById.mockResolvedValue({ id: 'u4' });
    userServiceMock.deleteById.mockResolvedValue({ success: true });
    userServiceMock.update.mockResolvedValue({ id: 'u5' });

    await expect(controller.findAll()).resolves.toEqual([{ id: 'u1' }]);
    await expect(controller.create('x@example.com', 'ADMIN')).resolves.toEqual({ id: 'u2' });
    await expect(controller.upgradeSubscription('u3', 'GOLD')).resolves.toEqual({ id: 'u3' });
    await expect(controller.findById('u4')).resolves.toEqual({ id: 'u4' });
    await expect(controller.deleteById('u5')).resolves.toEqual({ success: true });
    await expect(controller.update('u6', 'e@example.com', 'USER', 'FREE')).resolves.toEqual({ id: 'u5' });
  });

  it('forwards password and questionnaire actions', async () => {
    userServiceMock.changePasswordByKeycloakId.mockResolvedValue({ success: true });
    userServiceMock.saveQuestionnaireByKeycloakId.mockResolvedValue({ success: true });
    userServiceMock.getQuestionnaireByKeycloakId.mockResolvedValue({ skinType: 'Dry' });

    await expect(
      controller.changeMyPassword({ user: { sub: 'kc-1' } }, 'old', 'newpass1', 'newpass1'),
    ).resolves.toEqual({ success: true });

    await expect(
      controller.saveMyQuestionnaire({ user: { sub: 'kc-1' } }, 'Dry', 'High', ['itch'], ['face'], ['dryness'], ['cold'], 'none', 'none', '2 weeks', 'Moderate', 'daily', 'daily', 'high', 'good', 'low'),
    ).resolves.toEqual({ success: true });

    await expect(controller.getMyQuestionnaire({ user: { sub: 'kc-1' } })).resolves.toEqual({ skinType: 'Dry' });
  });
});
