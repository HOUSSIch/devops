import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { User } from '@prisma/client';
import { KeycloakAdminService } from '../auth/keycloak-admin.service';

export type SubscriptionTier = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private keycloakAdminService: KeycloakAdminService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(
    email: string,
    role: 'USER' | 'ADMIN',
    subscriptionTier: SubscriptionTier = 'FREE',
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.prisma.user.create({
      data: { email, role, subscriptionTier },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async update(
    id: string,
    email?: string,
    role?: 'USER' | 'ADMIN',
    subscriptionTier?: SubscriptionTier,
  ) {
    const data: {
      email?: string;
      role?: 'USER' | 'ADMIN';
      subscriptionTier?: SubscriptionTier;
    } = {};

    if (email) data.email = email;
    if (role) data.role = role;
    if (subscriptionTier) data.subscriptionTier = subscriptionTier;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async upgradeSubscription(id: string, newTier: SubscriptionTier) {
    const allowedTiers: SubscriptionTier[] = [
      'FREE',
      'SILVER',
      'GOLD',
      'PLATINUM',
    ];

    if (!allowedTiers.includes(newTier)) {
      throw new BadRequestException('Invalid subscription tier');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { subscriptionTier: newTier },
    });
  }

  hasFeatureAccess(
    tierOrUser: SubscriptionTier | User,
    feature: 'progressTracker' | 'scanner' | 'educationHub' | 'rewards',
  ): boolean {
    const tier: SubscriptionTier =
      typeof tierOrUser === 'string'
        ? tierOrUser
        : (tierOrUser.subscriptionTier as SubscriptionTier);

    const access: Record<SubscriptionTier, string[]> = {
      FREE: [],
      SILVER: ['progressTracker'],
      GOLD: ['progressTracker', 'scanner', 'educationHub'],
      PLATINUM: [
        'progressTracker',
        'scanner',
        'educationHub',
        'rewards',
      ],
    };

    return access[tier]?.includes(feature);
  }

  getImageLimit(tierOrUser: SubscriptionTier | User): number {
    const tier: SubscriptionTier =
      typeof tierOrUser === 'string'
        ? tierOrUser
        : (tierOrUser.subscriptionTier as SubscriptionTier);

    switch (tier) {
      case 'SILVER':
        return 2;
      case 'GOLD':
        return 3;
      case 'PLATINUM':
        return 5;
      case 'FREE':
      default:
        return 1;
    }
  }

  async upsertFromKeycloak(dto: {
    keycloakId: string;
    email: string;
    username: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { keycloakId: dto.keycloakId },
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

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        keycloakId: dto.keycloakId,
        email: dto.email,
        username: dto.username,
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
  }

  async getMeByKeycloakId(keycloakId: string) {
    if (!keycloakId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: {
        id: true,
        keycloakId: true,
        email: true,
        username: true,
        phone: true,
        birthday: true,
        address: true,
        role: true,
        points: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMeMergedByKeycloakId(keycloakId: string) {
    if (!keycloakId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: {
        id: true,
        keycloakId: true,
        email: true,
        username: true,
        phone: true,
        birthday: true,
        address: true,
        role: true,
        points: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kcUser = await this.keycloakAdminService.getUser(keycloakId);

    const result = {
      id: user.id,
      keycloakId: user.keycloakId,
      email: kcUser?.email ?? user.email,
      username: kcUser?.username ?? user.username,
      firstName: kcUser?.firstName ?? '',
      lastName: kcUser?.lastName ?? '',
      phone: user.phone ?? '',
      birthday: user.birthday
        ? new Date(user.birthday).toISOString().split('T')[0]
        : '',
      address: user.address ?? '',
      role: user.role,
      points: user.points,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
    };

    console.log('GET /users/me merged result:', result);

    return result;
  }

  async updateMeByKeycloakId(
    keycloakId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
      phone?: string;
      birthday?: string;
      address?: string;
    },
  ) {
    if (!keycloakId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        birthday: true,
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const keycloakUser = await this.keycloakAdminService.getUser(keycloakId);

    await this.keycloakAdminService.updateUser(keycloakId, {
      firstName: data.firstName ?? keycloakUser.firstName ?? '',
      lastName: data.lastName ?? keycloakUser.lastName ?? '',
      email: data.email ?? keycloakUser.email ?? user.email,
      username:
        data.username ??
        keycloakUser.username ??
        user.username ??
        user.email,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: data.email ?? user.email,
        username: data.username ?? user.username,
        phone: data.phone ?? null,
        birthday:
          data.birthday && data.birthday.trim() !== ''
            ? new Date(data.birthday)
            : null,
        address: data.address ?? null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        birthday: true,
        address: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully in Keycloak and Prisma.',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: data.firstName ?? keycloakUser.firstName ?? '',
        lastName: data.lastName ?? keycloakUser.lastName ?? '',
        phone: updatedUser.phone ?? '',
        birthday: updatedUser.birthday
          ? new Date(updatedUser.birthday).toISOString().split('T')[0]
          : '',
        address: updatedUser.address ?? '',
      },
    };
  }

  async updateSubscriptionByKeycloakId(
    keycloakId: string,
    newTier: string,
  ) {
    if (!keycloakId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    const allowedTiers: SubscriptionTier[] = [
      'FREE',
      'SILVER',
      'GOLD',
      'PLATINUM',
    ];

    const normalizedTier = String(newTier || '').toUpperCase() as SubscriptionTier;

    if (!allowedTiers.includes(normalizedTier)) {
      throw new BadRequestException('Invalid subscription tier');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: normalizedTier,
      },
    });
  }
  async changePasswordByKeycloakId(
  keycloakId: string,
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
) {
  if (!keycloakId) {
    throw new BadRequestException('Missing authenticated user id');
  }

  if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
    throw new BadRequestException('All password fields are required');
  }

  if (data.newPassword !== data.confirmPassword) {
    throw new BadRequestException('New password and confirmation do not match');
  }

  if (data.newPassword.length < 8) {
    throw new BadRequestException(
      'New password must contain at least 8 characters',
    );
  }

  if (data.currentPassword === data.newPassword) {
    throw new BadRequestException(
      'New password must be different from current password',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: { keycloakId },
    select: {
      id: true,
      email: true,
      username: true,
      keycloakId: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const keycloakUser = await this.keycloakAdminService.getUser(keycloakId);

  const loginIdentifier = keycloakUser?.email || user.email;

  console.log('🔎 Password verification with login:', loginIdentifier);

  const isCurrentPasswordValid =
    await this.keycloakAdminService.verifyUserPassword(
      loginIdentifier,
      data.currentPassword,
    );

  if (!isCurrentPasswordValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  await this.keycloakAdminService.setPassword(keycloakId, data.newPassword);

  return {
    success: true,
    message: 'Password changed successfully',
  };

}

async saveQuestionnaireByKeycloakId(
  keycloakId: string,
  data: {
    skinType: string;
    sensitivityLevel: string;
    symptoms: string[];
    affectedAreas: string[];
    concerns: string[];
    triggers: string[];
    allergies?: string;
    medicalHistory?: string;
    duration?: string;
    severity?: string;
    skincareRoutine?: string;
    sunscreenUsage?: string;
    stressLevel?: string;
    sleepQuality?: string;
    waterIntake?: string;
  },
) {
  if (!keycloakId) {
    throw new BadRequestException('Missing authenticated user id');
  }

  if (!data.skinType) {
    throw new BadRequestException('skinType is required');
  }

  if (!data.sensitivityLevel) {
    throw new BadRequestException('sensitivityLevel is required');
  }

  if (!Array.isArray(data.symptoms) || data.symptoms.length === 0) {
    throw new BadRequestException('symptoms are required');
  }

  if (!Array.isArray(data.affectedAreas) || data.affectedAreas.length === 0) {
    throw new BadRequestException('affectedAreas are required');
  }

  if (!Array.isArray(data.concerns) || data.concerns.length === 0) {
    throw new BadRequestException('concerns are required');
  }

  if (!data.duration) {
    throw new BadRequestException('duration is required');
  }

  if (!data.severity) {
    throw new BadRequestException('severity is required');
  }

  const user = await this.prisma.user.findUnique({
    where: { keycloakId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const questionnaire = await this.prisma.skinQuestionnaire.upsert({
    where: {
      userId: user.id,
    },
    update: {
      skinType: data.skinType,
      sensitivityLevel: data.sensitivityLevel,
      symptoms: data.symptoms,
      affectedAreas: data.affectedAreas,
      concerns: data.concerns,
      triggers: Array.isArray(data.triggers) ? data.triggers : [],
      allergies: data.allergies ?? null,
      medicalHistory: data.medicalHistory ?? null,
      duration: data.duration,
      severity: data.severity,
      skincareRoutine: data.skincareRoutine ?? null,
      sunscreenUsage: data.sunscreenUsage ?? null,
      stressLevel: data.stressLevel ?? null,
      sleepQuality: data.sleepQuality ?? null,
      waterIntake: data.waterIntake ?? null,
    },
    create: {
      userId: user.id,
      skinType: data.skinType,
      sensitivityLevel: data.sensitivityLevel,
      symptoms: data.symptoms,
      affectedAreas: data.affectedAreas,
      concerns: data.concerns,
      triggers: Array.isArray(data.triggers) ? data.triggers : [],
      allergies: data.allergies ?? null,
      medicalHistory: data.medicalHistory ?? null,
      duration: data.duration,
      severity: data.severity,
      skincareRoutine: data.skincareRoutine ?? null,
      sunscreenUsage: data.sunscreenUsage ?? null,
      stressLevel: data.stressLevel ?? null,
      sleepQuality: data.sleepQuality ?? null,
      waterIntake: data.waterIntake ?? null,
    },
  });

  return {
    success: true,
    message: 'Questionnaire saved successfully',
    data: questionnaire,
  };
}


async getQuestionnaireByKeycloakId(keycloakId: string) {
  if (!keycloakId) {
    throw new BadRequestException('Missing authenticated user id');
  }

  console.log("GET QUESTIONNAIRE keycloakId:", keycloakId);

  const user = await this.prisma.user.findUnique({
    where: { keycloakId },
    select: {
      id: true,
      keycloakId: true,
      questionnaire: true,
    },
  });

  console.log("GET QUESTIONNAIRE user:", user);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user.questionnaire ?? null;
}
}