import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/prisma/prisma.service';
import { AdminEducationService } from './admin-education.service';

describe('AdminEducationService', () => {
  let service: AdminEducationService;

  const prismaMock = {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    video: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminEducationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AdminEducationService);
  });

  it('lists articles with filters', async () => {
    prismaMock.article.findMany.mockResolvedValue([{ id: 'art-1' }]);

    await expect(service.getAllArticles('vitamin', 'skincare')).resolves.toEqual([
      { id: 'art-1' },
    ]);
  });

  it('throws when article is missing by id', async () => {
    prismaMock.article.findUnique.mockResolvedValue(null);

    await expect(service.getArticleById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates an article after validating required fields', async () => {
    prismaMock.article.create.mockResolvedValue({ id: 'art-1' });

    await expect(
      service.createArticle({
        title: 'Title',
        category: 'Skin',
        readTime: 5,
        rating: 4,
        image: 'img.jpg',
        summary: 'Summary',
        content: ['Paragraph'],
      }),
    ).resolves.toEqual({ id: 'art-1' });

    expect(prismaMock.article.create).toHaveBeenCalledWith({
      data: {
        title: 'Title',
        category: 'Skin',
        readTime: 5,
        rating: 4,
        image: 'img.jpg',
        summary: 'Summary',
        content: ['Paragraph'],
      },
    });
  });

  it('rejects article creation with invalid content', async () => {
    await expect(
      service.createArticle({
        title: 'Title',
        category: 'Skin',
        readTime: 5,
        rating: 4,
        image: 'img.jpg',
        summary: 'Summary',
        content: 'bad' as any,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates an article and validates content array', async () => {
    prismaMock.article.findUnique.mockResolvedValue({ id: 'art-1' });
    prismaMock.article.update.mockResolvedValue({ id: 'art-1', title: 'Updated' });

    await expect(
      service.updateArticle('art-1', { title: 'Updated', content: ['One'] }),
    ).resolves.toEqual({ id: 'art-1', title: 'Updated' });
  });

  it('throws when updating a missing article', async () => {
    prismaMock.article.findUnique.mockResolvedValue(null);

    await expect(service.updateArticle('art-1', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deletes an article', async () => {
    prismaMock.article.findUnique.mockResolvedValue({ id: 'art-1' });
    prismaMock.article.delete.mockResolvedValue({ id: 'art-1' });

    await expect(service.deleteArticle('art-1')).resolves.toEqual({ id: 'art-1' });
  });

  it('lists videos with filters', async () => {
    prismaMock.video.findMany.mockResolvedValue([{ id: 'vid-1' }]);

    await expect(service.getAllVideos('skin', 'all')).resolves.toEqual([
      { id: 'vid-1' },
    ]);
  });

  it('throws when a video is missing by id', async () => {
    prismaMock.video.findUnique.mockResolvedValue(null);

    await expect(service.getVideoById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a video', async () => {
    prismaMock.video.create.mockResolvedValue({ id: 'vid-1' });

    await expect(
      service.createVideo({
        title: 'Video',
        duration: '5:00',
        thumbnail: 'thumb.jpg',
        category: 'Skin',
        url: 'https://example.com',
      }),
    ).resolves.toEqual({ id: 'vid-1' });
  });

  it('updates a video', async () => {
    prismaMock.video.findUnique.mockResolvedValue({ id: 'vid-1' });
    prismaMock.video.update.mockResolvedValue({ id: 'vid-1', title: 'Updated' });

    await expect(
      service.updateVideo('vid-1', { title: 'Updated' }),
    ).resolves.toEqual({ id: 'vid-1', title: 'Updated' });
  });

  it('deletes a video', async () => {
    prismaMock.video.findUnique.mockResolvedValue({ id: 'vid-1' });
    prismaMock.video.delete.mockResolvedValue({ id: 'vid-1' });

    await expect(service.deleteVideo('vid-1')).resolves.toEqual({ id: 'vid-1' });
  });
});
