import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAdminService } from '../auth/keycloak-admin.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const prismaMock = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    skinQuestionnaire: {
      upsert: jest.fn(),
    },
  } as any;

  const keycloakMock = {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    verifyUserPassword: jest.fn(),
    setPassword: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: KeycloakAdminService, useValue: keycloakMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('returns users from Prisma', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'u1' }]);

    await expect(service.findAll()).resolves.toEqual([{ id: 'u1' }]);
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
  });

  it('rejects create without email', async () => {
    await expect(service.create('', 'USER')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates a user with default tier', async () => {
    prismaMock.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    await expect(service.create('a@b.com', 'USER')).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'a@b.com',
        role: 'USER',
        subscriptionTier: 'FREE',
      },
    });
  });

  it('findById throws when user is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findById returns the user when found', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(service.findById('u1')).resolves.toEqual({ id: 'u1' });
  });

  it('deleteById throws when user is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.deleteById('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleteById removes an existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.user.delete.mockResolvedValue({ id: 'u1' });

    await expect(service.deleteById('u1')).resolves.toEqual({ id: 'u1' });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('update rejects when no fields are provided', async () => {
    await expect(service.update('u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update rejects missing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.update('u1', 'new@b.com')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update applies only provided fields', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.user.update.mockResolvedValue({ id: 'u1', email: 'new@b.com' });

    await expect(service.update('u1', 'new@b.com', undefined, 'GOLD')).resolves.toEqual({
      id: 'u1',
      email: 'new@b.com',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { email: 'new@b.com', subscriptionTier: 'GOLD' },
    });
  });

  it('upgradeSubscription rejects invalid tier', async () => {
    await expect(
      service.upgradeSubscription('u1', 'INVALID' as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upgradeSubscription rejects missing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.upgradeSubscription('u1', 'GOLD')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upgradeSubscription updates the tier', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.user.update.mockResolvedValue({ id: 'u1', subscriptionTier: 'PLATINUM' });

    await expect(service.upgradeSubscription('u1', 'PLATINUM')).resolves.toEqual({
      id: 'u1',
      subscriptionTier: 'PLATINUM',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { subscriptionTier: 'PLATINUM' },
    });
  });

  it('upsertFromKeycloak returns the existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', keycloakId: 'kc-1' });

    await expect(
      service.upsertFromKeycloak({
        keycloakId: 'kc-1',
        email: 'a@b.com',
        username: 'alice',
      }),
    ).resolves.toEqual({ id: 'u1', keycloakId: 'kc-1' });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('upsertFromKeycloak creates a user when missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    await expect(
      service.upsertFromKeycloak({
        keycloakId: 'kc-1',
        email: 'a@b.com',
        username: 'alice',
      }),
    ).resolves.toEqual({ id: 'u1', email: 'a@b.com' });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        keycloakId: 'kc-1',
        email: 'a@b.com',
        username: 'alice',
      },
      select: {
        id: true,
        keycloakId: true,
        email: true,
        username: true,
        role: true,
        points: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });
  });

  it('getMeByKeycloakId rejects a missing keycloak id', async () => {
    await expect(service.getMeByKeycloakId('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getMeByKeycloakId rejects missing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getMeByKeycloakId('kc-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getMeMergedByKeycloakId merges Prisma and Keycloak data', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      keycloakId: 'kc-1',
      email: 'db@b.com',
      username: 'db-user',
      phone: '123',
      birthday: new Date('2000-01-02T00:00:00.000Z'),
      address: 'Paris',
      role: 'USER',
      points: 10,
      subscriptionTier: 'GOLD',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    keycloakMock.getUser.mockResolvedValue({
      email: 'kc@b.com',
      username: 'kc-user',
      firstName: 'Key',
      lastName: 'Cloak',
    });

    await expect(service.getMeMergedByKeycloakId('kc-1')).resolves.toEqual({
      id: 'u1',
      keycloakId: 'kc-1',
      email: 'kc@b.com',
      username: 'kc-user',
      firstName: 'Key',
      lastName: 'Cloak',
      phone: '123',
      birthday: '2000-01-02',
      address: 'Paris',
      role: 'USER',
      points: 10,
      subscriptionTier: 'GOLD',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('updateMeByKeycloakId updates Keycloak and Prisma', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'db@b.com',
      username: 'db-user',
      phone: '123',
      birthday: null,
      address: null,
    });
    keycloakMock.getUser.mockResolvedValue({
      email: 'kc@b.com',
      username: 'kc-user',
      firstName: 'Key',
      lastName: 'Cloak',
    });
    prismaMock.user.update.mockResolvedValue({
      id: 'u1',
      email: 'new@b.com',
      username: 'new-user',
      phone: '555',
      birthday: new Date('2001-03-04T00:00:00.000Z'),
      address: 'Lyon',
    });

    await expect(
      service.updateMeByKeycloakId('kc-1', {
        firstName: 'New',
        lastName: 'Name',
        email: 'new@b.com',
        username: 'new-user',
        phone: '555',
        birthday: '2001-03-04',
        address: 'Lyon',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Profile updated successfully in Keycloak and Prisma.',
      data: {
        id: 'u1',
        email: 'new@b.com',
        username: 'new-user',
        firstName: 'New',
        lastName: 'Name',
        phone: '555',
        birthday: '2001-03-04',
        address: 'Lyon',
      },
    });

    expect(keycloakMock.updateUser).toHaveBeenCalledWith('kc-1', {
      firstName: 'New',
      lastName: 'Name',
      email: 'new@b.com',
      username: 'new-user',
    });
  });

  it('updateSubscriptionByKeycloakId rejects invalid tiers', async () => {
    await expect(
      service.updateSubscriptionByKeycloakId('kc-1', 'bronze'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('changePasswordByKeycloakId validates the input and updates Keycloak', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'db@b.com',
      username: 'db-user',
      keycloakId: 'kc-1',
    });
    keycloakMock.getUser.mockResolvedValue({ email: 'kc@b.com' });
    keycloakMock.verifyUserPassword.mockResolvedValue(true);

    await expect(
      service.changePasswordByKeycloakId('kc-1', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Password changed successfully',
    });

    expect(keycloakMock.setPassword).toHaveBeenCalledWith('kc-1', 'newpassword');
  });

  it('saveQuestionnaireByKeycloakId persists questionnaire data', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.skinQuestionnaire.upsert.mockResolvedValue({ id: 'q1' });

    await expect(
      service.saveQuestionnaireByKeycloakId('kc-1', {
        skinType: 'Dry',
        sensitivityLevel: 'High',
        symptoms: ['tightness'],
        affectedAreas: ['cheeks'],
        concerns: ['dryness'],
        triggers: ['cold'],
        duration: '2 weeks',
        severity: 'Moderate',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Questionnaire saved successfully',
      data: { id: 'q1' },
    });
  });

  it('getQuestionnaireByKeycloakId returns null when no questionnaire exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      keycloakId: 'kc-1',
      questionnaire: null,
    });

    await expect(service.getQuestionnaireByKeycloakId('kc-1')).resolves.toBeNull();
  });

  it('getImageLimit and feature access cover tier matrix', () => {
    expect(service.getImageLimit('FREE')).toBe(1);
    expect(service.getImageLimit('SILVER')).toBe(2);
    expect(service.getImageLimit('GOLD')).toBe(3);
    expect(service.getImageLimit('PLATINUM')).toBe(5);

    expect(service.hasFeatureAccess('FREE', 'scanner')).toBe(false);
    expect(service.hasFeatureAccess('GOLD', 'educationHub')).toBe(true);
    expect(service.hasFeatureAccess('PLATINUM', 'rewards')).toBe(true);
  });
});
