import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';

const uploadStreamMock = jest.fn();
const configMock = jest.fn();
let streamCallback: ((error: any, result: any) => void) | null = null;

jest.mock('cloudinary', () => ({
  v2: {
    config: (...args: any[]) => configMock(...args),
    uploader: {
      upload_stream: jest.fn((options: any, callback: any) => {
        streamCallback = callback;
        return uploadStreamMock(options, callback);
      }),
    },
  },
}));

jest.mock('streamifier', () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn((destination: any) => {
      if (streamCallback) {
        destination;
      }
      return destination;
    }),
  })),
}));

describe('CloudinaryService', () => {
  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'CLOUDINARY_NAME') return 'demo-cloud';
      if (key === 'CLOUDINARY_API_KEY') return 'api-key';
      if (key === 'CLOUDINARY_API_SECRET') return 'api-secret';
      return undefined;
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    streamCallback = null;
  });

  it('configures Cloudinary on construction', () => {
    new CloudinaryService(configServiceMock);

    expect(configMock).toHaveBeenCalledWith({
      cloud_name: 'demo-cloud',
      api_key: 'api-key',
      api_secret: 'api-secret',
    });
  });

  it('uploads a file and resolves the Cloudinary response', async () => {
    const service = new CloudinaryService(configServiceMock);
    const result = { secure_url: 'https://cdn.example.com/image.jpg', public_id: 'abc' };

    (require('cloudinary').v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (_options: any, callback: any) => {
        streamCallback = callback;
        return {} as any;
      },
    );

    const file = { originalname: 'skin.png', buffer: Buffer.from('image') } as Express.Multer.File;
    const promise = service.uploadFile(file);

    expect(uploadStreamMock).not.toHaveBeenCalled();
    expect(streamCallback).toBeTruthy();
    streamCallback?.(null, result);

    await expect(promise).resolves.toEqual(result);
  });

  it('rejects when Cloudinary returns an error', async () => {
    const service = new CloudinaryService(configServiceMock);

    (require('cloudinary').v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (_options: any, callback: any) => {
        streamCallback = callback;
        return {} as any;
      },
    );

    const file = { originalname: 'skin.png', buffer: Buffer.from('image') } as Express.Multer.File;
    const promise = service.uploadFile(file);

    streamCallback?.(new Error('upload failed'), null);

    await expect(promise).rejects.toThrow('upload failed');
  });
});
