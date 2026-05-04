import axios from 'axios';
import { TokenRefreshService } from './token-refresh.service';

jest.mock('axios');

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;
  const mockedAxios = axios as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'setInterval').mockImplementation((() => 0) as any);
    service = new TokenRefreshService();
    process.env.KEYCLOAK_URL = 'http://localhost:8085';
    process.env.KEYCLOAK_REALM = 'deepskyn';
    process.env.KEYCLOAK_CLIENT_SECRET = 'secret';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores refresh token and marks access token as valid', () => {
    service.storeRefreshToken('u1', 'refresh-1', 'access-1', 3600);

    expect(service.isValidToken('access-1')).toBe(true);
  });

  it('returns false for unknown access tokens', () => {
    expect(service.isValidToken('unknown-token')).toBe(false);
  });

  it('throws for invalid refresh token', async () => {
    await expect(service.refreshAccessToken('missing')).rejects.toThrow('Refresh token invalide');
  });

  it('throws for expired refresh token and removes it', async () => {
    service.storeRefreshToken('u1', 'refresh-expired', 'access-old', -1);

    await expect(service.refreshAccessToken('refresh-expired')).rejects.toThrow(
      'Refresh token expiré',
    );

    await expect(service.refreshAccessToken('refresh-expired')).rejects.toThrow(
      'Refresh token invalide',
    );
  });

  it('refreshes access token and rotates refresh token on success', async () => {
    service.storeRefreshToken('u1', 'refresh-old', 'access-old', 1000);
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'access-new',
        refresh_token: 'refresh-new',
        expires_in: 1800,
      },
    });

    await expect(service.refreshAccessToken('refresh-old')).resolves.toEqual({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
    });

    expect(service.isValidToken('access-new')).toBe(true);
  });

  it('deletes refresh token and throws when Keycloak call fails', async () => {
    service.storeRefreshToken('u1', 'refresh-fail', 'access-old', 1000);
    mockedAxios.post.mockRejectedValue(new Error('keycloak down'));

    await expect(service.refreshAccessToken('refresh-fail')).rejects.toThrow(
      'Échec du rafraîchissement du token',
    );

    await expect(service.refreshAccessToken('refresh-fail')).rejects.toThrow(
      'Refresh token invalide',
    );
  });

  it('revokes refresh token on logout', async () => {
    service.storeRefreshToken('u1', 'refresh-logout', 'access-logout', 1000);

    service.revokeToken('refresh-logout');

    await expect(service.refreshAccessToken('refresh-logout')).rejects.toThrow(
      'Refresh token invalide',
    );
  });

  it('cleans expired tokens while keeping valid ones', async () => {
    service.storeRefreshToken('u1', 'refresh-expired-2', 'access-expired-2', -1);
    service.storeRefreshToken('u1', 'refresh-valid-2', 'access-valid-2', 3600);

    (service as any).cleanExpiredTokens();

    await expect(service.refreshAccessToken('refresh-expired-2')).rejects.toThrow(
      'Refresh token invalide',
    );
    expect(service.isValidToken('access-valid-2')).toBe(true);
  });

  it('returns false for access token mapped to an expired entry', () => {
    service.storeRefreshToken('u1', 'refresh-short', 'access-short', -1);

    expect(service.isValidToken('access-short')).toBe(false);
  });
});
