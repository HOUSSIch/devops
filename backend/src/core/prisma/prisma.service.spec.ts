import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('calls $connect during onModuleInit', async () => {
    const service = new PrismaService();
    service.$connect = jest.fn().mockResolvedValue(undefined) as any;

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.$connect).toHaveBeenCalledTimes(1);
  });
});
