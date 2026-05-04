import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';

describe('ScannerController', () => {
  let controller: ScannerController;

  const scannerServiceMock = {
    analyzeProductForUser: jest.fn(),
    analyzeProductImageForUser: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScannerController],
      providers: [{ provide: ScannerService, useValue: scannerServiceMock }],
    }).compile();

    controller = module.get(ScannerController);
  });

  it('forwards product analysis to scanner service', async () => {
    scannerServiceMock.analyzeProductForUser.mockResolvedValue({ name: 'Serum' });

    await expect(
      controller.analyzeProduct({ user: { sub: 'kc-1' } }, 'niacinamide'),
    ).resolves.toEqual({ name: 'Serum' });

    expect(scannerServiceMock.analyzeProductForUser).toHaveBeenCalledWith('kc-1', 'niacinamide');
  });

  it('forwards undefined keycloak id as edge case', async () => {
    scannerServiceMock.analyzeProductForUser.mockResolvedValue({ name: 'Serum' });

    await controller.analyzeProduct({ user: {} }, 'niacinamide');

    expect(scannerServiceMock.analyzeProductForUser).toHaveBeenCalledWith(undefined, 'niacinamide');
  });

  it('propagates scanner service failures on product analysis', async () => {
    scannerServiceMock.analyzeProductForUser.mockRejectedValue(new Error('scanner failed'));

    await expect(
      controller.analyzeProduct({ user: { sub: 'kc-1' } }, 'niacinamide'),
    ).rejects.toThrow('scanner failed');
  });

  it('rejects missing uploaded image', async () => {
    await expect(controller.analyzeProductImage({ user: { sub: 'kc-1' } }, undefined as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('forwards valid image analysis request', async () => {
    scannerServiceMock.analyzeProductImageForUser.mockResolvedValue({ name: 'FromImage' });

    await expect(
      controller.analyzeProductImage(
        { user: { sub: 'kc-1' } },
        { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      ),
    ).resolves.toEqual({ name: 'FromImage' });

    expect(scannerServiceMock.analyzeProductImageForUser).toHaveBeenCalledWith(
      'kc-1',
      expect.any(Buffer),
      'image/png',
    );
  });

  it('propagates scanner service failures on image analysis', async () => {
    scannerServiceMock.analyzeProductImageForUser.mockRejectedValue(new Error('image scanner failed'));

    await expect(
      controller.analyzeProductImage(
        { user: { sub: 'kc-1' } },
        { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      ),
    ).rejects.toThrow('image scanner failed');
  });
});
