import axios from 'axios';
import { KeycloakAdminService } from './keycloak-admin.service';

jest.mock('axios');

describe('KeycloakAdminService', () => {
  let service: KeycloakAdminService;
  const mockedAxios = axios as any;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.KEYCLOAK_URL = 'http://localhost:8085';
    process.env.KEYCLOAK_REALM = 'deepskyn';
    process.env.KEYCLOAK_ADMIN_CLIENT_ID = 'backend-admin';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'secret-admin';
    process.env.KEYCLOAK_FRONT_CLIENT_ID = 'frontend-client';
    process.env.KEYCLOAK_FRONT_CLIENT_SECRET = 'front-secret';

    mockedAxios.post = jest.fn();
    mockedAxios.put = jest.fn();
    mockedAxios.isAxiosError = jest.fn((error: any) => !!error?.isAxiosError);
    mockedAxios.mockResolvedValue({ data: {} });

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    service = new KeycloakAdminService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lists users without search filter', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue([{ id: 'u1' }]);

    await expect(service.listUsers()).resolves.toEqual([{ id: 'u1' }]);
    expect((service as any).executeRequest).toHaveBeenCalledWith(
      'get',
      expect.stringContaining('/admin/realms/deepskyn/users'),
    );
  });

  it('lists users with encoded search filter', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue([{ id: 'u1' }]);

    await service.listUsers('john doe');

    expect((service as any).executeRequest).toHaveBeenCalledWith(
      'get',
      expect.stringContaining('search=john%20doe'),
    );
  });

  it('gets a user successfully', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue({ id: 'user-1' });

    await expect(service.getUser('user-1')).resolves.toEqual({ id: 'user-1' });
  });

  it('wraps getUser failures with a clear message', async () => {
    jest.spyOn(service as any, 'executeRequest').mockRejectedValue(new Error('network issue'));

    await expect(service.getUser('user-1')).rejects.toThrow(
      'Échec de récupération utilisateur: network issue',
    );
  });

  it('rejects user creation without username', async () => {
    await expect(service.createUser({ username: '' })).rejects.toThrow(
      "Le nom d'utilisateur est requis",
    );
  });

  it('creates user and extracts id from location header', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue({
      location: 'http://localhost/users/kc-123',
    });

    await expect(
      service.createUser({
        username: 'alice',
        password: 'Pass123!',
        email: 'alice@example.com',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Utilisateur créé avec succès',
      id: 'kc-123',
    });
  });

  it('wraps createUser errors', async () => {
    jest.spyOn(service as any, 'executeRequest').mockRejectedValue(new Error('already exists'));

    await expect(service.createUser({ username: 'alice' })).rejects.toThrow(
      'Échec de la création utilisateur: already exists',
    );
  });

  it('enables or disables a user', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue({});

    await expect(service.setEnabled('u1', false)).resolves.toEqual({
      success: true,
      message: 'Utilisateur bloqué',
    });

    await expect(service.setEnabled('u1', true)).resolves.toEqual({
      success: true,
      message: 'Utilisateur débloqué',
    });
  });

  it('wraps setEnabled errors', async () => {
    jest.spyOn(service as any, 'executeRequest').mockRejectedValue(new Error('status denied'));

    await expect(service.setEnabled('u1', false)).rejects.toThrow(
      'Échec du changement de statut: status denied',
    );
  });

  it('sets password successfully', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue({});

    await expect(service.setPassword('u1', 'NewPass123!')).resolves.toEqual({
      success: true,
      message: 'Mot de passe mis à jour',
    });
  });

  it('wraps setPassword errors', async () => {
    jest.spyOn(service as any, 'executeRequest').mockRejectedValue(new Error('cannot set password'));

    await expect(service.setPassword('u1', 'bad')).rejects.toThrow(
      'Échec du changement de mot de passe: cannot set password',
    );
  });

  it('deletes user successfully', async () => {
    jest.spyOn(service as any, 'executeRequest').mockResolvedValue({});

    await expect(service.deleteUser('u1')).resolves.toEqual({
      success: true,
      message: 'Utilisateur supprimé',
    });
  });

  it('wraps deleteUser errors', async () => {
    jest.spyOn(service as any, 'executeRequest').mockRejectedValue(new Error('delete denied'));

    await expect(service.deleteUser('u1')).rejects.toThrow('Échec de la suppression: delete denied');
  });

  it('returns current token info edge case when no token exists', async () => {
    const info = await service.getCurrentTokenInfo();

    expect(info).toMatchObject({
      hasAccessToken: false,
      hasRefreshToken: false,
      isValid: false,
    });
  });

  it('rejects updateUser when payload has no updatable fields', async () => {
    await expect(service.updateUser('u1', {})).rejects.toThrow('Aucune donnée à mettre à jour');
  });

  it('updates user with token and payload', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios.put.mockResolvedValue({ data: {} });

    await expect(
      service.updateUser('u1', {
        firstName: 'Alice',
        email: 'alice@example.com',
        attributes: { tier: 'gold' },
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/admin/realms/deepskyn/users/u1'),
      expect.objectContaining({ firstName: 'Alice', email: 'alice@example.com' }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
      }),
    );
  });

  it('wraps updateUser axios failures', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios.put.mockRejectedValue(new Error('update crashed'));

    await expect(service.updateUser('u1', { email: 'x@y.z' })).rejects.toThrow(
      'Échec de la mise à jour: update crashed',
    );
  });

  it('verifyUserPassword returns true on successful token response', async () => {
    mockedAxios.post.mockResolvedValue({ data: { access_token: 'token' } });

    await expect(service.verifyUserPassword('alice', 'pass')).resolves.toBe(true);
  });

  it('verifyUserPassword returns false on failure', async () => {
    mockedAxios.post.mockRejectedValue(new Error('bad credentials'));

    await expect(service.verifyUserPassword('alice', 'bad-pass')).resolves.toBe(false);
  });

  it('onModuleInit triggers initial token acquisition', async () => {
    jest.spyOn(global, 'setInterval').mockImplementation((() => 0) as any);
    const tokenSpy = jest.spyOn(service as any, 'getValidToken').mockResolvedValue('init-token');

    await service.onModuleInit();

    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });

  it('checkAndRefreshToken requests token when none is cached', async () => {
    const tokenSpy = jest.spyOn(service as any, 'getValidToken').mockResolvedValue('fresh-token');
    (service as any).accessToken = null;
    (service as any).tokenExpiresAt = null;

    await (service as any).checkAndRefreshToken();

    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });

  it('checkAndRefreshToken refreshes when token is near expiry', async () => {
    const tokenSpy = jest.spyOn(service as any, 'getValidToken').mockResolvedValue('fresh-token');
    (service as any).accessToken = 'cached-token';
    (service as any).tokenExpiresAt = new Date(Date.now() + 30_000);

    await (service as any).checkAndRefreshToken();

    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });

  it('getValidToken returns cached access token when still valid', async () => {
    (service as any).accessToken = 'cached-token';
    (service as any).tokenExpiresAt = new Date(Date.now() + 60_000);

    await expect((service as any).getValidToken()).resolves.toBe('cached-token');
  });

  it('getValidToken uses refresh token branch when refresh token is valid', async () => {
    (service as any).accessToken = null;
    (service as any).tokenExpiresAt = null;
    (service as any).refreshToken = 'refresh-token';
    (service as any).refreshTokenExpiresAt = new Date(Date.now() + 60_000);
    const refreshSpy = jest.spyOn(service as any, 'refreshAccessToken').mockResolvedValue('refreshed-token');

    await expect((service as any).getValidToken()).resolves.toBe('refreshed-token');
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('getNewToken stores token data and uses default refresh expiry', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'new-access',
        expires_in: 120,
      },
    });

    await expect((service as any).getNewToken()).resolves.toBe('new-access');
    expect((service as any).accessToken).toBe('new-access');
    expect((service as any).refreshToken).toBeNull();
    expect((service as any).refreshTokenExpiresAt).toBeInstanceOf(Date);
  });

  it('refreshAccessToken keeps old refresh token when API does not return a new one', async () => {
    (service as any).refreshToken = 'old-refresh';
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'refreshed-access',
        expires_in: 300,
      },
    });

    await expect((service as any).refreshAccessToken()).resolves.toBe('refreshed-access');
    expect((service as any).refreshToken).toBe('old-refresh');
  });

  it('refreshAccessToken falls back to getNewToken on refresh error', async () => {
    (service as any).refreshToken = 'bad-refresh';
    mockedAxios.post.mockRejectedValue(new Error('refresh failed'));
    const newTokenSpy = jest.spyOn(service as any, 'getNewToken').mockResolvedValue('fallback-token');

    await expect((service as any).refreshAccessToken()).resolves.toBe('fallback-token');
    expect((service as any).refreshToken).toBeNull();
    expect(newTokenSpy).toHaveBeenCalledTimes(1);
  });

  it('executeRequest attaches JSON body for post and returns location header', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios.mockResolvedValue({
      data: { ok: true },
      headers: { location: 'http://localhost/item/42' },
    });

    const result = await (service as any).executeRequest('post', 'http://api/items', { name: 'x' });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: 'http://api/items',
        data: { name: 'x' },
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(result).toMatchObject({ ok: true, location: 'http://localhost/item/42' });
  });

  it('executeRequest retries once on 401 and succeeds', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401, data: {} },
        message: 'unauthorized',
      })
      .mockResolvedValueOnce({ data: { ok: true }, headers: {} });

    const result = await (service as any).executeRequest('get', 'http://api/items');

    expect(result).toEqual({ ok: true });
    expect(mockedAxios).toHaveBeenCalledTimes(2);
    expect((service as any).accessToken).toBeNull();
    expect((service as any).refreshToken).toBeNull();
  });

  it('executeRequest throws normalized axios error after retry limit', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 403,
        data: { error_description: 'forbidden' },
      },
      message: 'forbidden-msg',
    });

    await expect((service as any).executeRequest('get', 'http://api/items')).rejects.toThrow(
      'forbidden',
    );
  });

  it('executeRequest throws unknown error message for non-error throwables', async () => {
    jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token-abc');
    mockedAxios.mockRejectedValue('plain-string-error');

    await expect((service as any).executeRequest('get', 'http://api/items')).rejects.toThrow(
      'Erreur inconnue lors de la requête',
    );
  });

  it('verifyUserPassword omits client_secret when front secret is blank', async () => {
    process.env.KEYCLOAK_FRONT_CLIENT_SECRET = '   ';
    mockedAxios.post.mockResolvedValue({ data: { access_token: 'token' } });

    await expect(service.verifyUserPassword('alice', 'pass')).resolves.toBe(true);

    const body: URLSearchParams = mockedAxios.post.mock.calls[0][1];
    expect(body.get('client_secret')).toBeNull();
  });
});
