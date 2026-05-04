import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAdminService } from '../auth/keycloak-admin.service';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;

  const kcAdminMock = {
    listUsers: jest.fn(),
    createUser: jest.fn(),
    setEnabled: jest.fn(),
    setPassword: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: KeycloakAdminService, useValue: kcAdminMock }],
    }).compile();

    controller = module.get(AdminController);
  });

  it('lists users with an optional search term', async () => {
    kcAdminMock.listUsers.mockResolvedValue([{ id: 'u1' }]);

    await expect(controller.listUsers('alice')).resolves.toEqual([{ id: 'u1' }]);
    expect(kcAdminMock.listUsers).toHaveBeenCalledWith('alice');
  });

  it('creates an enabled user', async () => {
    kcAdminMock.createUser.mockResolvedValue({ success: true });

    await expect(
      controller.createUser({ username: 'alice', email: 'alice@example.com' }),
    ).resolves.toEqual({ success: true });

    expect(kcAdminMock.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, username: 'alice' }),
    );
  });

  it('blocks and unblocks users', async () => {
    kcAdminMock.setEnabled.mockResolvedValue({ success: true });

    await expect(controller.block('u1')).resolves.toEqual({ success: true });
    await expect(controller.unblock('u1')).resolves.toEqual({ success: true });

    expect(kcAdminMock.setEnabled).toHaveBeenCalledWith('u1', false);
    expect(kcAdminMock.setEnabled).toHaveBeenCalledWith('u1', true);
  });

  it('rejects missing password when setting a password', () => {
    expect(() => controller.setPassword('u1', '')).toThrow('Le mot de passe est requis');
  });

  it('sets a user password', async () => {
    kcAdminMock.setPassword.mockResolvedValue({ success: true });

    await expect(controller.setPassword('u1', 'NewPass123!')).resolves.toEqual({ success: true });
    expect(kcAdminMock.setPassword).toHaveBeenCalledWith('u1', 'NewPass123!');
  });

  it('deletes a user', async () => {
    kcAdminMock.deleteUser.mockResolvedValue({ success: true });

    await expect(controller.remove('u1')).resolves.toEqual({ success: true });
  });

  it('updates a user', async () => {
    kcAdminMock.updateUser.mockResolvedValue({ success: true });

    await expect(
      controller.updateUser('u1', {
        firstName: 'Alice',
        lastName: 'Doe',
        email: 'alice@example.com',
        attributes: { tier: 'gold' },
      }),
    ).resolves.toEqual({ success: true });
  });
});