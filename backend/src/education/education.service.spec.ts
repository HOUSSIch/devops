import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/prisma/prisma.service';
import { EducationService } from './education.service';

describe('EducationService', () => {
  let service: EducationService;

  const prismaMock = {
    article: {
      findMany: jest.fn(),
    },
    video: {
      findMany: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(EducationService);
  });

  it('fetches filtered articles', async () => {
    prismaMock.article.findMany.mockResolvedValue([{ id: 'art-1' }]);

    await expect(service.getArticles('skin-care', 'vitamin')).resolves.toEqual([
      { id: 'art-1' },
    ]);

    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { category: 'skin-care' },
          {
            OR: [
              { title: { contains: 'vitamin', mode: 'insensitive' } },
              { summary: { contains: 'vitamin', mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('fetches videos without filters', async () => {
    prismaMock.video.findMany.mockResolvedValue([{ id: 'vid-1' }]);

    await expect(service.getVideos()).resolves.toEqual([{ id: 'vid-1' }]);
    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(1);
  });
});
