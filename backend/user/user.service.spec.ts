import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { KeycloakAdminService } from '../auth/keycloak-admin.service';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
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
  };

  const mockKeycloakAdminService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: KeycloakAdminService,
          useValue: mockKeycloakAdminService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscription helpers', () => {
    it('returns correct image limits for tiers', () => {
      expect(service.getImageLimit('FREE')).toBe(1);
      expect(service.getImageLimit('SILVER')).toBe(2);
      expect(service.getImageLimit('GOLD')).toBe(3);
      expect(service.getImageLimit('PLATINUM')).toBe(5);
    });

    it('detects feature access based on tier', () => {
      expect(service.hasFeatureAccess('FREE', 'progressTracker')).toBe(false);
      expect(service.hasFeatureAccess('SILVER', 'progressTracker')).toBe(true);
      expect(service.hasFeatureAccess('GOLD', 'scanner')).toBe(true);
      expect(service.hasFeatureAccess('GOLD', 'rewards')).toBe(false);
      expect(service.hasFeatureAccess('PLATINUM', 'rewards')).toBe(true);
    });

    it('can accept a full User object for feature access checks', () => {
      const fake: any = { subscriptionTier: 'GOLD' as const };
      expect(service.hasFeatureAccess(fake, 'educationHub')).toBe(true);
    });
  });
});
