import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { CloudinaryService } from '../core/cloudinary/cloudinary.service';
import { GeminiService } from '../core/ai/gemini.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
    update: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    analysis: {
      create: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadFile: jest.fn(),
  };

  const mockGeminiService = {
    analyzeImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user from test endpoint', () => {
    const req = { user: { sub: '123' } };
    expect(controller.test(req)).toEqual(req.user);
  });
});
