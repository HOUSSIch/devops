import { Test, TestingModule } from '@nestjs/testing';
import { AnalysesController } from './analyses.controller';
import { AnalysesService } from './analyses.service';

describe('AnalysesController', () => {
  let controller: AnalysesController;

  const analysesServiceMock = {
    findAll: jest.fn(),
    exportCsv: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysesController],
      providers: [{ provide: AnalysesService, useValue: analysesServiceMock }],
    }).compile();

    controller = module.get(AnalysesController);
  });

  it('returns the analyses list', async () => {
    analysesServiceMock.findAll.mockResolvedValue([{ id: 'a1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 'a1' }]);
    expect(analysesServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('writes CSV headers and payload to the response', async () => {
    analysesServiceMock.exportCsv.mockResolvedValue('csv-body');
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as any;

    await controller.exportCsv(res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="skin-analyses.csv"',
    );
    expect(res.send).toHaveBeenCalledWith('csv-body');
  });
});
