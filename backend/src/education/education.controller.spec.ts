import { Test, TestingModule } from '@nestjs/testing';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

describe('EducationController', () => {
  let controller: EducationController;

  const educationServiceMock = {
    getArticles: jest.fn(),
    getVideos: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationController],
      providers: [{ provide: EducationService, useValue: educationServiceMock }],
    }).compile();

    controller = module.get(EducationController);
  });

  it('delegates article search parameters', async () => {
    educationServiceMock.getArticles.mockResolvedValue([{ id: 'art-1' }]);

    await expect(controller.getArticles('skin', 'acne')).resolves.toEqual([{ id: 'art-1' }]);
    expect(educationServiceMock.getArticles).toHaveBeenCalledWith('skin', 'acne');
  });

  it('returns videos from the service', async () => {
    educationServiceMock.getVideos.mockResolvedValue([{ id: 'vid-1' }]);

    await expect(controller.getVideos()).resolves.toEqual([{ id: 'vid-1' }]);
  });
});