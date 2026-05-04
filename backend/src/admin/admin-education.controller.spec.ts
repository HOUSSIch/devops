import { Test, TestingModule } from '@nestjs/testing';
import { AdminEducationController } from './admin-education.controller';
import { AdminEducationService } from './admin-education.service';

describe('AdminEducationController', () => {
  let controller: AdminEducationController;

  const adminEducationServiceMock = {
    getAllArticles: jest.fn(),
    getArticleById: jest.fn(),
    createArticle: jest.fn(),
    updateArticle: jest.fn(),
    deleteArticle: jest.fn(),
    getAllVideos: jest.fn(),
    getVideoById: jest.fn(),
    createVideo: jest.fn(),
    updateVideo: jest.fn(),
    deleteVideo: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEducationController],
      providers: [{ provide: AdminEducationService, useValue: adminEducationServiceMock }],
    }).compile();

    controller = module.get(AdminEducationController);
  });

  it('lists articles with optional filters', async () => {
    adminEducationServiceMock.getAllArticles.mockResolvedValue([{ id: 'a1' }]);

    await expect(controller.getAllArticles('acne', 'science')).resolves.toEqual([{ id: 'a1' }]);
    expect(adminEducationServiceMock.getAllArticles).toHaveBeenCalledWith('acne', 'science');
  });

  it('gets article by id', async () => {
    adminEducationServiceMock.getArticleById.mockResolvedValue({ id: 'a1' });

    await expect(controller.getArticleById('a1')).resolves.toEqual({ id: 'a1' });
  });

  it('creates article payload', async () => {
    const payload = {
      title: 'T',
      category: 'C',
      readTime: 3,
      rating: 4,
      image: 'img',
      summary: 'S',
      content: ['p1'],
    };
    adminEducationServiceMock.createArticle.mockResolvedValue({ id: 'a1' });

    await expect(controller.createArticle(payload)).resolves.toEqual({ id: 'a1' });
    expect(adminEducationServiceMock.createArticle).toHaveBeenCalledWith(payload);
  });

  it('updates article payload', async () => {
    adminEducationServiceMock.updateArticle.mockResolvedValue({ id: 'a1' });

    await expect(controller.updateArticle('a1', { title: 'new' })).resolves.toEqual({ id: 'a1' });
  });

  it('deletes article by id', async () => {
    adminEducationServiceMock.deleteArticle.mockResolvedValue({ success: true });

    await expect(controller.deleteArticle('a1')).resolves.toEqual({ success: true });
  });

  it('lists videos with optional filters', async () => {
    adminEducationServiceMock.getAllVideos.mockResolvedValue([{ id: 'v1' }]);

    await expect(controller.getAllVideos('spf', 'routine')).resolves.toEqual([{ id: 'v1' }]);
    expect(adminEducationServiceMock.getAllVideos).toHaveBeenCalledWith('spf', 'routine');
  });

  it('gets video by id', async () => {
    adminEducationServiceMock.getVideoById.mockResolvedValue({ id: 'v1' });

    await expect(controller.getVideoById('v1')).resolves.toEqual({ id: 'v1' });
  });

  it('creates video payload', async () => {
    const payload = {
      title: 'V',
      duration: '10:00',
      thumbnail: 'thumb',
      category: 'care',
      url: 'https://video',
    };
    adminEducationServiceMock.createVideo.mockResolvedValue({ id: 'v1' });

    await expect(controller.createVideo(payload)).resolves.toEqual({ id: 'v1' });
  });

  it('updates video payload', async () => {
    adminEducationServiceMock.updateVideo.mockResolvedValue({ id: 'v1' });

    await expect(controller.updateVideo('v1', { title: 'new title' })).resolves.toEqual({ id: 'v1' });
  });

  it('deletes video by id', async () => {
    adminEducationServiceMock.deleteVideo.mockResolvedValue({ success: true });

    await expect(controller.deleteVideo('v1')).resolves.toEqual({ success: true });
  });

  it('propagates service errors on createArticle', async () => {
    adminEducationServiceMock.createArticle.mockRejectedValue(new Error('validation failed'));

    await expect(
      controller.createArticle({
        title: 'x',
        category: 'x',
        readTime: 1,
        rating: 1,
        image: 'x',
        summary: 'x',
        content: [],
      }),
    ).rejects.toThrow('validation failed');
  });
});
